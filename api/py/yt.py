"""Ricerca tutorial di uncinetto su YouTube (stesso motore di VolantiGo: YouTube Data API se c'è YOUTUBE_API_KEY, altrimenti yt-dlp).
GET /api/py/yt?q=amigurumi&level=principianti   header x-internal-key
Esclude i video che si dichiarano generati con l'AI. Non è una verifica di autenticità: filtra solo ciò che è dichiarato nel titolo o nel canale.
"""
import json, os, re, urllib.parse, urllib.request
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

AI_MARK = re.compile(r"\b(ai[ -]?generat\w*|generat\w* (da|con) (ai|ia|intelligenza)|made with ai|ai video|ia generat\w*|artificial intelligence|sora|veo ?\d?|midjourney|text[- ]to[- ]video)\b", re.I)
LEVELS = {"principianti": "per principianti", "intermedio": "livello intermedio", "esperte": "per esperte"}


def build_query(raw_q: str, level: str) -> str:
    clean = re.sub(r"\s+", " ", raw_q).strip()[:80]
    if not clean:
        return ""
    base = clean if "uncinetto" in clean.lower() else f"uncinetto {clean}"
    if not any(k in base.lower() for k in ("tutorial", "come fare", "passo passo")):
        base += " tutorial"
    lv = LEVELS.get(level)
    return f"{base} {lv}" if lv else base


def is_ai(title: str, channel: str) -> bool:
    return bool(AI_MARK.search(title or "") or AI_MARK.search(channel or ""))


def find_videos(raw_q: str, level: str) -> list:
    full_q = build_query(raw_q, level)
    if not full_q:
        return []
    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    if key:
        try:
            url = "https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode({
                "part": "snippet", "q": full_q, "type": "video", "videoEmbeddable": "true",
                "maxResults": 12, "relevanceLanguage": "it", "key": key,
            })
            with urllib.request.urlopen(url, timeout=12) as r:
                d = json.loads(r.read().decode("utf-8"))
            out = []
            for it in d.get("items") or []:
                vid = (it.get("id") or {}).get("videoId")
                sn = it.get("snippet") or {}
                t, c = (sn.get("title") or "")[:110], (sn.get("channelTitle") or "")[:60]
                if vid and not is_ai(t, c):
                    out.append({"id": vid, "title": t, "channel": c, "duration": None})
            if out:
                return out[:8]
        except Exception:
            pass
    import yt_dlp
    with yt_dlp.YoutubeDL({"quiet": True, "extract_flat": True, "skip_download": True, "no_warnings": True}) as y:
        info = y.extract_info(f"ytsearch14:{full_q}", download=False)
    good, other = [], []
    for e in (info.get("entries") or []):
        vid = e.get("id")
        if not vid or not re.match(r"^[A-Za-z0-9_-]{8,16}$", str(vid)):
            continue
        title = str(e.get("title") or "")[:110]
        channel = str(e.get("channel") or e.get("uploader") or "")[:60]
        if is_ai(title, channel):
            continue
        dur = e.get("duration")
        item = {"id": str(vid), "title": title, "channel": channel,
                "duration": int(dur) if isinstance(dur, (int, float)) and dur > 0 else None}
        # niente short da pochi secondi né dirette/maratone da ore
        (good if (item["duration"] is not None and 90 <= item["duration"] <= 3600) else other).append(item)
    return (good + other)[:8]


def enrich(videos: list) -> list:
    """Segnali sul canale (iscritti, spunta di verifica) e controllo AI anche su descrizione e tag. Se qualcosa va storto, i video restano com'erano."""
    try:
        import yt_dlp
        from concurrent.futures import ThreadPoolExecutor
        opts = {"quiet": True, "skip_download": True, "no_warnings": True, "noplaylist": True, "socket_timeout": 10,
                "extractor_args": {"youtube": {"skip": ["dash", "hls", "translated_subs"]}}}

        def one(v):
            try:
                with yt_dlp.YoutubeDL(opts) as y:
                    i = y.extract_info("https://www.youtube.com/watch?v=" + v["id"], download=False, process=False)
                text = " ".join([str(i.get("description") or "")[:1500], " ".join(i.get("tags") or [])])
                subs = i.get("channel_follower_count")
                return {**v, "subs": int(subs) if isinstance(subs, (int, float)) else None,
                        "verified": bool(i.get("channel_is_verified")), "ai": is_ai(v["title"], v["channel"]) or bool(AI_MARK.search(text))}
            except Exception:
                return {**v, "subs": None, "verified": False, "ai": False}
        with ThreadPoolExecutor(4) as ex:
            out = list(ex.map(one, videos))
        return [{k: x[k] for k in ("id", "title", "channel", "duration", "subs", "verified")} for x in out if not x["ai"]]
    except Exception:
        return videos


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
            self._send(200, {"videos": enrich(find_videos(q, level))})
        except Exception as e:
            self._send(502, {"error": f"ricerca video non riuscita: {str(e)[:150]}"})
