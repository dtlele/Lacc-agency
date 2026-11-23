"""Test del filtro tutorial/dimostrazione. Esecuzione: python -m unittest api/py/test_yt.py (dalla radice)"""
import os, sys, unittest
sys.path.insert(0, os.path.dirname(__file__))
import yt

DESC_TUTORIAL = "Occorrente: filo di cotone, uncinetto 3 mm.\n00:00 Introduzione\n01:10 Anello magico\n04:30 Primo giro\nRipeti per 6 volte."


class Tutorial(unittest.TestCase):
    def ok(self, title, desc="", dur=700, tags=None):
        s, _ = yt.tutorial_score(title, desc, tags, dur)
        return s >= yt.MIN_SCORE

    def test_tutorial_veri(self):
        self.assertTrue(self.ok("Tutorial orsetto amigurumi - parte 1"))
        self.assertTrue(self.ok("Lezione 55 - Punto Ventagli Bicolore"))
        self.assertTrue(self.ok("Come realizzare il punto ventaglio", DESC_TUTORIAL))
        self.assertTrue(self.ok("Impariamo a fare gli amigurumi! Lezione #1", dur=553))

    def test_dimostrazioni_scartate(self):
        self.assertFalse(self.ok("I miei lavori all'uncinetto del 2026", DESC_TUTORIAL))
        self.assertFalse(self.ok("Showcase amigurumi: la mia collezione"))
        self.assertFalse(self.ok("Orsetto amigurumi time lapse", dur=900))
        self.assertFalse(self.ok("10 idee regalo all'uncinetto"))
        self.assertFalse(self.ok("Haul filati e uncinetti"))
        self.assertFalse(self.ok("Borsa all'uncinetto finito risultato finale"))

    def test_durata(self):
        self.assertFalse(self.ok("Tutorial amigurumi", dur=45))       # short
        self.assertFalse(self.ok("Tutorial amigurumi", dur=7200))     # maratona
        self.assertFalse(yt.tutorial_score("Tutorial amigurumi", "", None, 900, live=True)[0] >= yt.MIN_SCORE)

    def test_titolo_neutro_serve_descrizione(self):
        self.assertFalse(self.ok("Orsetto amigurumi", "", dur=700))
        self.assertTrue(self.ok("Orsetto amigurumi", DESC_TUTORIAL, dur=700))

    def test_titolo_con_entrambi_i_segnali_vince_la_vetrina(self):
        self.assertFalse(self.ok("Tutorial? Guarda i miei lavori finiti", "", dur=700))

    def test_iso_seconds(self):
        self.assertEqual(yt.iso_seconds("PT9M17S"), 557)
        self.assertEqual(yt.iso_seconds("PT1H2M"), 3720)
        self.assertEqual(yt.iso_seconds("PT45S"), 45)

    def test_query_aggiunge_tutorial(self):
        self.assertIn("tutorial", yt.build_query("amigurumi", ""))
        self.assertNotIn("tutorial passo passo tutorial", yt.build_query("tutorial punto", ""))

    def test_ai_dichiarata(self):
        self.assertTrue(yt.is_ai("Orsetto AI generated", ""))
        self.assertFalse(yt.is_ai("Orsetto amigurumi", "Maria"))


if __name__ == "__main__":
    unittest.main()
