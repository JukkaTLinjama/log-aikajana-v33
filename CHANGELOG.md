# Changelog – Logaritminen aikajana

Tämä tiedosto dokumentoi projektin kehityksen tärkeimmät vaiheet ja versiot.

## v1–v22 (2025-06–2025-08)
- Toteutus yhtenä isona HTML-tiedostona (~1000 riviä).
- Visualisointi taulukkomuodossa:
  - **Kosminen aikajana** (Alkuräjähdys → nykypäivä).
  - **Historiallinen aikajana** (nykypäivä → menneisyys 13 mrd vuotta).
- Jokainen tapahtuma sisälsi:
  - Ajan kuluneena vuosina ja sekunteina.
  - log₁₀(Δt)-arvon.
- Katso myös alkuperäinen README: [log-aikajana v22](https://github.com/JukkaTLinjama/log-aikajana/blob/main/README.md).

## v23–v32
- D3.js otettiin käyttöön.
- Ensimmäiset kortit ja zoomausominaisuudet.
- Kokeiluja:
  - Eri asettelut ja korttien värit.
  - Maskiefektit ja läpinäkyvyydet.
  - Info-laatikot ja hover-tekstit.

## v33
- Merkittävä rakenteellinen muutos:
  - Projekti jaettiin tiedostoihin:
    - `index.html`
    - `style.css`
    - `timeline.js`
    - `eventsDB.json`
- Zoom bar lisättiin oikeaan reunaan.
- Info-paneeli ja interaktiiviset kommentit tulivat mukaan.
- Käytettävyyden parannuksia mobiilissa.

## v34
- Zoom bar -tausta erotettiin varsinaisesta ikkunasta.
- Akselien ja minor grid -viivojen piirtäminen parannettiin.
- Korttien ja akselien välinen leikkausalue lisättiin (clip-path).
- Tekstien skaalaus ja tyylit tarkennettiin.

## v35
- Kerrosjärjestyksen hallinta:
  - Kortit, akselit ja zoom bar eivät peitä toisiaan.
- Typografian ja värien hienosäätö.
- Mobiilioptimointeja (fonttikoot, hitboxit, serif-fonttikokeilu).
- Automaattinen fokusointi **ihmiskunta**-korttiin latauksessa.

---

© 2025 Jukka Linjama – Julkaistu [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
