// Simple Node/Express proxy for the Colombo Stock Exchange API
// Frontend calls http://localhost:4000/api/... instead of hitting CSE directly.

import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 4000;
const CSE_BASE_URL = "https://www.cse.lk/api/";

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function proxyPost(req, res, endpoint) {
  try {
    const cseRes = await fetch(CSE_BASE_URL + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: new URLSearchParams(req.body || {}).toString()
    });

    const text = await cseRes.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    res.status(cseRes.status).json(json);
  } catch (err) {
    console.error("CSE proxy error:", err);
    res.status(500).json({ error: "Failed to reach CSE API" });
  }
}

// Example: today share prices for all securities
app.post("/api/todaySharePrice", (req, res) =>
  proxyPost(req, res, "todaySharePrice")
);

// Example: market summary
app.post("/api/marketSummery", (req, res) =>
  proxyPost(req, res, "marketSummery")
);

// Example: trade summary for all securities
app.post("/api/tradeSummary", (req, res) =>
  proxyPost(req, res, "tradeSummary")
);

// Serve the frontend from the same folder (single-host deployment).
// This lets the browser call `/api/...` without hardcoding `localhost`.
app.use(express.static(process.cwd()));
app.get("*", (_req, res) => {
  res.sendFile(process.cwd() + "/index.html");
});

app.listen(PORT, () => {
  console.log(`CSE proxy server running at http://localhost:${PORT}`);
});

