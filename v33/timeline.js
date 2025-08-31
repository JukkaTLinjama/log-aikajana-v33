// timeline.js — v32 clean skeleton

const cfg = {
    margin: { top: 20, right: 50, bottom: 20, left: 50 },
    zoomBar: { width: 28, pad: 10 },
    card: { w: 200, h: 50 },
    domain: { logMin: 12, logMax: 18 }
};

const state = { width: 0, height: 0, y: null, zoom: null };

// esimerkkidata
const events = [
    { label: "Alkuräjähdys", log: 18 },
    { label: "Maan synty", log: 16.5 },
    { label: "Elämä", log: 14.5 },
    { label: "Ihminen", log: 12.7 }
];

function setupScales(svg) {
    const rect = svg.getBoundingClientRect();
    state.width = rect.width; state.height = rect.height;
    state.y = d3.scaleLinear().domain([cfg.domain.logMin, cfg.domain.logMax])
        .range([cfg.margin.top, state.height - cfg.margin.bottom]);
}

function drawAxes(svg) {
    const axis = d3.axisLeft(state.y).ticks(8);
    svg.select(".axis").attr("transform", `translate(${cfg.margin.left},0)`).call(axis);
}

function drawCards(svg) {
    const g = svg.select(".cards");
    const sel = g.selectAll("g.card-group").data(events);
    const ent = sel.enter().append("g").attr("class", "card-group");

    ent.append("rect").attr("class", "card")
        .attr("width", cfg.card.w).attr("height", cfg.card.h);
    ent.append("text").attr("x", 10).attr("y", cfg.card.h / 2)
        .attr("dominant-baseline", "middle");

    sel.merge(ent).attr("transform", d =>
        `translate(${cfg.margin.left + 20},${state.y(d.log) - cfg.card.h / 2})`);
    sel.merge(ent).select("text").text(d => d.label);
    sel.exit().remove();
}

function init() {
    const svg = d3.select("#timeline");
    svg.append("g").attr("class", "axis");
    svg.append("g").attr("class", "cards");

    setupScales(svg.node());
    drawAxes(svg);
    drawCards(svg);

    document.getElementById("info-toggle").addEventListener("click", () => {
        const box = document.getElementById("info-box");
        box.style.display = box.style.display === "block" ? "none" : "block";
    });
}

document.addEventListener("DOMContentLoaded", init);
