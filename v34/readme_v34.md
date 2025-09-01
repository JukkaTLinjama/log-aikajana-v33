# Logaritminen aikajana — v34

> **HUOM (v33 → uusi rakenne):** v33:ssa siirryttiin *kokonaan uuteen* ja selkeämpään rakenteeseen.  
> Alla on rakennekuvaus sekä v34:ään tehdyt lisäykset.

## Rakenne (v33+)

**Tiedostot**
- `index.html` — kevyt HTML-runko: otsikko, info-nappi/laatikko, `#timeline-container` ja `<svg id="timeline">`, + `#page-footer`.
- `style.css` — tumma teema, CSS‑muuttujat (`--header-h`, `--footer-h`), responsiivinen `#timeline-container` (korkeus `calc(100dvh - var(--header-h) - var(--footer-h))`), akselin & korttien ulkoasu.
- `timeline.js` — kaikki D3-logiikka yhdessä IIFE‑lohkossa: mittaus, skaala, zoom, akseli, kortit, zoom‑indikaattori.
- `eventsDB.json` — data (teemat + tapahtumat). Lataus `fetch()` → flatten: jokaiselle eventille lisätään `theme`.

**SVG‑ryhmät (`timeline.js`)**
- `gRoot` — pääcontainer marginaalien sisällä.
  - `gAxis` — vasen log‑akseli (vain 10^n labelit).
  - `gMinor` — minor‑tikkien viivat (2..9×10^n), numerot näytetään vain harvassa zoomissa.
  - `gCards` — teemakortit + tapahtumat (clip‑path).
- `gZoom` — oikean reunan zoom‑palkki (`zoomBG` + `zoomWin`). `zoomWin` raahattavissa.

**Data‑polku**
1) `loadData()` hakee `eventsDB.json` → `state.events`.  
2) `state.themes = unique(events.theme)` ja värit `colorForTheme()`.  
3) `computeDomainFromData()` asettaa `state.minYears..maxYears`.  
4) `layout()` rakentaa skaalat ja zoom‑palkin, `drawAxis()` + `drawCards()` renderöi.

**Skaalat**
- `state.yBase = d3.scaleLog().domain([minYears, maxYears]).range([innerH, 0])`  
  – **nykyhetki alhaalla**, menneisyys ylhäällä.  
- `state.y = state.yBase.copy()` (päivittyy zoomissa).

**Akseli ja minor‑logiikka**
- Major‑tikit: 10^n (label muotoiltu **`1 10^n`**).
- Minor‑tikit (2..9×10^n): **viivat aina**, numerot vain kun pikseliväli riittää (ei päällekkäin).

**Zoom**
- D3 `zoom()`; `transform.rescaleY(yBase)` → domain clampataan data‑rajoihin.  
- Oikean reunan `zoomWin` näyttää näkyvän alueen: korkeus = `H / k`, sijainti = `-ty / k`, **clamp** reunoihin.
- (Valinn.) Katkoviivat yhdistävät palkin ikkunan näkyvään akselialueeseen.

**Layout & CSS**
- Headerin korkeus mitataan JS:llä ja viedään CSS:ään `--header-h`.  
- Footerin korkeus `--footer-h`.  
- `#timeline-container` leikkaa ylivuodon (`overflow: hidden; border-radius`).

---

## Uutta v34:ssa

- **Footer minimoitu** (CSS‑muuttujalla), teksti pienempi → enemmän tilaa aikajanalle.
- **Akseli & tekstit valkoiseksi** tummaa taustaa vasten.
- **Suunnan vaihto:** menneisyys ylhäällä; nykyhetki alhaalla (skaalan `range` käännetty).
- **Zoom‑indikaattorin clamp:** ei valu palkin yli.
- **Minor‑tikit:** viivat aina, numerot poistuvat tiheässä — ei päällekkäin.
- **Clip‑rect‑ajoitus:** kortit eivät enää leikkaudu vahingossa.

---

## Asennus / ajo

Avaa `index.html` selaimessa (esim. VSCode Live Server).  
Jos `eventsDB.json` ei lataudu, koodi käyttää fallback‑dataa.

---

## Changelog (tiivis)

- v31: mobiilihuomiot, hitbox zoom‑palkkiin, info‑paneelin parannus.  
- v32: zoom‑indikaattorin vuotokorjaus ja alkutila.  
- v33: siivottu arkkitehtuuri (tämä v33‑rakenne), footer/otsikko CSS‑muuttujilla.  
- **v34**: yllä kuvatut parannukset (suunta, värit, minor‑logiikka, clamp, footer min).

---

© 2025 Jukka Linjama · CC BY 4.0
