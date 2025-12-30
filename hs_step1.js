// hs_step1.js
(() => {
  try {
    // =============================
    // ORF Help Scout -> NetSuite (Step 1)
    // Pulls:
    // - Order # (from subject)
    // - "Year, Make, Model:" line
    // - Shipping address block
    // Opens NetSuite Sales Order URL with hash:
    //   #orf_order=...&ymm=...&ship=...
    // =============================

    // Set this to your NetSuite Sales Order creation link (base)
    const NETSUITE_SO_URL =
      "https://5424079.app.netsuite.com/app/accounting/transactions/salesord.nl?cf=195&whence=&entity=";

    const pickText = (el) => (el && el.textContent ? el.textContent.trim() : "");
    const pickInner = (el) => (el && el.innerText ? el.innerText.trim() : "");

    function getConversationSubject() {
      const candidates = [
        '[data-cy="conversation-subject"]',
        '[data-testid="conversation-subject"]',
        ".conversationHeader__subject",
        ".c-conversationHeader__subject",
        "header h1",
        "h1",
      ];
      for (const sel of candidates) {
        const t = pickText(document.querySelector(sel));
        if (t) return t;
      }
      return (document.title || "").trim();
    }

    function extractOrderNumber(subject) {
      const m = String(subject || "").match(/New\\s+order\\s*#\\s*(\\d+)/i);
      return m ? m[1] : "";
    }

    function getBestMessageRoot() {
      const candidates = [
        '[data-cy="thread-body"]',
        '[data-testid="thread-body"]',
        '[data-cy="conversation-thread"]',
        '[data-testid="conversation-thread"]',
        ".threadBody",
        ".c-threadBody",
        ".conversationThread",
        ".c-conversationThread",
        ".conversationDetail",
        ".c-conversationDetail",
      ];
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        const txt = pickInner(el);
        if (txt && txt.length > 200) return el;
      }
      return document.body;
    }

    function getLines() {
      const root = getBestMessageRoot();
      const txt = pickInner(root) || pickInner(document.body) || "";
      return txt
        .split(/\\r?\\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    function extractYmm(lines) {
      const line = lines.find((l) => /^Year,\\s*Make,\\s*Model\\s*:/i.test(l));
      if (!line) return "";
      return line.replace(/^Year,\\s*Make,\\s*Model\\s*:\\s*/i, "").trim();
    }

    function extractShippingBlock(lines) {
      const startIdx = lines.findIndex((l) => /^Shipping address$/i.test(l));
      if (startIdx === -1) return "";

      const stopHeaders = [
        /^Billing address$/i,
        /^Order details$/i,
        /^Payment method$/i,
        /^Customer note$/i,
        /^Notes?$/i,
      ];

      let endIdx = lines.length;
      for (let i = startIdx + 1; i < lines.length; i++) {
        if (stopHeaders.some((rx) => rx.test(lines[i]))) {
          endIdx = i;
          break;
        }
      }
      return lines.slice(startIdx + 1, endIdx).join("\\n").trim();
    }

    // Extract
    const subject = getConversationSubject();
    const orderNumber = extractOrderNumber(subject);
    const lines = getLines();
    const ymm = extractYmm(lines);
    const ship = extractShippingBlock(lines);

    if (!orderNumber) {
      alert("Step 1: Could not find Order # in subject. Expected: New order #12345");
      return;
    }
    if (!ymm) {
      alert("Step 1: Could not find 'Year, Make, Model:' line in the conversation.");
      return;
    }
    if (!NETSUITE_SO_URL || NETSUITE_SO_URL.indexOf("netsuite.com") === -1) {
      alert("Step 1: NETSUITE_SO_URL is not set correctly.");
      return;
    }

    // Build hash params
    const hash = new URLSearchParams();
    hash.set("orf_order", orderNumber);
    hash.set("ymm", ymm);
    if (ship) hash.set("ship", ship);

    const url = NETSUITE_SO_URL + "#" + hash.toString();
    window.open(url, "_blank");

    console.log("ORF Step 1 opened NetSuite", {
      subject,
      orderNumber,
      ymm,
      shipPreview: ship ? ship.slice(0, 160) : "",
      url,
    });
  } catch (e) {
    alert("Step 1 failed: " + String(e));
    console.error(e);
  }
})();
