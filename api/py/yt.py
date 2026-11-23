"""Ricerca TUTORIAL di uncinetto su YouTube (stesso motore di VolantiGo: YouTube Data API se c'è YOUTUBE_API_KEY, altrimenti yt-dlp).
GET /api/py/yt?q=amigurumi&level=principianti   header x-internal-key

Tiene solo i video che insegnano a fare qualcosa (tutorial, lezioni, passo passo) e scarta le dimostrazioni di lavori finiti
(vetrine, compilation, timelapse, short, unboxing). Scarta anche i video che si dichiarano generati con l'AI.
Sono indizi su titolo, descrizione e durata: non una garanzia, per questo la pagina lascia sempre l'ultima parola all'utente.
"""
import html, json, os, re, urllib.parse, urllib.request
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

AI_MARK = re.compile(r"\b(ai[ -]?generat\w*|generat\w* (da|con) (ai|ia|intelligenza)|made with ai|ai video|ia generat\w*|artificial intelligence|sora|veo ?\d?|midjourney|text[- ]to[- ]video)\b", re.I)
LEVELS = {"principianti": "per principianti", "intermedio": "livello intermedio", "esperte": "per esperte"}

# Titolo che promette di insegnare
POS_TITLE = re.compile(r"\b(tutorial|passo[ -]?(a )?passo|step[ -]?by[ -]?step|come (si )?(fa|fare|faccio|realizzare|lavorare|eseguire|iniziare|cominciare|creare|costruire)|lezione|lezioni|impariamo|imparare|impara|spiegazione|spiegat\w+|spiego|per principianti|principianti|corso|guida|istruzioni|how to|lesson|learn)\b", re.I)
# Titolo da dimostrazione, vetrina o intrattenimento
NEG_TITLE = re.compile(r"(showcase|\bhaul\b|unboxing|\bho (fatto|realizzato|creato|finito)\b|\bi miei (lavori|progetti|amigurumi|creazioni)\b|\blavori (finiti|fatti)\b|ispirazion\w+|\b\d+ idee\b|\bidee (regalo|per)\b|compilation|raccolta|time[- ]?lapse|\bspeed(ed)?\b|satisfying|\basmr\b|preview|anteprima|\bvlog\b|giveaway|\bfinito\b|risultato finale|work in progress|\bwip\b|\blive\b|diretta|recensione|\breview\b|#shorts?|\bshorts?\b|\bfeat\b|mercatino|vendita)", re.I)
# Descrizione tipica di un tutorial
POS_DESC = re.compile(r"(occorrente|materiali|ti serve|ti servono|ti servir\w+|abbreviazioni|punti utilizzati|punti usati|passo[ -]?passo|tutorial|istruzioni|schema|spiego|ripeti|ripetere|maglia (bassa|alta|alta doppia)|catenella|anello magico|\bgiro \d|\bgiri\b|capitoli|chapters)", re.I)
TIMESTAMP = re.compile(r"(?m)^\s*\(?\d{1,2}:\d{2}")
MIN_SCORE = 2


def build_query(raw_q: str, level: str) -> str:
    clean = re.sub(r"\s+", " ", raw_q).strip()[:80]
    if not clean:
        return ""
    base = clean if "uncinetto" in clean.lower() else f"uncinetto {clean}"
    if not POS_TITLE.search(base):
        base += " tutorial passo passo"
    lv = LEVELS.get(level)
    return f"{base} {lv}" if lv else base


def is_ai(title: str, channel: str) -> bool:
    return bool(AI_MARK.search(title or "") or AI_MARK.search(channel or ""))


