# Logaritminen aikajana

Interaktiivinen visualisointi, joka näyttää historian ja kosmoksen tapahtumat logaritmisella aikajanalla.

## Yleiskuva

Projektin tavoitteena on antaa hahmotus äärimmäisen pitkistä ja lyhyistä aikaskaaloista yhdellä näkymällä.  
Aikajana ulottuu **Alkuräjähdyksestä (13,8 mrd vuotta sitten) nykypäivään (2025)**.  

Visualisointi on pystysuuntainen, ja aikaskaala on **log₁₀(Δt)** – jokainen dekadi (10ⁿ) vie yhtä paljon tilaa näytöllä.  
Tapahtumat on ryhmitelty osittain päällekkäisiin teemoihin (esim. kosmos, biologia, ihmiskunta, historia, teknologia).  

## Ominaisuuksia

- **Zoomattava ja vieritettävä aikajana** (hiiren rulla, pinch/drag mobiilissa).
- **Teemakortit**: jokainen teema näkyy omana värillisenä korttinaan.
- **Klikkausaktivointi**: kortin voi tuoda etualalle.
- **Hover / tap kommentit**: tapahtumista avautuu lisätietoja.
- **Zoom bar** oikeassa reunassa näyttää mittakaavan ja zoomausalueen.
- **Mobiilituki**: skaalautuu myös puhelimille ja tableteille.

## Tekninen rakenne

Nykyinen versio (v33+) koostuu useista tiedostoista:

- `index.html` – sivun perusrakenne
- `style.css` – ulkoasut, värit, typografia
- `timeline.js` – D3.js-koodi: akselit, zoom, kortit, tapahtumat
- `eventsDB.json` – tietokanta tapahtumille (ryhmitelty teemoittain)

## Versiohistoria

- **v1–v22**  
  - Toteutus yhtenä isona HTML-tiedostona (~1000 riviä).  
  - Aikajana taulukkomuodossa, kaksi näkymää: kosminen ja historiallinen.  
  - Katso alkuperäinen README: [log-aikajana v22](https://github.com/JukkaTLinjama/log-aikajana/blob/main/README.md).

- **v23–v32**  
  - D3.js otettiin mukaan.  
  - Ensimmäiset kortit ja zoomaus.  
  - Kokeiluja eri asettelulla ja tyyleillä.  
  - **Demo**: [v32 GitHub Pages](https://jukkatlinjama.github.io/log-aikajana/)

- **v33**  
  - Iso rakenteellinen muutos: projekti jaettiin tiedostoihin (`index.html`, `style.css`, `timeline.js`, `eventsDB.json`).  
  - Zoom bar lisättiin oikeaan reunaan.  
  - Info-paneeli ja interaktiiviset kommentit.

- **v34–v35**  
  - Kerrosjärjestyksen hallinta: kortit, akselit, zoom bar eivät peitä toisiaan.  
  - Typografian ja värien hienosäätö.  
  - Mobiilioptimointeja (fonttikoot, hitboxit).  
  - Automaattinen fokusointi **ihmiskunta**-korttiin zoom-animaatiolla.

## Lisenssi

© 2025 Jukka Linjama  
Julkaistu [Creative Commons BY 4.0](https://creativecommons.org/licenses/by/4.0/) -lisenssillä.  
Saat vapaasti käyttää, muokata ja jakaa, kunhan mainitset alkuperäisen tekijän.  

---

- **Uusin demo**: [v38 GitHub Pages](https://jukkatlinjama.github.io/log-aikajana-v33/)

📄 Katso myös [CHANGELOG.md](./CHANGELOG.md) tarkempiin versiotietoihin.  
