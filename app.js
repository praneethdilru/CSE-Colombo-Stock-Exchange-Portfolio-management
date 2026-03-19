const state = {
  ticks: {},
  updatesLastMinute: 0,
  updateHistory: [],
  newsIndex: 0,
};

const SYMBOLS_FALLBACK = [
  "JKH",
  "COMB",
  "HNB",
  "SAMP",
  "LOLC",
  "LION",
  "DIAL",
  "CARG",
  "JKL",
  "BIL",
  "EXPO",
  "RICH",
  "VONE",
  "ASIR",
  "NEST",
  "HAYL",
  "CTC",
  "TJL",
  "MELS",
  "GLAS",
];

const newsItems = [
  "Market opens on a positive note with broad-based buying interest.",
  "Top banking names lead gains amid strong quarterly earnings.",
  "Export-oriented companies see renewed foreign investor inflows.",
  "Energy sector under pressure as global oil prices ease.",
  "Mid-cap stocks outperform with strong volume across the board.",
  "Regulator proposes transparency enhancements for listed entities.",
  "Tech and telecom names advance on digital adoption tailwinds.",
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomVolume() {
  return Math.floor(randomBetween(10_000, 1_000_000) / 10) * 10;
}

function initState() {
  SYMBOLS_FALLBACK.forEach((sym) => {
    const base = randomBetween(10, 300);
    state.ticks[sym] = {
      symbol: sym,
      last: base,
      prevClose: base * randomBetween(0.98, 1.02),
      volume: randomVolume(),
    };
  });
}

function fmtPrice(x) {
  return x.toFixed(2);
}

function fmtChange(t) {
  const diff = t.last - t.prevClose;
  const pct = (diff / t.prevClose) * 100;
  return { diff, pct };
}

function fmtPct(x) {
  const s = x >= 0 ? "+" : "";
  return s + x.toFixed(2) + "%";
}

function sample(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
}

function renderMetrics() {
  const active = Object.keys(state.ticks).length;
  const now = Date.now();
  state.updateHistory = state.updateHistory.filter((t) => now - t < 60_000);
  const totalPct =
    Object.values(state.ticks).reduce(
      (acc, t) => acc + fmtChange(t).pct,
      0
    ) / active;

  const metricSymbols = document.getElementById("metric-symbols");
  const metricChange = document.getElementById("metric-change");
  const metricUpdates = document.getElementById("metric-updates");
  if (!metricSymbols || !metricChange || !metricUpdates) return;

  metricSymbols.textContent = String(active);

  metricChange.classList.remove("positive", "negative");
  if (totalPct > 0.05) metricChange.classList.add("positive");
  else if (totalPct < -0.05) metricChange.classList.add("negative");
  metricChange.textContent = fmtPct(totalPct);

  metricUpdates.textContent = String(state.updateHistory.length);
}

function renderTicker() {
  const root = document.getElementById("ticker-list");
  if (!root) return;
  root.innerHTML = "";

  const items = sample(Object.values(state.ticks), 10);
  items.forEach((t) => {
    const { diff, pct } = fmtChange(t);
    const chip = document.createElement("div");
    chip.className = "ticker-chip";

    const symbol = document.createElement("span");
    symbol.className = "ticker-symbol";
    symbol.textContent = t.symbol;

    const price = document.createElement("span");
    price.className = "ticker-price";
    price.textContent = fmtPrice(t.last);

    const change = document.createElement("span");
    change.className = "ticker-change";
    change.textContent = fmtPct(pct);
    if (diff > 0) change.classList.add("positive");
    else if (diff < 0) change.classList.add("negative");

    chip.appendChild(symbol);
    chip.appendChild(price);
    chip.appendChild(change);
    root.appendChild(chip);
  });
}

function renderHeatmap() {
  const root = document.getElementById("heatmap");
  if (!root) return;
  root.innerHTML = "";

  const items = sample(Object.values(state.ticks), 27);
  items.forEach((t) => {
    const { pct } = fmtChange(t);
    const div = document.createElement("div");
    let cls = "heatmap-flat";
    if (pct > 0.4) cls = "heatmap-pos";
    else if (pct < -0.4) cls = "heatmap-neg";
    div.className = `heatmap-cell ${cls}`;

    const s = document.createElement("div");
    s.className = "heatmap-symbol";
    s.textContent = t.symbol;

    const c = document.createElement("div");
    c.className = "heatmap-change";
    c.textContent = fmtPct(pct);

    div.appendChild(s);
    div.appendChild(c);
    root.appendChild(div);
  });
}

function renderWatchlist() {
  const root = document.getElementById("watchlist-body");
  if (!root) return;
  root.innerHTML = "";

  const watch = sample(Object.values(state.ticks), 8);
  watch.forEach((t) => {
    const { diff, pct } = fmtChange(t);
    const tr = document.createElement("tr");

    const symbolTd = document.createElement("td");
    symbolTd.textContent = t.symbol;

    const lastTd = document.createElement("td");
    lastTd.textContent = fmtPrice(t.last);

    const diffTd = document.createElement("td");
    diffTd.textContent = fmtPrice(diff);
    diffTd.style.color = diff > 0 ? "#4ade80" : diff < 0 ? "#f97373" : "#e5e7eb";

    const pctTd = document.createElement("td");
    pctTd.textContent = fmtPct(pct);
    pctTd.style.color = diff > 0 ? "#4ade80" : diff < 0 ? "#f97373" : "#e5e7eb";

    const volTd = document.createElement("td");
    volTd.textContent = t.volume.toLocaleString("en-US");

    tr.appendChild(symbolTd);
    tr.appendChild(lastTd);
    tr.appendChild(diffTd);
    tr.appendChild(pctTd);
    tr.appendChild(volTd);
    root.appendChild(tr);
  });
}

function renderNews() {
  const root = document.getElementById("news-list");
  if (!root) return;
  root.innerHTML = "";

  const visibleItems = 5;
  for (let i = 0; i < visibleItems; i++) {
    const idx = (state.newsIndex + i) % newsItems.length;
    const li = document.createElement("li");
    li.className = "news-item";

    const title = document.createElement("div");
    title.className = "news-title";
    title.textContent = newsItems[idx];

    const meta = document.createElement("div");
    meta.className = "news-meta";
    meta.innerHTML = `<span>Signal ${idx + 1}</span><span>${15 - i} min ago</span>`;

    li.appendChild(title);
    li.appendChild(meta);
    root.appendChild(li);
  }
}

async function fetchTodaySharePrices() {
  const res = await fetch("/api/todaySharePrice", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: "",
  });

  if (!res.ok) {
    throw new Error("CSE proxy error: " + res.status);
  }

  return res.json();
}