def tutorial_score(title: str, description: str = "", tags=None, duration=None, live: bool = False):
    """Restituisce (punteggio, motivo). Tutorial se il punteggio è >= MIN_SCORE e nessun segnale forte di dimostrazione."""
    title, description = title or "", description or ""
    if live:
        return -9, "diretta"
    if duration is not None and duration < 120:
        return -9, "troppo breve per insegnare"
    if duration is not None and duration > 5400:
        return -9, "troppo lungo"
    pos_t, neg_t = bool(POS_TITLE.search(title)), bool(NEG_TITLE.search(title))
    if neg_t and not pos_t:
        return -9, "titolo da dimostrazione"
    text = description[:2500] + " " + " ".join(tags or [])
    desc_hits = len(set(m.group(0).lower() for m in POS_DESC.finditer(text)))
    chapters = len(TIMESTAMP.findall(description)) >= 3
    score = (3 if pos_t else 0) - (4 if neg_t else 0)
    score += min(3, desc_hits) + (1 if chapters else 0)
    if duration is not None:
        score += 2 if 240 <= duration <= 2400 else (-2 if duration < 240 else -1)
    # la durata da sola non prova nulla: serve almeno un indizio vero (parola da lezione nel titolo, oppure materiali/capitoli/istruzioni nella descrizione)
    if not (pos_t or desc_hits >= 2 or chapters):
        return min(score, MIN_SCORE - 1), "nessun indizio di tutorial"
    return score, "ok" if score >= MIN_SCORE else "pochi indizi di tutorial"


