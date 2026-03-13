/**
 * NeuralCanvas — Vanilla JS (Webflow-ready)
 *
 * Usage in Webflow:
 *   1. Add a Div Block (100% width, 100vh height, background #01020A)
 *   2. Inside it, add an HTML Embed with: <canvas id="neural-canvas" style="width:100%;height:100%;display:block;"></canvas>
 *   3. Add fonts in Project Settings → Custom Code → Head:
 *      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
 *   4. Add this script in Project Settings → Custom Code → Footer:
 *      <script src="https://cdn.jsdelivr.net/gh/igor-titl/genesis@main/neural-canvas-webflow.min.js" defer></script>
 */
(function () {
  "use strict";

  /* ── Constants ──────────────────────────────────────────────── */
var C = { r: 255, g: 106, b: 0 };
var NODE_COUNT = 63;
var CANVAS_OFFSET_X = 0.62;

var HUB_LABELS = [
  "Kafka","Snowflake","Airflow","dbt","Spark",
  "Databricks","BigQuery","Redshift","Salesforce","SAP",
  "PostgreSQL","MongoDB","Elasticsearch","S3","HubSpot",
  "Workday","MySQL",
];
var CLUSTER_LABELS = [
  "Risk Analytics","Credit Scoring","Fraud Detection","Loan Origination",
  "Core Banking","Trade Finance","Market Data","Fed Reporting",
  "Compliance","Customer Onboarding","Mortgage Servicing","Credit Bureau",
  "Stock Exchange","Branch Banking","Merchant Acquiring","Regulatory Reporting",
];
var LEAF_LABELS = [
  "CDC Stream","KYC","AML","Ledger","Swift","ISO20022",
  "SFTP","Google Sheets","REST API","GraphQL","Webhook","OAuth",
];

var NODE_TOOLTIPS = {
  Kafka: {
    agent: "STREAM-INGEST-4a",
    activity: "Streaming real-time order events from the e-commerce platform at 847 messages per second \u2014 routing to fraud detection and inventory systems...",
    status: "active",
    statusText: "Streaming events through the pipeline at optimal throughput with minimal latency...",
    progress: 0.72,
    secondary: { type: "throughput", text: "Processing 847 msgs/sec \u2014 1.2M events delivered" },
    freshness: "Updated 2s ago",
  },
  Snowflake: {
    agent: "WAREHOUSE-OPT-7b",
    activity: "Scaling the analytics warehouse from MEDIUM to LARGE to handle month-end financial processing workloads with tight SLA requirements...",
    status: "active",
    statusText: "Processing data transformation rules and applying business logic to incoming records...",
    progress: 0.45,
    secondary: { type: "resource", text: "Using 6 clusters \u2014 45% warehouse capacity" },
    freshness: "Updated 5s ago",
  },
  Airflow: {
    agent: "DAG-ORCH-1e",
    activity: "Orchestrating the daily ETL workflow \u2014 currently 12 of 15 tasks complete, with data validation and final load steps remaining...",
    status: "waiting",
    statusText: "Awaiting completion of upstream dependency before proceeding with this transformation step...",
    progress: 0.80,
    secondary: { type: "progress", text: "Completed 12 of 15 tasks \u2014 3 remaining" },
    freshness: "Updated 8s ago",
  },
  dbt: {
    agent: "DBT-RUN-5h",
    activity: "Running 47 data quality tests across the mart tables, validating primary keys, null constraints, accepted values, and referential integrity...",
    status: "active",
    statusText: "Executing batch 12 of 47 \u2014 applying incremental updates to the destination tables...",
    progress: 0.26,
    secondary: { type: "progress", text: "Executing batch 12 of 47 \u2014 35 remaining" },
    freshness: "Updated 1s ago",
  },
  Spark: {
    agent: "COMPUTE-OPT-2m",
    activity: "Processing 2.4M customer records through the transformation pipeline \u2014 applying business rules, deduplication, and data quality checks before loading to the warehouse...",
    status: "active",
    statusText: "Transformation in progress at 68% completion \u2014 estimated 4 minutes remaining...",
    progress: 0.68,
    secondary: { type: "time", text: "Running for 12m 41s \u2014 ~4 min remaining" },
    freshness: "Updated 3s ago",
  },
  Databricks: {
    agent: "ML-CLUSTER-9f",
    activity: "Training a gradient boosting classifier \u2014 currently on epoch 34 of 100 \u2014 with early stopping enabled to prevent overfitting on validation data...",
    status: "active",
    statusText: "Syncing records between systems with conflict resolution and deduplication enabled...",
    progress: 0.34,
    secondary: { type: "resource", text: "Using 8 worker nodes \u2014 72% cluster capacity" },
    freshness: "Updated 4s ago",
  },
  BigQuery: {
    agent: "BQ-ANALYZE-3d",
    activity: "Analyzing user engagement patterns using advanced window functions to calculate rolling averages, session sequences, and cohort retention rates...",
    status: "success",
    statusText: "Pipeline completed successfully \u2014 all quality checks passed",
    progress: 1.0,
    secondary: { type: "time", text: "Completed in 4m 23s \u2014 next run in 15 min" },
    freshness: "Updated 12s ago",
  },
  Redshift: {
    agent: "RS-VACUUM-6c",
    activity: "Optimizing the query execution plan for a complex cross-region join, analyzing distribution keys and sort keys for optimal data locality...",
    status: "waiting",
    statusText: "Queued for execution with 3 jobs ahead in the priority queue...",
    secondary: { type: "time", text: "Estimated start in 8 minutes" },
    freshness: "Updated 15s ago",
  },
  Salesforce: {
    agent: "CRM-SYNC-3g",
    activity: "Extracting the complete Account hierarchy via Bulk API 2.0, capturing parent-child relationships for corporate family analytics and reporting...",
    status: "active",
    statusText: "Querying the database and aggregating results for the requested time period...",
    progress: 0.53,
    secondary: { type: "throughput", text: "Processing 2,400 rows/sec \u2014 847K complete" },
    freshness: "Updated 2s ago",
  },
  SAP: {
    agent: "ERP-EXTRACT-8a",
    activity: "Extracting General Ledger account balances from FI module for month-end reconciliation, pulling actuals across all company codes and cost centers...",
    status: "error",
    statusText: "Connection timeout after 30 seconds \u2014 automatically retrying with exponential backoff...",
    secondary: { type: "time", text: "Failed 47s ago \u2014 retry 2 of 3 in 30s" },
    freshness: "Updated 47s ago",
  },
  PostgreSQL: {
    agent: "PG-REPLICATE-2k",
    activity: "Replicating write-ahead log changes to the read replica with current lag of 230ms, ensuring near-real-time data availability for reporting queries...",
    status: "active",
    statusText: "Streaming WAL changes to replica with minimal lag...",
    progress: 0.91,
    secondary: { type: "throughput", text: "Replication lag 230ms \u2014 14K txn/sec" },
    freshness: "Updated 1s ago",
  },
  MongoDB: {
    agent: "MONGO-FLAT-7e",
    activity: "Flattening deeply nested JSON documents for analytical reporting, extracting embedded arrays and subdocuments into queryable tabular structures...",
    status: "success",
    statusText: "All 12 data validation tests passed \u2014 referential integrity verified",
    progress: 1.0,
    secondary: { type: "progress", text: "Committed 50,847 rows \u2014 zero rejected" },
    freshness: "Updated 34s ago",
  },
  Elasticsearch: {
    agent: "ES-INDEX-4f",
    activity: "Building dense vector embeddings for similarity search, enabling semantic product recommendations based on description and attribute matching...",
    status: "active",
    statusText: "Indexing documents with updated mapping configuration...",
    progress: 0.41,
    secondary: { type: "throughput", text: "Indexing 3,200 docs/sec \u2014 1.4M remaining" },
    freshness: "Updated 2s ago",
  },
  S3: {
    agent: "S3-SCAN-1b",
    activity: "Scanning data lake partitions organized by date for new Parquet files, detecting 47 new files arrived in the last hour for processing...",
    status: "waiting",
    statusText: "Idle \u2014 next scheduled execution based on configured cron schedule...",
    secondary: { type: "time", text: "Next scheduled scan in 12 minutes" },
    freshness: "Updated 3m ago",
  },
  HubSpot: {
    agent: "HS-MARKET-5d",
    activity: "Extracting detailed email open, click, and bounce events for multi-touch attribution modeling and campaign effectiveness analysis...",
    status: "success",
    statusText: "Sync completed successfully \u2014 next scheduled run per configured interval",
    progress: 1.0,
    secondary: { type: "throughput", text: "Synced 8,420 contacts \u2014 0 conflicts" },
    freshness: "Updated 58s ago",
  },
  Workday: {
    agent: "WD-HR-SYNC-3c",
    activity: "Syncing organizational hierarchy changes following the recent restructuring, updating reporting relationships and cost center assignments...",
    status: "error",
    statusText: "Schema drift detected \u2014 3 new columns not present in target mapping...",
    secondary: { type: "resource", text: "Source schema v4.2 \u2014 target expects v4.0" },
    freshness: "Updated 2m ago",
  },
  MySQL: {
    agent: "MY-CDC-6g",
    activity: "Capturing Change Data Capture events from transactional tables using Debezium connector, streaming row-level changes to the data lake...",
    status: "active",
    statusText: "Streaming row-level changes via Debezium connector...",
    progress: 0.87,
    secondary: { type: "throughput", text: "Processing 5K rows/batch \u2014 847K delivered" },
    freshness: "Updated 1s ago",
  },
};

var STATUS_CONFIG = {
  active:  { color: "#4ade80", borderColor: "rgba(74, 222, 128, 0.25)", label: "ACTIVE" },
  waiting: { color: "#facc15", borderColor: "rgba(250, 204, 21, 0.25)", label: "WAITING" },
  success: { color: "#3b82f6", borderColor: "rgba(59, 130, 246, 0.25)", label: "COMPLETE" },
  error:   { color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.25)", label: "ERROR" },
};

/* ── Math helpers ───────────────────────────────────────────── */
function rotateY(x, y, z, a) {
  var cos = Math.cos(a), sin = Math.sin(a);
  return [x * cos + z * sin, y, -x * sin + z * cos];
}
function rotateX(x, y, z, a) {
  var cos = Math.cos(a), sin = Math.sin(a);
  return [x, y * cos - z * sin, y * sin + z * cos];
}

/* ── Boot ───────────────────────────────────────────────────── */
function boot() {
  var canvas = document.getElementById("neural-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var width = 0, height = 0, time = 0, animId = 0;

  /* Camera */
  var camRotY = 0, camRotX = -0.12;
  var FOV = 900, camDist = 2500, targetCamDist = 720;

  /* Hover-zoom */
  var hoverZoomActive = false;
  var hoverLockedHub = null;
  var hoverReleaseTimer = 0;
  var HOVER_RELEASE_FRAMES = 20;
  var HOVER_ZOOM_DIST = 520;
  var HOVER_LERP = 0.04;
  var projCenterX = 0, projCenterY = 0;
  var targetProjCenterX = 0, targetProjCenterY = 0;

  /* Intro */
  var INTRO_FRAMES = 300;
  var introTimer = 0, introDone = false;

  /* Web-build */
  var pioneers = [];
  var edgeRevealMap = new Map();
  var visitedWebNodes = new Set();
  var queuedWebEdges = new Set();
  var pendingSpawns = [];
  var MAX_PIONEER_CONCURRENT = 8;
  var nodeVisitTime = new Map();
  var NODE_FADE_FRAMES = 45;
  var webBuildComplete = false;
  var webBuildEndTimer = 0;

  /* Auto-rotation */
  var AUTO_SPEED = 0.0025;
  var autoRotating = true;
  var dragVelX = 0, dragVelY = 0;

  /* Drag */
  var isDragging = false;
  var dragStartX = 0, dragStartY = 0;
  var dragLastX = 0, dragLastY = 0;

  /* Hover */
  var mouseX = -9999, mouseY = -9999;
  var hoveredHub = null;
  var HIT_RADIUS = 40;
  var lastTooltipUpdate = 0;
  var currentTooltipLabel = null;

  /* ── Tooltip DOM ─────────────────────────────────────────── */
  var tooltipEl = document.createElement("div");
  tooltipEl.style.cssText = "position:fixed;z-index:9999;pointer-events:none;opacity:0;transition:opacity .25s ease,transform .3s ease;transform:translateX(-8px);";
  document.body.appendChild(tooltipEl);

  function buildTooltipHTML(label, data) {
    var sc = STATUS_CONFIG[data.status];
    var pingDot = data.status === "active"
      ? '<span style="position:relative;display:inline-flex;width:7px;height:7px;flex-shrink:0">'
      +   '<span style="position:absolute;inset:0;border-radius:50%;background:' + sc.color + ';animation:ncPing 1s cubic-bezier(0,0,.2,1) infinite;opacity:.4"></span>'
      +   '<span style="position:relative;display:inline-flex;width:100%;height:100%;border-radius:50%;background:' + sc.color + '"></span>'
      + '</span>'
      : '<span style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:' + sc.color + '"></span>';

    var progressBar = "";
    if (data.progress !== undefined) {
      var bg = data.status === "success" ? sc.color
             : data.status === "error" ? sc.color
             : "linear-gradient(90deg," + sc.color + ",#FF6E06)";
      progressBar = '<div style="position:relative;height:3px;width:100%;border-radius:2px;overflow:hidden;margin-top:6px;background:rgba(255,255,255,.06)">'
        + '<div style="position:absolute;left:0;top:0;height:100%;border-radius:2px;width:' + (data.progress * 100) + '%;background:' + bg + ';box-shadow:0 0 6px ' + sc.color + '40"></div>'
        + '</div>';
    }

    return '<div style="width:310px;overflow:hidden;background:rgba(6,6,6,.96);backdrop-filter:blur(20px);border:1px solid rgba(255,110,6,.18);box-shadow:0 0 40px rgba(255,110,6,.1),0 12px 40px rgba(0,0,0,.7)">'
      + '<div style="height:2px;width:100%;background:linear-gradient(90deg,#FF6E06,rgba(255,110,6,.3),transparent)"></div>'
      + '<div style="padding:14px 18px 16px">'
      // Header
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
      +   '<div style="display:flex;align-items:center;gap:7px">'
      +     '<span style="position:relative;display:inline-flex;width:7px;height:7px">'
      +       '<span style="position:absolute;inset:0;border-radius:50%;background:#FF6E06;animation:ncPing 1s cubic-bezier(0,0,.2,1) infinite;opacity:.5"></span>'
      +       '<span style="position:relative;display:inline-flex;width:100%;height:100%;border-radius:50%;background:#FF6E06"></span>'
      +     '</span>'
      +     '<span style="font:500 11px/1 \'IBM Plex Mono\',monospace;color:#FF6E06;letter-spacing:.5px;text-transform:uppercase">' + data.agent + '</span>'
      +   '</div>'
      +   '<span style="font:400 10px/1 \'IBM Plex Mono\',monospace;color:#a0a0a0;letter-spacing:.3px;text-transform:uppercase;padding:3px 7px;border-radius:4px;background:rgba(255,255,255,.06);border:1px solid #2a2a2a">' + label.toUpperCase() + '</span>'
      + '</div>'
      // Divider
      + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">'
      +   '<div style="height:1px;flex:1;background:#252525"></div>'
      +   '<span style="font:400 9px/1 \'IBM Plex Mono\',monospace;color:#606060;letter-spacing:.4px;text-transform:uppercase">LIVE STATUS</span>'
      +   '<div style="height:1px;flex:1;background:#252525"></div>'
      + '</div>'
      // Activity
      + '<p style="font:400 13px/1.55 \'Inter\',sans-serif;color:#c8c8c8;letter-spacing:-.01em;margin:0 0 12px">' + data.activity + '</p>'
      // Status row
      + '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;background:rgba(255,255,255,.03);border:1px solid ' + sc.borderColor + '">'
      +   pingDot
      +   '<span style="font:500 10px/1 \'IBM Plex Mono\',monospace;color:' + sc.color + ';letter-spacing:.3px;text-transform:uppercase;flex-shrink:0">' + sc.label + '</span>'
      +   '<div style="height:10px;width:1px;background:#2a2a2a;flex-shrink:0"></div>'
      +   '<span style="font:400 11px/1 \'Inter\',sans-serif;color:#a0a0a0;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + data.statusText + '</span>'
      + '</div>'
      + progressBar
      // Footer
      + '<div style="display:flex;align-items:center;justify-content:flex-end;margin-top:12px">'
      +   '<span style="font:400 10px/1 \'IBM Plex Mono\',monospace;color:#555;letter-spacing:.3px;text-transform:uppercase">' + data.freshness + '</span>'
      + '</div>'
      + '</div></div>';
  }

  function showTooltip(label, screenX, screenY) {
    var data = NODE_TOOLTIPS[label];
    if (!data) { hideTooltip(); return; }
    tooltipEl.innerHTML = buildTooltipHTML(label, data);
    var rect = tooltipEl.firstChild.getBoundingClientRect();
    var x = screenX + 28;
    var y = screenY - rect.height / 2;
    if (x + rect.width > window.innerWidth - 16) x = screenX - rect.width - 28;
    if (x < 16) x = 16;
    if (y < 16) y = 16;
    if (y + rect.height > window.innerHeight - 16) y = window.innerHeight - rect.height - 16;
    tooltipEl.style.left = x + "px";
    tooltipEl.style.top = y + "px";
    tooltipEl.style.opacity = "1";
    tooltipEl.style.transform = "translateX(0)";
    currentTooltipLabel = label;
  }

  function hideTooltip() {
    tooltipEl.style.opacity = "0";
    tooltipEl.style.transform = "translateX(-8px)";
    currentTooltipLabel = null;
  }

  /* ── Inject keyframes ────────────────────────────────────── */
  if (!document.getElementById("nc-keyframes")) {
    var style = document.createElement("style");
    style.id = "nc-keyframes";
    style.textContent = "@keyframes ncPing{75%,100%{transform:scale(2);opacity:0}}";
    document.head.appendChild(style);
  }

  /* ── Build nodes ─────────────────────────────────────────── */
  var nodes = [];
  var hubIndices = [], clusterIndices = [], leafIndices = [];
  for (var i = 0; i < NODE_COUNT; i++) {
    if (i < 8) hubIndices.push(i);
    else if (i < 20) clusterIndices.push(i);
    else leafIndices.push(i);
  }

  var hubPos = [];
  for (var hi = 0; hi < hubIndices.length; hi++) {
    var wx, wy, wz, attempts = 0;
    do {
      wx = (Math.random() - 0.5) * 1100;
      wy = (Math.random() - 0.5) * 680;
      wz = (Math.random() - 0.5) * 900;
      attempts++;
    } while (
      attempts < 80 &&
      hubPos.some(function (p) { return Math.hypot(p[0] - wx, p[1] - wy, p[2] - wz) < 300; })
    );
    hubPos.push([wx, wy, wz]);
    nodes.push({
      id: hi, type: "hub", wx: wx, wy: wy, wz: wz,
      radius: 14 + Math.random() * 10,
      pulseOffset: Math.random() * Math.PI * 2,
      label: HUB_LABELS[hi % HUB_LABELS.length],
      parentHubId: null, connectedHubIds: [],
      _sx: 0, _sy: 0, _rz: 0, _alpha: 0, _scale: 0,
    });
  }

  for (var h = 0; h < nodes.length; h++) {
    var hub = nodes[h];
    if (hub.type !== "hub") continue;
    var dists = [];
    for (var j = 0; j < nodes.length; j++) {
      if (j === h || nodes[j].type !== "hub") continue;
      dists.push({ id: nodes[j].id, dist: Math.hypot(hub.wx - nodes[j].wx, hub.wy - nodes[j].wy, hub.wz - nodes[j].wz) });
    }
    dists.sort(function (a, b) { return a.dist - b.dist; });
    hub.connectedHubIds = dists.slice(0, 2).map(function (d) { return d.id; });
  }

  for (var ci = 0; ci < clusterIndices.length; ci++) {
    var parentHub = nodes[ci % hubIndices.length];
    var a1 = Math.random() * Math.PI * 2;
    var a2 = (Math.random() - 0.5) * Math.PI;
    var dist = 170 + Math.random() * 160;
    nodes.push({
      id: clusterIndices[ci], type: "cluster",
      wx: parentHub.wx + Math.cos(a1) * Math.cos(a2) * dist,
      wy: parentHub.wy + Math.sin(a2) * dist,
      wz: parentHub.wz + Math.sin(a1) * Math.cos(a2) * dist,
      radius: 7 + Math.random() * 4,
      pulseOffset: Math.random() * Math.PI * 2,
      label: CLUSTER_LABELS[ci % CLUSTER_LABELS.length],
      parentHubId: parentHub.id, connectedHubIds: [],
      _sx: 0, _sy: 0, _rz: 0, _alpha: 0, _scale: 0,
    });
  }

  for (var li = 0; li < leafIndices.length; li++) {
    var lbl = LEAF_LABELS[li % LEAF_LABELS.length];
    if (!lbl) continue;
    var lwx = (Math.random() - 0.5) * 1400;
    var lwy = (Math.random() - 0.5) * 860;
    var lwz = (Math.random() - 0.5) * 1100;
    var bestId = -1, bestDist = Infinity;
    for (var n = 0; n < nodes.length; n++) {
      if (nodes[n].type !== "hub") continue;
      var d = Math.hypot(lwx - nodes[n].wx, lwy - nodes[n].wy, lwz - nodes[n].wz);
      if (d < bestDist) { bestDist = d; bestId = nodes[n].id; }
    }
    nodes.push({
      id: leafIndices[li], type: "leaf",
      wx: lwx, wy: lwy, wz: lwz,
      radius: 3.6 + Math.random() * 2.4,
      pulseOffset: Math.random() * Math.PI * 2,
      label: lbl,
      parentHubId: bestId >= 0 ? bestId : null, connectedHubIds: [],
      _sx: 0, _sy: 0, _rz: 0, _alpha: 0, _scale: 0,
    });
  }

  nodes.sort(function (a, b) { return a.id - b.id; });
  var nodeById = new Map();
  nodes.forEach(function (n) { nodeById.set(n.id, n); });

  /* Proximity deco edges */
  var decoEdges = [];
  var decoDrawn = new Set();
  nodes.forEach(function (n) {
    var candidates = nodes
      .filter(function (o) { return o.id !== n.id; })
      .map(function (o) { return { id: o.id, dist: Math.hypot(n.wx - o.wx, n.wy - o.wy, n.wz - o.wz) }; })
      .sort(function (a, b) { return a.dist - b.dist; })
      .slice(0, 3);
    candidates.forEach(function (c) {
      var key = Math.min(n.id, c.id) + "-" + Math.max(n.id, c.id);
      if (!decoDrawn.has(key)) { decoDrawn.add(key); decoEdges.push({ a: n.id, b: c.id }); }
    });
  });

  /* Nebula patches */
  var nebulaPatches = [
    { x: 0.78, y: 0.22, rx: 0.28, ry: 0.35, r: 255, g: 80, b: 0, alpha: 0.028 },
    { x: 0.35, y: 0.65, rx: 0.22, ry: 0.28, r: 180, g: 60, b: 255, alpha: 0.018 },
    { x: 0.62, y: 0.45, rx: 0.35, ry: 0.40, r: 255, g: 100, b: 30, alpha: 0.015 },
    { x: 0.15, y: 0.30, rx: 0.20, ry: 0.25, r: 60, g: 120, b: 255, alpha: 0.014 },
  ];

  /* ── Projection ──────────────────────────────────────────── */
  function project(pwx, pwy, pwz) {
    var r1 = rotateY(pwx, pwy, pwz, camRotY);
    var r2 = rotateX(r1[0], r1[1], r1[2], camRotX);
    var dd = Math.max(1, r2[2] + camDist);
    var scale = FOV / (FOV + dd);
    return {
      sx: projCenterX + r2[0] * scale,
      sy: projCenterY + r2[1] * scale,
      scale: Math.max(0.01, scale),
      rz: r2[2],
    };
  }

  function depthAlpha(rz, scale) {
    var dd = rz + camDist;
    var nearFade = Math.min(1, Math.max(0, dd / 100));
    var farFade = Math.min(1.0, Math.max(0.18, (scale - 0.35) / 0.45));
    return nearFade * farFade;
  }

  /* ── Agents ──────────────────────────────────────────────── */
  var AGENT_COUNT = 7;

  function getNeighbors(nodeId) {
    var node = nodeById.get(nodeId);
    if (!node) return [];
    var neighbors = [];
    if (node.type === "hub") {
      node.connectedHubIds.forEach(function (hid) { neighbors.push(hid); });
      nodes.forEach(function (n) {
        if (n.id !== nodeId && n.parentHubId === nodeId) neighbors.push(n.id);
      });
    } else {
      if (node.parentHubId !== null) neighbors.push(node.parentHubId);
    }
    return neighbors;
  }

  function createAgent() {
    var hubs = nodes.filter(function (n) { return n.type === "hub"; });
    var startId = hubs[Math.floor(Math.random() * hubs.length)].id;
    var neighbors = getNeighbors(startId);
    var targetId = neighbors.length > 0 ? neighbors[Math.floor(Math.random() * neighbors.length)] : startId;
    return { currentNodeId: startId, targetNodeId: targetId, t: Math.random(), speed: 0.003 + Math.random() * 0.004 };
  }

  var agents = [];
  for (var ai = 0; ai < AGENT_COUNT; ai++) agents.push(createAgent());

  /* ── Resize ──────────────────────────────────────────────── */
  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
    projCenterX = width * CANVAS_OFFSET_X;
    projCenterY = height * 0.42;
    targetProjCenterX = projCenterX;
    targetProjCenterY = projCenterY;
  }
  var ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  /* ── Input handlers ──────────────────────────────────────── */
  function onMouseDown(e) {
    if (!introDone) return;
    isDragging = true; autoRotating = false;
    dragStartX = e.clientX; dragStartY = e.clientY;
    dragLastX = e.clientX; dragLastY = e.clientY;
    dragVelX = 0; dragVelY = 0;
  }
  function onMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) { mouseX = x; mouseY = y; }
    else { mouseX = -9999; mouseY = -9999; }
    if (isDragging) {
      var dx = e.clientX - dragLastX, dy = e.clientY - dragLastY;
      camRotY += dx * 0.005; camRotX += dy * 0.005;
      camRotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, camRotX));
      dragVelX = dy * 0.005; dragVelY = dx * 0.005;
      dragLastX = e.clientX; dragLastY = e.clientY;
    }
  }
  function onMouseUp() {
    if (isDragging) {
      isDragging = false;
      if (Math.abs(dragLastX - dragStartX) + Math.abs(dragLastY - dragStartY) < 5) autoRotating = true;
    }
  }
  function onMouseLeave() {
    mouseX = -9999; mouseY = -9999; hoveredHub = null;
    if (isDragging) isDragging = false;
  }
  var pinchDist = 0;
  function onTouchStart(e) {
    if (!introDone) return;
    if (e.touches.length === 1) {
      var t = e.touches[0];
      isDragging = true; autoRotating = false;
      dragStartX = t.clientX; dragStartY = t.clientY;
      dragLastX = t.clientX; dragLastY = t.clientY;
      dragVelX = 0; dragVelY = 0; pinchDist = 0;
    } else if (e.touches.length === 2) {
      isDragging = false;
    }
  }
  function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      var t = e.touches[0];
      var dx = t.clientX - dragLastX, dy = t.clientY - dragLastY;
      camRotY += dx * 0.005; camRotX += dy * 0.005;
      camRotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, camRotX));
      dragVelX = dy * 0.005; dragVelY = dx * 0.005;
      dragLastX = t.clientX; dragLastY = t.clientY;
    }
  }
  function onTouchEnd(e) {
    if (e.touches.length === 0) { isDragging = false; pinchDist = 0; }
    else if (e.touches.length === 1) pinchDist = 0;
  }

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mouseleave", onMouseLeave);

  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd);

  /* ── Hit detection ───────────────────────────────────────── */
  function findHoveredHub() {
    var closest = null, closestDist = Infinity;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.type !== "hub" || n._alpha < 0.15) continue;
      var dx = n._sx - mouseX, dy = n._sy - mouseY;
      var dd = Math.sqrt(dx * dx + dy * dy);
      var hitSize = Math.max(HIT_RADIUS, n.radius * n._scale * 2.5);
      if (dd < hitSize && dd < closestDist) { closest = n; closestDist = dd; }
    }
    return closest;
  }

  /* ── Draw helpers ────────────────────────────────────────── */
  function drawNebula() {
    for (var i = 0; i < nebulaPatches.length; i++) {
      var p = nebulaPatches[i];
      var cx = p.x * width, cy = p.y * height;
      var rx = p.rx * width, ry = p.ry * height;
      ctx.save();
      ctx.scale(1, ry / rx);
      var g = ctx.createRadialGradient(cx, cy * (rx / ry), 0, cx, cy * (rx / ry), rx);
      g.addColorStop(0, "rgba(" + p.r + "," + p.g + "," + p.b + "," + p.alpha + ")");
      g.addColorStop(0.4, "rgba(" + p.r + "," + p.g + "," + p.b + "," + (p.alpha * 0.4) + ")");
      g.addColorStop(1, "rgba(" + p.r + "," + p.g + "," + p.b + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy * (rx / ry), rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawNode(node) {
    var pr = project(node.wx, node.wy, node.wz);
    var sx = pr.sx, sy = pr.sy, scale = pr.scale, rz = pr.rz;
    if (sx < -120 || sx > width + 120 || sy < -120 || sy > height + 120) return;
    var da = depthAlpha(rz, scale);
    node._sx = sx; node._sy = sy; node._rz = rz; node._alpha = da; node._scale = scale;
    if (da <= 0.05) return;

    var r = node.radius * scale;
    var pulse = 0.7 + 0.3 * Math.sin(time * 0.02 + node.pulseOffset);
    var isHovered = hoveredHub === node;

    if (node.type === "hub") {
      var hm = isHovered ? 1.5 : 1.0;

      var hazeR = r * 5.5 * pulse * hm;
      var hazeGrad = ctx.createRadialGradient(sx, sy, r * 0.8, sx, sy, hazeR);
      hazeGrad.addColorStop(0, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (da * 0.09 * hm) + ")");
      hazeGrad.addColorStop(0.3, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (da * 0.04) + ")");
      hazeGrad.addColorStop(0.65, "rgba(" + C.r + "," + Math.floor(C.g * 0.4) + "," + C.b + "," + (da * 0.018) + ")");
      hazeGrad.addColorStop(1, "rgba(" + C.r + "," + Math.floor(C.g * 0.3) + "," + C.b + ",0)");
      ctx.beginPath(); ctx.arc(sx, sy, hazeR, 0, Math.PI * 2); ctx.fillStyle = hazeGrad; ctx.fill();

      var midR = r * 3.2 * pulse * hm;
      var midGrad = ctx.createRadialGradient(sx, sy, r * 0.6, sx, sy, midR);
      midGrad.addColorStop(0, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (da * 0.22 * hm) + ")");
      midGrad.addColorStop(0.5, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (da * 0.08) + ")");
      midGrad.addColorStop(1, "rgba(" + C.r + "," + C.g + "," + C.b + ",0)");
      ctx.beginPath(); ctx.arc(sx, sy, midR, 0, Math.PI * 2); ctx.fillStyle = midGrad; ctx.fill();

      var hotR = r * 1.8 * hm;
      var hotGrad = ctx.createRadialGradient(sx, sy, r * 0.3, sx, sy, hotR);
      hotGrad.addColorStop(0, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (da * 0.38 * hm) + ")");
      hotGrad.addColorStop(0.6, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (da * 0.14) + ")");
      hotGrad.addColorStop(1, "rgba(" + C.r + "," + C.g + "," + C.b + ",0)");
      ctx.beginPath(); ctx.arc(sx, sy, hotR, 0, Math.PI * 2); ctx.fillStyle = hotGrad; ctx.fill();

      ctx.beginPath(); ctx.arc(sx, sy, r * 1.4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(" + C.r + "," + C.g + "," + C.b + "," + (da * 0.50 * hm) + ")";
      ctx.lineWidth = 1.2 * hm;
      ctx.shadowColor = "rgba(" + C.r + "," + C.g + "," + C.b + "," + (0.65 * hm) + ")";
      ctx.shadowBlur = 13 * scale * hm;
      ctx.stroke(); ctx.shadowBlur = 0;

      ctx.beginPath(); ctx.arc(sx, sy, r * 1.4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(" + C.r + "," + C.g + "," + C.b + "," + (da * 0.14) + ")";
      ctx.lineWidth = 3 * hm; ctx.stroke();

      ctx.beginPath(); ctx.arc(sx, sy, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + (da * 0.95) + ")";
      ctx.shadowColor = "rgba(" + C.r + "," + C.g + "," + C.b + ",0.95)";
      ctx.shadowBlur = isHovered ? 32 * scale : 18 * scale;
      ctx.fill(); ctx.shadowBlur = 0;

      ctx.beginPath(); ctx.arc(sx, sy, r * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + da + ")"; ctx.fill();
    } else if (node.type === "cluster") {
      var cGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.5);
      cGlow.addColorStop(0, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (da * 0.15) + ")");
      cGlow.addColorStop(1, "rgba(" + C.r + "," + C.g + "," + C.b + ",0)");
      ctx.beginPath(); ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2); ctx.fillStyle = cGlow; ctx.fill();
      ctx.beginPath(); ctx.arc(sx, sy, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + (da * 0.8) + ")";
      ctx.shadowBlur = 8 * scale; ctx.shadowColor = "rgba(" + C.r + "," + C.g + "," + C.b + ",0.6)";
      ctx.fill(); ctx.shadowBlur = 0;
    } else {
      var lGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2);
      lGlow.addColorStop(0, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (da * 0.1) + ")");
      lGlow.addColorStop(1, "rgba(" + C.r + "," + C.g + "," + C.b + ",0)");
      ctx.beginPath(); ctx.arc(sx, sy, r * 2, 0, Math.PI * 2); ctx.fillStyle = lGlow; ctx.fill();
      ctx.beginPath(); ctx.arc(sx, sy, r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + (da * 0.5) + ")";
      ctx.shadowBlur = 4 * scale; ctx.shadowColor = "rgba(" + C.r + "," + C.g + "," + C.b + ",0.4)";
      ctx.fill(); ctx.shadowBlur = 0;
    }

    if (node.label && scale > 0.15 && da > 0.25) {
      var fs = node.type === "hub" ? Math.max(11, 16 * scale) : Math.max(8, 11 * scale);
      var isHub = node.type === "hub";
      var labelText = isHub ? node.label.toUpperCase() : node.label;
      ctx.font = "500 " + fs + "px 'IBM Plex Mono', monospace";
      var textW = ctx.measureText(labelText).width;
      var padX = 6 * scale, padY = 3 * scale;
      var tagX = sx - textW / 2;
      var labelGap = isHub ? 40 * scale : 25 * scale;
      var tagY = sy + r + labelGap;
      var tagAlpha = da * (isHub ? 0.75 : 0.4);

      ctx.strokeStyle = "rgba(255,255,255," + (tagAlpha * 0.35) + ")";
      ctx.lineWidth = 0.7;
      ctx.strokeRect(tagX - padX, tagY - fs * 0.8 - padY, textW + padX * 2, fs + padY * 2);
      ctx.fillStyle = "rgba(0,0,0," + (tagAlpha * 0.3) + ")";
      ctx.fillRect(tagX - padX, tagY - fs * 0.8 - padY, textW + padX * 2, fs + padY * 2);
      ctx.fillStyle = "rgba(255,255,255," + tagAlpha + ")";
      ctx.fillText(labelText, tagX, tagY);
    }
  }

  /* ── Edges ───────────────────────────────────────────────── */
  function drawCurvedEdge(x1, y1, x2, y2, alpha, lineW, progress) {
    if (progress === undefined) progress = 1;
    if (progress <= 0) return;
    var isPartial = progress < 0.999;
    if (isPartial) {
      var chordLen = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) + 0.5;
      ctx.setLineDash([chordLen * progress, chordLen * 2.2]);
    }
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    var curvature = len * 0.08;
    var nx = -dy / (len || 1), ny = dx / (len || 1);
    var cp1x = mx + nx * curvature * 0.6, cp1y = my + ny * curvature * 0.6;
    var cp2x = mx + nx * curvature * 0.4, cp2y = my + ny * curvature * 0.4;

    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    var bloomGrad = ctx.createLinearGradient(x1, y1, x2, y2);
    bloomGrad.addColorStop(0, "rgba(255,255,255," + (alpha * 0.03) + ")");
    bloomGrad.addColorStop(0.5, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (alpha * 0.05) + ")");
    bloomGrad.addColorStop(1, "rgba(255,255,255," + (alpha * 0.02) + ")");
    ctx.strokeStyle = bloomGrad; ctx.lineWidth = lineW * 6; ctx.stroke();

    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    var glowGrad = ctx.createLinearGradient(x1, y1, x2, y2);
    glowGrad.addColorStop(0, "rgba(255,255,255," + (alpha * 0.06) + ")");
    glowGrad.addColorStop(0.5, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (alpha * 0.09) + ")");
    glowGrad.addColorStop(1, "rgba(255,255,255," + (alpha * 0.05) + ")");
    ctx.strokeStyle = glowGrad; ctx.lineWidth = lineW * 2.5; ctx.stroke();

    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    var coreGrad = ctx.createLinearGradient(x1, y1, x2, y2);
    coreGrad.addColorStop(0, "rgba(255,255,255," + (alpha * 0.45) + ")");
    coreGrad.addColorStop(0.3, "rgba(255,200,140," + (alpha * 0.35) + ")");
    coreGrad.addColorStop(0.7, "rgba(" + C.r + "," + C.g + "," + C.b + "," + (alpha * 0.4) + ")");
    coreGrad.addColorStop(1, "rgba(255,255,255," + (alpha * 0.3) + ")");
    ctx.strokeStyle = coreGrad; ctx.lineWidth = lineW; ctx.stroke();
    if (isPartial) ctx.setLineDash([]);
  }

  function drawEdges() {
    var drawn = new Set();
    var edgeList = [];

    nodes.forEach(function (node) {
      if (node._alpha < 0.05) return;
      if (node.type === "hub") {
        node.connectedHubIds.forEach(function (targetId) {
          var other = nodeById.get(targetId);
          if (!other || other._alpha < 0.05) return;
          var key = Math.min(node.id, other.id) + "-" + Math.max(node.id, other.id);
          if (drawn.has(key)) return; drawn.add(key);
          var hubProg = webBuildComplete ? 1 : (edgeRevealMap.get(key) || 0);
          if (hubProg <= 0) return;
          var minA = Math.min(node._alpha, other._alpha);
          if (minA < 0.1) return;
          var edgeAlpha = Math.pow(minA, 1.5) * 0.9;
          var sdx = node._sx - other._sx, sdy = node._sy - other._sy;
          var sDist = Math.sqrt(sdx * sdx + sdy * sdy);
          if (sDist > 600) return;
          var distFade = sDist > 420 ? 1 - (sDist - 420) / 180 : 1;
          edgeList.push({ x1: node._sx, y1: node._sy, x2: other._sx, y2: other._sy, alpha: edgeAlpha * distFade, lineW: 1.2, avgZ: (node._rz + other._rz) / 2, progress: hubProg });
        });
      } else {
        if (node.parentHubId === null) return;
        var phub = nodeById.get(node.parentHubId);
        if (!phub || phub._alpha < 0.05) return;
        var key = Math.min(node.id, phub.id) + "-" + Math.max(node.id, phub.id);
        if (drawn.has(key)) return; drawn.add(key);
        var leafProg = webBuildComplete ? 1 : (edgeRevealMap.get(key) || 0);
        if (leafProg <= 0) return;
        var minA = Math.min(node._alpha, phub._alpha);
        if (minA < 0.1) return;
        var edgeAlpha = Math.pow(minA, 1.5) * 0.85;
        var sdx = node._sx - phub._sx, sdy = node._sy - phub._sy;
        var sDist = Math.sqrt(sdx * sdx + sdy * sdy);
        if (sDist > 420) return;
        var distFade = sDist > 280 ? 1 - (sDist - 280) / 140 : 1;
        edgeList.push({ x1: node._sx, y1: node._sy, x2: phub._sx, y2: phub._sy, alpha: edgeAlpha * distFade, lineW: node.type === "cluster" ? 0.9 : 0.55, avgZ: (node._rz + phub._rz) / 2, progress: leafProg });
      }
    });

    decoEdges.forEach(function (de) {
      var a = nodeById.get(de.a), b = nodeById.get(de.b);
      if (!a || !b || a._alpha < 0.08 || b._alpha < 0.08) return;
      var key = "deco-" + de.a + "-" + de.b;
      var fKey = Math.min(de.a, de.b) + "-" + Math.max(de.a, de.b);
      if (drawn.has(key) || drawn.has(fKey)) return; drawn.add(key);
      var decoProg = webBuildComplete ? 1 : (edgeRevealMap.get(fKey) || 0);
      if (decoProg <= 0) return;
      var minA = Math.min(a._alpha, b._alpha);
      var sdx = a._sx - b._sx, sdy = a._sy - b._sy;
      var sDist = Math.sqrt(sdx * sdx + sdy * sdy);
      if (sDist > 480) return;
      var distFade = sDist > 260 ? 1 - (sDist - 260) / 220 : 1;
      var decoAlpha = Math.pow(minA, 1.2) * 0.32 * distFade;
      if (decoAlpha < 0.005) return;
      edgeList.push({ x1: a._sx, y1: a._sy, x2: b._sx, y2: b._sy, alpha: decoAlpha, lineW: 0.7, avgZ: (a._rz + b._rz) / 2, progress: decoProg });
    });

    edgeList.sort(function (a, b) { return a.avgZ - b.avgZ; });
    edgeList.forEach(function (e) { drawCurvedEdge(e.x1, e.y1, e.x2, e.y2, e.alpha, e.lineW, e.progress); });
  }

  /* ── Draw agents ─────────────────────────────────────────── */
  function drawAgents() {
    agents.forEach(function (agent) {
      var src = nodeById.get(agent.currentNodeId);
      var dst = nodeById.get(agent.targetNodeId);
      if (!src || !dst) return;
      agent.t += agent.speed;
      var awx = src.wx + (dst.wx - src.wx) * agent.t;
      var awy = src.wy + (dst.wy - src.wy) * agent.t;
      var awz = src.wz + (dst.wz - src.wz) * agent.t;
      if (agent.t >= 1) {
        agent.t = 0;
        agent.currentNodeId = agent.targetNodeId;
        var neighbors = getNeighbors(agent.currentNodeId);
        if (neighbors.length > 0) {
          var filtered = neighbors.filter(function (id) { return id !== src.id; });
          var pool = filtered.length > 0 ? filtered : neighbors;
          agent.targetNodeId = pool[Math.floor(Math.random() * pool.length)];
        }
      }
      var pr = project(awx, awy, awz);
      var da = depthAlpha(pr.rz, pr.scale);
      if (da <= 0.05) return;
      var coreR = 2.2 * pr.scale + 1.0;
      var pulse = 0.85 + 0.15 * Math.sin(time * 0.1 + agent.currentNodeId);

      ctx.beginPath(); ctx.arc(pr.sx, pr.sy, coreR * 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,220,255," + (da * 0.08 * pulse) + ")"; ctx.fill();
      ctx.beginPath(); ctx.arc(pr.sx, pr.sy, coreR * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220,235,255," + (da * 0.2 * pulse) + ")"; ctx.fill();
      ctx.beginPath(); ctx.arc(pr.sx, pr.sy, coreR * 1.0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + (da * 0.95 * pulse) + ")";
      ctx.shadowColor = "rgba(200,230,255,0.9)"; ctx.shadowBlur = 14 * pr.scale;
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(pr.sx, pr.sy, coreR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + (da * pulse) + ")"; ctx.fill();
    });
  }

  /* ── Web-build ───────────────────────────────────────────── */
  function drainPendingSpawns() {
    var active = pioneers.filter(function (p) { return !p.done; }).length;
    var slots = Math.max(0, MAX_PIONEER_CONCURRENT - active);
    var toSpawn = pendingSpawns.splice(0, slots);
    toSpawn.forEach(function (s) {
      pioneers.push({ fromId: s.fromId, toId: s.toId, t: -(Math.random() * 0.15), speed: 0.014 + Math.random() * 0.008, edgeKey: s.edgeKey, done: false });
    });
  }

  function spawnPioneersFrom(nodeId) {
    var neighbors = getNeighbors(nodeId);
    decoEdges.forEach(function (de) {
      if (de.a === nodeId && neighbors.indexOf(de.b) < 0) neighbors.push(de.b);
      if (de.b === nodeId && neighbors.indexOf(de.a) < 0) neighbors.push(de.a);
    });
    neighbors.forEach(function (nid) {
      var key = Math.min(nodeId, nid) + "-" + Math.max(nodeId, nid);
      if (!queuedWebEdges.has(key)) {
        queuedWebEdges.add(key);
        edgeRevealMap.set(key, 0);
        pendingSpawns.push({ fromId: nodeId, toId: nid, edgeKey: key });
      }
    });
    drainPendingSpawns();
  }

  function markAllNodesVisited() {
    var idx = 0;
    nodes.forEach(function (n) {
      if (!visitedWebNodes.has(n.id)) {
        visitedWebNodes.add(n.id);
        nodeVisitTime.set(n.id, time + idx * 4);
        idx++;
      }
    });
  }

  function initWebBuild() {
    var hubs = nodes.filter(function (n) { return n.type === "hub"; });
    var startHub = hubs.reduce(function (best, h) {
      return Math.hypot(h.wx, h.wy, h.wz) < Math.hypot(best.wx, best.wy, best.wz) ? h : best;
    });
    visitedWebNodes.add(startHub.id);
    nodeVisitTime.set(startHub.id, time);
    spawnPioneersFrom(startHub.id);
  }

  function updatePioneers() {
    drainPendingSpawns();
    var toSpawn = [];
    pioneers.forEach(function (p) {
      if (p.done) return;
      p.t += p.speed;
      if (p.t > 0) edgeRevealMap.set(p.edgeKey, Math.min(1, p.t));
      if (p.t >= 1) {
        p.done = true;
        if (!visitedWebNodes.has(p.toId)) {
          visitedWebNodes.add(p.toId);
          nodeVisitTime.set(p.toId, time);
          toSpawn.push(p.toId);
        }
      }
    });
    toSpawn.forEach(function (nid) { spawnPioneersFrom(nid); });
    if (!webBuildComplete && pendingSpawns.length === 0 && pioneers.length > 0 && pioneers.every(function (p) { return p.done; })) {
      webBuildEndTimer++;
      if (webBuildEndTimer > 20) { markAllNodesVisited(); webBuildComplete = true; }
    }
    if (!webBuildComplete && introTimer > 1500) { markAllNodesVisited(); webBuildComplete = true; }
  }

  function drawPioneers() {
    pioneers.forEach(function (p) {
      if (p.done || p.t < 0) return;
      var from = nodeById.get(p.fromId), to = nodeById.get(p.toId);
      if (!from || !to) return;
      var t = Math.min(1, p.t);
      var pr = project(from.wx + (to.wx - from.wx) * t, from.wy + (to.wy - from.wy) * t, from.wz + (to.wz - from.wz) * t);
      var da = depthAlpha(pr.rz, pr.scale);
      if (da <= 0.05) return;
      var coreR = 2.4 * pr.scale + 1.0;
      ctx.beginPath(); ctx.arc(pr.sx, pr.sy, coreR * 5.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180,210,255," + (da * 0.07) + ")"; ctx.fill();
      ctx.beginPath(); ctx.arc(pr.sx, pr.sy, coreR * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220,235,255," + (da * 0.22) + ")"; ctx.fill();
      ctx.beginPath(); ctx.arc(pr.sx, pr.sy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + (da * 0.98) + ")";
      ctx.shadowColor = "rgba(180,220,255,0.95)"; ctx.shadowBlur = 18 * pr.scale;
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(pr.sx, pr.sy, coreR * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + da + ")"; ctx.fill();
    });
  }

  initWebBuild();

  /* ── Main loop ───────────────────────────────────────────── */
  function animate() {
    ctx.fillStyle = "rgba(1,2,10,0.88)";
    ctx.fillRect(0, 0, width, height);
    time++;

    var defaultCX = width * CANVAS_OFFSET_X;
    var defaultCY = height * 0.42;

    if (!introDone) {
      if (!webBuildComplete) updatePioneers();
      introTimer++;
      var t = Math.min(introTimer / INTRO_FRAMES, 1);
      var ease = 1 - Math.pow(1 - t, 3);
      camDist = 2500 + (targetCamDist - 2500) * ease;
      if (t >= 1) camDist = targetCamDist;
      if (t >= 1 && webBuildComplete) introDone = true;
    }

    if (introDone && !isDragging) {
      var foundHub = findHoveredHub();
      if (foundHub) {
        hoveredHub = foundHub; hoverLockedHub = foundHub;
        hoverZoomActive = true; hoverReleaseTimer = 0;
      } else if (hoverZoomActive && hoverLockedHub) {
        hoverReleaseTimer++;
        hoveredHub = hoverLockedHub;
        if (hoverReleaseTimer > HOVER_RELEASE_FRAMES || mouseX < 0) {
          hoveredHub = null; hoverLockedHub = null;
          hoverZoomActive = false; hoverReleaseTimer = 0;
        }
      } else {
        hoveredHub = null; hoverZoomActive = false; hoverReleaseTimer = 0;
      }
    }

    targetProjCenterX = defaultCX;
    targetProjCenterY = defaultCY;
    projCenterX += (targetProjCenterX - projCenterX) * HOVER_LERP;
    projCenterY += (targetProjCenterY - projCenterY) * HOVER_LERP;

    if (hoverZoomActive && hoveredHub && !isDragging) {
      var nodeD = hoveredHub._rz + camDist;
      if (nodeD > 180) {
        var hoverTarget = Math.min(targetCamDist, HOVER_ZOOM_DIST);
        camDist += (hoverTarget - camDist) * HOVER_LERP;
      }
    } else {
      camDist += (targetCamDist - camDist) * 0.05;
    }

    if (!isDragging) {
      if (hoverZoomActive) {
        if (autoRotating) camRotY += AUTO_SPEED * 0.15;
      } else if (autoRotating) {
        camRotY += AUTO_SPEED;
      } else {
        camRotY += dragVelY; camRotX += dragVelX;
        camRotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, camRotX));
        dragVelX *= 0.95; dragVelY *= 0.95;
        if (Math.abs(dragVelX) < 0.0001 && Math.abs(dragVelY) < 0.0001) autoRotating = true;
      }
    }

    drawNebula();

    nodes.forEach(function (n) {
      var pr = project(n.wx, n.wy, n.wz);
      n._sx = pr.sx; n._sy = pr.sy; n._rz = pr.rz; n._scale = pr.scale;
      n._alpha = depthAlpha(pr.rz, pr.scale);
    });

    var projected = nodes.map(function (n) { return { node: n, rz: n._rz }; });
    projected.sort(function (a, b) { return a.rz - b.rz; });

    drawEdges();
    projected.forEach(function (item) {
      var node = item.node;
      if (!webBuildComplete && !visitedWebNodes.has(node.id)) return;
      var fadeMult = nodeVisitTime.has(node.id)
        ? Math.min(1, Math.max(0, (time - nodeVisitTime.get(node.id)) / NODE_FADE_FRAMES))
        : 1;
      ctx.globalAlpha = fadeMult;
      drawNode(node);
      ctx.globalAlpha = 1;
    });

    if (!webBuildComplete) drawPioneers();
    else drawAgents();

    canvas.style.cursor = !introDone ? "default" : isDragging ? "grabbing" : hoveredHub ? "pointer" : "grab";

    var now = time;
    if (hoveredHub && hoveredHub.label && now - lastTooltipUpdate > 3) {
      lastTooltipUpdate = now;
      var canvasRect = canvas.getBoundingClientRect();
      showTooltip(hoveredHub.label, canvasRect.left + hoveredHub._sx, canvasRect.top + hoveredHub._sy);
    } else if (!hoveredHub && currentTooltipLabel !== null) {
      hideTooltip();
    }

    animId = requestAnimationFrame(animate);
  }

  animate();
}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