function applyApiDataToState(apiData) {
  // The exact shape depends on CSE; common patterns:
  // - apiData.data
  // - apiData.todaySharePrice
  const rows = apiData.data || apiData.todaySharePrice || apiData || [];

  const nextTicks = {};
  rows.forEach((row) => {
    const symbol = row.symbol || row.symbolCode || row.securityCode;
    if (!symbol) return;

    const lastRaw =
      row.lastTradedPrice ??
      row.tradePrice ??
      row.lastTrdPrc ??
      row.lastTradedPriceValue;
    const prevCloseRaw =
      row.prevClose ??
      row.previousClose ??
      row.prevClsPrc ??
      row.previousDayClosePrice;
    const volumeRaw =
      row.volume ?? row.tradedVolume ?? row.totalVolume ?? row.qty ?? 0;

    const last = Number(lastRaw);
    const prevClose = Number(prevCloseRaw);
    const volume = Number(volumeRaw);

    nextTicks[symbol] = {
      symbol,
      last: isNaN(last) ? 0 : last,
      prevClose: isNaN(prevClose) ? (isNaN(last) ? 0 : last) : prevClose,
      volume: isNaN(volume) ? 0 : volume,
    };
  });

  if (Object.keys(nextTicks).length === 0) {
    return false;
  }

  state.ticks = nextTicks;
  return true;
}

function tickRealtimeFallback() {
  const symbols = Object.keys(state.ticks);
  if (symbols.length === 0) return;

  const changed = sample(symbols, Math.floor(randomBetween(3, 8)));
  changed.forEach((sym) => {
    const t = state.ticks[sym];
    const noise = randomBetween(-0.7, 0.9);
    const factor = 1 + noise / 500;
    t.last *= factor;
    t.volume += randomVolume() * Math.random();
  });

  const now = Date.now();
  for (let i = 0; i < changed.length; i++) {
    state.updateHistory.push(now);
  }

  renderMetrics();
  renderTicker();
  renderHeatmap();
  renderWatchlist();
}

async function tickRealtime() {
  try {
    const data = await fetchTodaySharePrices();
    const ok = applyApiDataToState(data);
    if (!ok) {
      tickRealtimeFallback();
      return;
    }

    const now = Date.now();
    state.updateHistory.push(now);

    renderMetrics();
    renderTicker();
    renderHeatmap();
    renderWatchlist();
  } catch (err) {
    console.error("tickRealtime error, using fallback:", err);
    tickRealtimeFallback();
  }
}

function advanceNews() {
  state.newsIndex = (state.newsIndex + 1) % newsItems.length;
  renderNews();
}

function init() {
  initState();
  renderMetrics();
  renderTicker();
  renderHeatmap();
  renderWatchlist();
  renderNews();

  tickRealtime(); // kick off immediately
  setInterval(tickRealtime, 5000);
  setInterval(advanceNews, 8000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