def iso_seconds(s: str):
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or "")
    if not m:
        return None
    d, h, mi, se = (int(x or 0) for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + se


def _api(path: str, params: dict, key: str) -> dict:
    with urllib.request.urlopen("https://www.googleapis.com/youtube/v3/" + path + "?" + urllib.parse.urlencode({**params, "key": key}), timeout=12) as r:
        return json.loads(r.read().decode("utf-8"))


def find_videos(raw_q: str, level: str) -> list:
    """Candidati grezzi (fino a 25): id, titolo, canale, durata se già nota."""
    full_q = build_query(raw_q, level)
    if not full_q:
        return []
    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    if key:
        try:
            d = _api("search", {"part": "snippet", "q": full_q, "type": "video", "videoEmbeddable": "true",
                                "maxResults": 25, "relevanceLanguage": "it"}, key)
            out = []
            for it in d.get("items") or []:
                vid = (it.get("id") or {}).get("videoId")
                sn = it.get("snippet") or {}
                if vid:
                    out.append({"id": vid, "title": html.unescape(sn.get("title") or "")[:110], "channel": html.unescape(sn.get("channelTitle") or "")[:60], "duration": None})
            if out:
                return out
        except Exception:
            pass
    import yt_dlp
    with yt_dlp.YoutubeDL({"quiet": True, "extract_flat": True, "skip_download": True, "no_warnings": True}) as y:
        info = y.extract_info(f"ytsearch25:{full_q}", download=False)
    out = []
    for e in (info.get("entries") or []):
        vid = e.get("id")
        if not vid or not re.match(r"^[A-Za-z0-9_-]{8,16}$", str(vid)):
            continue
        dur = e.get("duration")
        out.append({"id": str(vid), "title": str(e.get("title") or "")[:110], "channel": str(e.get("channel") or e.get("uploader") or "")[:60],
                    "duration": int(dur) if isinstance(dur, (int, float)) and dur > 0 else None})
    return out


NOTE: list = []  # primo errore di lettura dei canali, per la diagnosi


def enrich_api(videos: list, key: str) -> list:
    """Con YOUTUBE_API_KEY: durata, descrizione, tag e iscritti dalla API ufficiale (dai server cloud yt-dlp è bloccato da YouTube)."""
    ids = ",".join(v["id"] for v in videos[:50])
    vd = {i["id"]: i for i in _api("videos", {"part": "snippet,contentDetails", "id": ids, "maxResults": 50}, key).get("items", [])}
    cids = ",".join({(i.get("snippet") or {}).get("channelId", "") for i in vd.values() if (i.get("snippet") or {}).get("channelId")})
    ch = {c["id"]: c for c in _api("channels", {"part": "statistics", "id": cids, "maxResults": 50}, key).get("items", [])} if cids else {}
    out = []
    for v in videos:
        item = vd.get(v["id"]) or {}
        sn, cd = item.get("snippet") or {}, item.get("contentDetails") or {}
        desc, tags = str(sn.get("description") or ""), sn.get("tags") or []
        if is_ai(v["title"], v["channel"]) or AI_MARK.search(desc[:1500] + " " + " ".join(tags)):
            continue
        dur = iso_seconds(cd.get("duration")) if cd.get("duration") else v.get("duration")
        score, _ = tutorial_score(v["title"], desc, tags, dur, live=sn.get("liveBroadcastContent") in ("live", "upcoming"))
        st = (ch.get(sn.get("channelId")) or {}).get("statistics") or {}
        subs = int(st["subscriberCount"]) if st.get("subscriberCount") and not st.get("hiddenSubscriberCount") else None
        out.append({**v, "duration": dur, "subs": subs, "verified": False, "score": score})
    return out


def enrich_ytdlp(videos: list) -> list:
    """Senza chiave: titolo, descrizione e durata via yt-dlp (da IP cloud YouTube può bloccarlo: in quel caso si valutano titolo e durata)."""
    import yt_dlp
    from concurrent.futures import ThreadPoolExecutor
    opts = {"quiet": True, "skip_download": True, "no_warnings": True, "noplaylist": True, "socket_timeout": 10,
            "extractor_args": {"youtube": {"skip": ["dash", "hls", "translated_subs"]}}}

    def one(v):
        try:
            with yt_dlp.YoutubeDL(opts) as y:
                i = y.extract_info("https://www.youtube.com/watch?v=" + v["id"], download=False, process=False)
            desc, tags = str(i.get("description") or ""), i.get("tags") or []
            if is_ai(v["title"], v["channel"]) or AI_MARK.search(desc[:1500] + " " + " ".join(tags)):
                return None
            dur = int(i["duration"]) if isinstance(i.get("duration"), (int, float)) else v.get("duration")
            score, _ = tutorial_score(v["title"], desc, tags, dur, live=bool(i.get("is_live")))
            subs = i.get("channel_follower_count")
            return {**v, "duration": dur, "subs": int(subs) if isinstance(subs, (int, float)) else None, "verified": bool(i.get("channel_is_verified")), "score": score}
        except Exception as e:
            NOTE.append(str(e)[:160])
            score, _ = tutorial_score(v["title"], "", None, v.get("duration"))
            return {**v, "subs": None, "verified": False, "score": score} if not is_ai(v["title"], v["channel"]) else None
    with ThreadPoolExecutor(4) as ex:
        return [x for x in ex.map(one, videos[:16]) if x]


def pick_tutorials(videos: list) -> list:
    """Tiene i tutorial veri e li ordina: prima il punteggio più alto, a parità i canali con più iscritti."""
    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    rich = None
    if key:
        try:
            rich = enrich_api(videos, key)
        except Exception as e:
            NOTE.append("api: " + str(e)[:120])
    if rich is None:
        try:
            rich = enrich_ytdlp(videos)
        except Exception as e:
            NOTE.append(str(e)[:120])
            rich = []
            for v in videos:
                if not is_ai(v["title"], v["channel"]):
                    s, _ = tutorial_score(v["title"], "", None, v.get("duration"))
                    rich.append({**v, "subs": None, "verified": False, "score": s})
    keep = [v for v in rich if v["score"] >= MIN_SCORE]
    keep.sort(key=lambda v: (-v["score"], -(v.get("subs") or 0)))
    return [{k: v.get(k) for k in ("id", "title", "channel", "duration", "subs", "verified")} for v in keep[:8]]


class handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        key = os.environ.get("INTERNAL_KEY", "")
        if not key or self.headers.get("x-internal-key") != key:
            return self._send(401, {"error": "unauthorized"})
        qs = parse_qs(urlparse(self.path).query)
        q = (qs.get("q") or [""])[0]
        level = (qs.get("level") or [""])[0]
        if len(q.strip()) < 2:
            return self._send(400, {"error": "query troppo corta"})
        try:
            NOTE.clear()
            vids = pick_tutorials(find_videos(q, level))
            self._send(200, {"videos": vids, "enrich_error": NOTE[0] if NOTE else None})
        except Exception as e:
            self._send(502, {"error": f"ricerca video non riuscita: {str(e)[:150]}"})
