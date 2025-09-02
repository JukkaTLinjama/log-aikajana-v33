// timeline.js — v36
// Huom: tämä korvaa aiemman katkenneen tiedoston. Kaikki nimet pidetty yksinkertaisina
// ja "svg" yms. määritellään vain kerran, jotta "already been declared" ei tule.
// Akseli = log(time_years). Ala = nykyhetki (1 vuosi), ylös = kaukaisempi menneisyys.

(() => {
    const cfg = {
        margin: { top: 12, right: 54, bottom: 12, left: 54 },
        zoomBar: { width: 22, gap: 10 },     // oikean reunan zoom-palkki
        card: { minW: 160, pad: 10 },
        palette: ["#b6c8d4", "#70a8c6", "#4b9fa8", "#4dbc82", "#7be2a3"] // korttien värit
    };

    // --- tila ---
    const state = {
        width: 0, height: 0,
        yBase: null, y: null,
        zoom: null,
        minYears: .01, maxYears: 1e10,        // alustava; päivitetään datasta
        events: [],
        themes: [],
        themeColors: new Map()
    };

    // --- perusvalinnat ---
    const svg = d3.select("#timeline");
    const container = document.getElementById("timeline-container");

    // pää-ryhmät
    const gRoot = svg.append("g").attr("class", "root");
    const gAxis = gRoot.append("g").attr("class", "axis");
    const gCards = gRoot.append("g").attr("class", "cards");
    const gMinor = gRoot.append("g").attr("class", "minor-grid");

    // zoom bar oikealle
    const gZoomTrack = svg.insert("g", ".root").attr("class", "zoomBar"); // v35: tausta alle
    const gZoom = svg.append("g").attr("class", "zoomBar");         // ikkuna + hitbox päälle
    const zoomBG = gZoomTrack.append("rect").attr("class", "track");
    // v36: ikkuna alimman tason track-ryhmään → ei peitä sisältöä
    const zoomWin = gZoomTrack.append("rect").attr("class", "window").attr("rx", 3).attr("ry", 3);

    // leveä näkymätön tartunta-alue (drag)
    const HIT_PAD_LEFT = 14, HIT_PAD_RIGHT = 14, HIT_EXTRA_RIGHT_SCALE = 1.0, HIT_SCALE = 1.15;
    const zoomHit = gZoom.append("rect")
        .attr("class", "hit")
        .style("pointer-events", "all");
    zoomHit.attr("opacity", 0); // varmistus: hitbox ei koskaan näy

    // v36: varmista kerrosjärjestys heti luontivaiheessa
    setZOrder();


    // --- apufunktiot ---
    function setZOrder() {      // v35: eksplisiittinen kerrosjärjestys
        gZoomTrack.lower();      // alin: taustaraita
        gRoot.raise();           // kortit + akselit päälle
        gZoom.raise();           // päällimmäiseksi: oranssi ikkuna + hitbox
    }

    function layout() {
        state.width = container.clientWidth;
        state.height = container.clientHeight;

        // koko svg ja rootin paikka (akselille vasen marginaali)
        svg.attr("width", state.width).attr("height", state.height);
        gRoot.attr("transform", `translate(${cfg.margin.left-24},${cfg.margin.top})`);

        // y-skaala: log(time_years): ala=nyky, ylös=menneisyys
        const innerH = innerHeight();
        state.yBase = d3.scaleLog().domain([state.minYears, state.maxYears]).range([0, innerH]); // menneisyys alas
        state.y = state.yBase.copy();

        // zoom bar oikealle reunan tuntumaan
        const zx = state.width - cfg.margin.right + cfg.zoomBar.gap + 36; // v35: lisää oikealle
        const zy = cfg.margin.top;
        gZoomTrack.attr("transform", `translate(${zx},${zy})`);
        gZoom.attr("transform", `translate(${zx},${zy})`);

        zoomBG.attr("x", 0).attr("y", 0).attr("width", cfg.zoomBar.width).attr("height", innerH);
        zoomWin.attr("x", 2).attr("width", cfg.zoomBar.width - 4).attr("y", 0).attr("height", innerH - 1);

        setZOrder();  // v35: varmistetaan ettei track koskaan peitä tekstejä
        // alustava zoom-ikkuna = koko alue
        zoomWin.attr("x", 2).attr("width", cfg.zoomBar.width - 4).attr("y", 0).attr("height", innerH - 1); // synkassa taustan kanssa
    }

    function innerWidth() { return Math.max(0, state.width - cfg.margin.left - cfg.margin.right); }
    function innerHeight() { return Math.max(0, state.height - cfg.margin.top - cfg.margin.bottom); }

    // v36: domain datasta + pieni marginaali ylä- ja alapäähän (log-dekadeina)
    function computeDomainFromData() {
        if (!state.events.length) return;

        const minData = d3.min(state.events, d => Math.max(+d.time_years || 1e-8, 1e-8));
        const maxData = d3.max(state.events, d => +d.time_years || 1);

        const padTopDec = 0.15;     // ~0.15 dekadia "ylätilaa" → minYears = minData / 10^0.15 (~/1.41)
        const padBotDec = 0.15;     // kevyt alapään marginaali (valinnainen)

        state.minYears = Math.max(1e-8, minData / Math.pow(10, padTopDec));   // pienempi arvo = enemmän tilaa ylös
        state.maxYears = Math.max(10, maxData * Math.pow(10, padBotDec));   // isompi arvo = hieman tilaa alas
    }

    function colorForTheme(t) {
        if (!state.themeColors.has(t)) {
            const idx = state.themeColors.size % cfg.palette.length;
            state.themeColors.set(t, cfg.palette[idx]);
        }
        return state.themeColors.get(t);
    }

    function axisTicksLog10(scale) {
        // Vain 10^n -arvot → kauniit labelit
        const [d0, d1] = scale.domain();
        const n0 = Math.ceil(Math.log10(d0));
        const n1 = Math.floor(Math.log10(d1));
        return d3.range(n0, n1 + 1).map(e => Math.pow(10, e));
    }

    // timeline.js v36 — v32-logiikka: major-tickit akselissa, minor-viivat .minor-grid:iin
    function drawAxis() {
        const y = state.y;
        const [d0, d1] = y.domain();

        // major: 10^n
        const n0 = Math.ceil(Math.log10(d0));
        const n1 = Math.floor(Math.log10(d1));
        const majors = d3.range(n0, n1 + 1).map(e => 10 ** e);

        // 1) Akseli: vain major-tickit, ei oletustekstiä
        const axis = d3.axisLeft(y).tickValues(majors).tickSize(-6).tickFormat(() => "");
        gAxis.call(axis);

        // 2) Major-tickien labeli “10^n”; minor-tickeillä ei tekstejä (koska niitä ei piirretä akselille)
        gAxis.selectAll("g.tick > text").text(""); // varmuus tyhjennys
        gAxis.selectAll("g.tick").each(function (d) {
            const exp = Math.floor(Math.log10(d));
            const t = d3.select(this).select("text").text(null);
            t.append("tspan").text("10");
            t.append("tspan").attr("baseline-shift", "super").attr("font-size", "9px").text(exp);
        });

        // 3) Minor-viivat .minor-grid-ryhmään (2..9 × 10^n) — vain jos ei liian tiheää
        gMinor.selectAll("*").remove();
        const visibleDecades = n1 - n0 + 1;                 // kuinka monta dekadia näkyy
        const showMinor = visibleDecades <= 12;              // kynnys kuten v32: “riittävän väljä”
        if (showMinor) {
            for (let e = n0; e <= n1; e++) {
                for (let m = 2; m <= 9; m++) {
                    const v = m * 10 ** e;
                    if (v >= d0 && v <= d1) {
                        gMinor.append("line")
                            .attr("x1", 0).attr("x2", 6)     // lyhyt pisto akselin oikealle
                            .attr("y1", y(v)).attr("y2", y(v));
                        // HUOM: ei väriä/opacityä JS:ssä → kaikki tyyli CSS:ään
                    }
                }
            }
        }
    }

    // piirtää teemakortit ja tapahtumat
    function drawCards() {
        const themes = state.themes;
        const w = Math.max(cfg.card.minW, innerWidth() * 0.33);

        const data = themes.map(th => {
            const list = state.events.filter(e => e.theme === th);
            const logs = list.map(e => Math.log10(e.time_years));
            const minL = d3.min(logs), maxL = d3.max(logs);
            return {
                theme: th,
                yTop: state.y(Math.pow(10, maxL)),
                yBot: state.y(Math.pow(10, minL)),
                color: colorForTheme(th),
                events: list
            };
        });

        const indent = 20;
        const sel = gCards.selectAll("g.card").data(data, d => d.theme);
        const ent = sel.enter().append("g").attr("class", "card");

        ent.append("rect").attr("rx", 10).attr("ry", 10); // v36: varjo pois testiksi
        ent.append("text").attr("class", "card-title").attr("x", 8).attr("dy", "0.9em").style("font-weight", "bold");
        ent.append("g").attr("class", "events");
        sel.exit().remove();

        sel.merge(ent).each(function (d, i) {
            const g = d3.select(this);
            const x = (i % 2 === 0 ? 10 : 10 + indent); // kevyt sisennys
            const y = Math.min(d.yTop, d.yBot);
            const h = Math.abs(d.yBot - d.yTop);
            g.attr("transform", `translate(${x},${0})`);
            g.select("rect")
                .attr("x", 0).attr("y", y)
                .attr("width", w).attr("height", h)
                .attr("fill", d.color).attr("fill-opacity", 0.55)
                .attr("stroke", "#999").attr("stroke-opacity", 0.25);

            // otsikko kortin sisälle yläreunaan
            g.select("text.card-title").attr("y", y + 12).text(d.theme);

            // tapahtumat: viiva + teksti
            const evSel = g.select("g.events").selectAll("g.e").data(d.events, e => e.label + e.time_years);
            const evEnt = evSel.enter().append("g").attr("class", "e");
            evEnt.append("line").attr("class", "event-line");
            evEnt.append("text").attr("class", "event-label").attr("x", 18).attr("dy", "0.32em");
            evSel.exit().remove();

            evSel.merge(evEnt).each(function (e) {
                const yy = state.y(e.time_years);
                const gg = d3.select(this);
                gg.select("line.event-line")
                    .attr("x1", -x + 4).attr("x2", 8).attr("y1", yy).attr("y2", yy).attr("stroke", "#aaa");
                gg.select("text.event-label")
                    .attr("x", 12).attr("y", yy)
                    .text(`${e.label} (${formatYear(e.year)})`);
            });
        });
    }

    function formatYear(y) {
        return (y ?? "").toString();
    }

    function updateZoomIndicator(transform) {
        const H = innerHeight();
        const k = transform.k, ty = transform.y;
        const winH = H / k;
        const winY = Math.max(0, Math.min(-ty / k, H - winH));
        zoomWin.attr("y", winY).attr("height", winH);

        // hitbox leveämmäksi ja hiukan korkeammaksi
        const winX = (+zoomWin.attr("x") || 2);
        const winW = (+zoomWin.attr("width") || (cfg.zoomBar.width - 4));
        const hitH = Math.min(H, winH * HIT_SCALE);
        let hitY = winY - (hitH - winH) / 2;
        hitY = Math.max(0, Math.min(hitY, H - hitH));
        const hitX = winX - HIT_PAD_LEFT;
        const hitW = winW * (1 + HIT_EXTRA_RIGHT_SCALE) + HIT_PAD_LEFT + HIT_PAD_RIGHT;

        zoomHit.attr("x", hitX).attr("y", hitY).attr("width", hitW).attr("height", hitH);
    }

    function applyZoom() {
        drawAxis();
        drawCards();
        setZOrder(); // v35: varmistetaan kerrosjärjestys
    }

    // --- zoom käyttäytyminen ---
    const zoomBehavior = d3.zoom()
        .scaleExtent([0.3, 12])
        .translateExtent([[0, 0], [1, 1]]) // päivitetään initissä
        .on("zoom", (event) => {
            // rescale → clamp domain alkuperäiseen
            const t = event.transform;
            const tmp = t.rescaleY(state.yBase);
            const [a, b] = tmp.domain();
            const clamped = [
                Math.max(a, state.minYears),
                Math.min(b, state.maxYears)
            ];
            state.y = d3.scaleLog().domain(clamped).range(state.yBase.range());
            updateZoomIndicator(t);
            applyZoom();
        });

    function attachZoomDragging() {
        // raahaa zoomWin → muunna drag screen-y → zoom translate
        zoomWin.call(d3.drag().on("drag", (event) => {
            const H = innerHeight() - 1;
            const t = d3.zoomTransform(svg.node());
            const k = Math.max(t.k, 1e-6);
            const curY = (+zoomWin.attr("y") || 0);

            // sama clamp kuin indikaattorissa
            const rawH = H / k;
            const winH = Math.max(8, Math.min(H, rawH));

            let newY = Math.max(0, Math.min(curY + event.dy, H - winH));
            const newTranslateY = -newY * k;
            svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(0, newTranslateY).scale(k));
        }));
    }

    // --- data ---
    async function loadData() {
        try {
            const res = await fetch('eventsDB.json', { cache: "no-store" });
            if (!res.ok) throw new Error("eventsDB.json not found");
            const data = await res.json();

            // flatten: lisätään theme jokaiselle eventille
            state.events = (data.events || []).flatMap(g => (g.events || []).map(e => ({ ...e, theme: g.theme })));
            state.themes = Array.from(new Set(state.events.map(e => e.theme)));

            // värit per teema
            state.themes.forEach(t => colorForTheme(t));

            computeDomainFromData();
        } catch (e) {
            console.warn("Using fallback data:", e.message);
            state.events = [
                { label: "Alkuräjähdys", year: "13.8e9", time_years: 13.8e9, theme: "kosmos" },
                { label: "Elämän synty", year: "3.8e9", time_years: 3.8e9, theme: "elämä" },
                { label: "Dinosaurukset kuolevat", year: "6.6e7", time_years: 6.6e7, theme: "elämä" },
                { label: "Homo sapiens", year: "3.0e5", time_years: 3.0e5, theme: "ihmiskunta" },
                { label: "Antiikin Kreikka", year: "2.5e3", time_years: 2.5e3, theme: "kulttuuri" },
                { label: "Moderni tiede", year: "4.0e2", time_years: 4.0e2, theme: "teknologia" }
            ];
            state.themes = Array.from(new Set(state.events.map(e => e.theme)));
            state.themes.forEach(t => colorForTheme(t));
            computeDomainFromData();
        }
    }

    // --- init ---
    async function init() {
        // v33: mittaa H1-korkeus → CSS-var
        const h1 = document.getElementById('page-title');
        const h1H = h1 ? (Math.ceil(h1.getBoundingClientRect().height) + 8) : 0;
        document.documentElement.style.setProperty('--header-h', `${h1H}px`);

        layout();
        // v33: info-paneelin toggle (tukee sekä #info-box että #help)
        const infoToggle = document.getElementById('info-toggle') || document.getElementById('helpBtn');
        const infoBox = document.getElementById('info-box') || document.getElementById('help');
        if (infoToggle && infoBox) {
            infoToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                // tue sekä [hidden] että display:none
                if ('hidden' in infoBox) infoBox.hidden = !infoBox.hidden;
                if (infoBox.style) infoBox.style.display = (infoBox.style.display === 'block' ? 'none' : 'block');
            }, { passive: true });

            document.addEventListener('click', () => {
                if ('hidden' in infoBox) infoBox.hidden = true;
                if (infoBox.style) infoBox.style.display = 'none';
            });
            infoBox.addEventListener('click', (e) => e.stopPropagation());
        }

        // varjo filtteri
        const defs = svg.append("defs");
        defs.append("filter").attr("id", "shadow")
            .append("feDropShadow")
            .attr("dx", -3).attr("dy", 3).attr("stdDeviation", 3)
            .attr("flood-color", "#000").attr("flood-opacity", 0.25);
        // v33: piirtoalueen leikkaus, estää valumisen akselin yli
        const clip = defs.append("clipPath").attr("id", "plot-clip");
        clip.append("rect")
            .attr("id", "plot-rect")
            .attr("x", 0).attr("y", 0)
            .attr("width", innerWidth())       // heti oikeat mitat
            .attr("height", innerHeight())
            .attr("fill", "none")              // EI koskaan maalaa
            .attr("stroke", "none")
            .attr("pointer-events", "none");
        gCards.attr("clip-path", "url(#plot-clip)");

        // zoom extents
        svg.call(zoomBehavior);
        zoomBehavior.translateExtent([[0, 0], [innerWidth(), innerHeight() - 1]]);
        attachZoomDragging();
        zoomHit.call(
            d3.drag().on("drag", (event) => {
                const H = innerHeight();
                const t = d3.zoomTransform(svg.node());
                const k = t.k;
                const curY = (+zoomWin.attr("y") || 0);
                const winH = H / k;
                let newY = Math.max(0, Math.min(curY + event.dy, H - winH));
                const newTranslateY = -newY * k;
                svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(0, newTranslateY).scale(k));
            })
        );

        // lataa & piirrä
        await loadData();
        // päivitä skaalat domainin mukaan
        state.yBase.domain([state.minYears, state.maxYears]);
        state.y.domain([state.minYears, state.maxYears]);
        applyZoom();
        setZOrder();                 // heti ensimmäisen piirron jälkeen
        requestAnimationFrame(setZOrder); // varmuus: myös seuraavassa framessa

        // pieni vihje: automaattinen fokusoituminen "ihmiskunta"-korttiin jos on
        const hasHuman = state.themes.includes("ihmiskunta");
        if (hasHuman) {
            const list = state.events.filter(e => e.theme === "ihmiskunta");
            const ys = list.map(e => state.y(e.time_years));
            const mid = (d3.min(ys) + d3.max(ys)) / 2;
            const k = 3;
            const H = innerHeight();
            const newY = -mid * k + H / 2;
            svg.transition().duration(900).call(zoomBehavior.transform, d3.zoomIdentity.translate(0, newY).scale(k));
        }

        const ro = new ResizeObserver(() => {
            // 1) mittaa otsikon korkeus → CSS-var
            const h1 = document.getElementById('page-title');
            const h1H = h1 ? (Math.ceil(h1.getBoundingClientRect().height) + 8) : 0;
            document.documentElement.style.setProperty('--header-h', `${h1H}px`);

            // 2) säilytä nykyinen zoom, päivitä layout ja extentit
            const t = d3.zoomTransform(svg.node());
            layout();
            svg.call(zoomBehavior);
            zoomBehavior.translateExtent([[0, 0], [innerWidth(), innerHeight() - 1]]);
            updateZoomIndicator(t);
            applyZoom();

            // 3) palauta sama zoom-tila
            svg.call(zoomBehavior.transform, t);
            setZOrder(); // v35: varmistetaan kerrosjärjestys
        });
        ro.observe(container);
    }

    // start
    document.addEventListener("DOMContentLoaded", init);
})();