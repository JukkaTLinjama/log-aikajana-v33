# Logaritminen aikajana — versio 38b

## Yleistä
Interaktiivinen D3.js-pohjainen aikajana, joka visualisoi historian tapahtumia logaritmisella aikaskaalalla.  
Tämä versio pohjautuu v37–38 kehitykseen ja sisältää useita käyttöliittymän ja mobiiliyhteensopivuuden parannuksia.

---

## Uudet ominaisuudet ja muutokset

### 1. Täysnäyttö iOS/Chrome
- Korjauksia `meta viewport` ja `100dvh` käyttöön, jotta sivu täyttää mobiiliselaimen ruudun mahdollisimman hyvin.
- Estetty selaimen pitkä painallus -valikko (`-webkit-user-select: none; -webkit-touch-callout: none;` aikajanan alueella).

### 2. Otsikko ja marginaalit
- Otsikon (`h1#page-title`) fonttikokoa pienennetty ja ohennettu.
- Lisätty enemmän tyhjää tilaa otsikon alle.
- **ResizeObserver** säätää headerin korkeuden (`--header-h`) dynaamisesti, jotta layout pysyy tasapainossa eri ruuduilla.

### 3. Info-paneeli
- Info-toggle-symboli (`?`) muutettu oranssiksi ja läpikuultavaksi, sijoitus otsikon päälle.
- Pienennetty ja vaimennettu visuaalisesti, jotta ei häiritse sisältöä.
- Linkkien värit muutettu paremmin näkyviksi tummalla taustalla (ei enää oletussininen).

### 4. Kortit ja värit
- Palautettu teemakorttien värit (aiemmin kadonneet).
- Kortin aktivointi: viive (1500 ms) ennen automaattista zoomausta ja **ihmiskunta**-kortin pehmeää aktivointia.
- Aktivointi nyt suoritetaan ennen zoom-animaatiota → värit säilyvät ja zoom kohdistuu oikeaan korttiin.

### 5. Mobiili UX
- Estetty tekstien copy-valikko aikajanan alueella.
- Tooltip-kommentit ja tapahtumien long-press toimivat edelleen.

---

## Tunnetut rajoitteet
- iOS Chrome ei vieläkään tue täysin "true fullscreen" ilman PWA-asennusta (homescreen add-to).  
- Zoomaus ja scrollaus toimivat, mutta mobiililaitteen selain-UI voi vielä jättää pieniä marginaaleja.

---

## Tiedostot
- `index.html` — rakenne ja meta.
- `style.css` — ulkoasun ja mobiiliyhteensopivuuden parannukset.
- `timeline.js` — logiikka, automaattinen zoom/aktivointi ja ResizeObserver-korjaukset.
- `eventsDB.json` — tapahtumat.

---

## Changelog
- v38a → Info-toggle oranssiksi ja otsikon fontti sirommaksi.
- v38b → Viiveellinen automaattinen aktivointi ja zoom, marginaalit otsikon alle, värit palautettu.

---

© 2025 Jukka Linjama · CC BY 4.0
