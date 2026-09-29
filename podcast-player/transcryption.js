(function () {
  const root = document.getElementById("pt-transcript-root");
  if (!root) return;

  const transcriptUrl = (root.getAttribute("data-transcript-url") || "").trim();
  if (!transcriptUrl) {
    root.innerHTML = '<div class="new_t16">Transcript URL is missing.</div>';
    return;
  }

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const renderRows = (rows) => {
    const body = document.createElement("div");
    body.className = "pt-body";

    rows.forEach((row) => {
      const speaker = escapeHtml(row.speaker || "");
      const timestamp = escapeHtml(row.timestamp || "");
      const text = escapeHtml(row.text || "");

      const item = document.createElement("div");
      item.className = "pt-row";
      item.innerHTML =
        '<div class="pt-info">' +
        '<div class="new_t16">' + speaker + "</div>" +
        '<div class="new_t16 _w-300 underline">' + timestamp + "</div>" +
        "</div>" +
        '<div class="pt-text">' +
        '<div class="new_t16 lh-160 _w-300">' + text + "</div>" +
        "</div>";

      body.appendChild(item);
    });

    root.innerHTML = "";
    root.appendChild(body);
  };

  root.innerHTML = '<div class="new_t16">Loading transcript...</div>';

  fetch(transcriptUrl, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const rows = Array.isArray(data.rows) ? data.rows : [];
      if (!rows.length) {
        root.innerHTML = '<div class="new_t16">Transcript is empty.</div>';
        return;
      }
      renderRows(rows);
    })
    .catch((error) => {
      root.innerHTML =
        '<div class="new_t16">Failed to load transcript. Check JSON URL and CORS settings.</div>';
      console.error("Transcript fetch error:", error);
    });
})();