// ns_step2.js
(() => {
  try {
    // =============================
    // ORF NetSuite Autofill (Step 2)
    // =============================

    const params = new URLSearchParams(location.hash.slice(1));

    const orderNumber = params.get("orf_order") || "";
    const ymmRaw = params.get("ymm") || "";
    const shipFromHS = params.get("ship") || "";

    if (!orderNumber || !ymmRaw) {
      alert("Step 2: Missing data from Step 1. Run Step 1 first.");
      return;
    }

    // Parse YMM
    const parts = ymmRaw.split(/\s+/);
    const ymmYear = parts[0] || "";
    const ymmMake = parts[1] || "";
    const ymmModel = parts.slice(2).join(" ");

    // -----------------------------
    // Helpers
    // -----------------------------
    const fire = (el, t) =>
      el && el.dispatchEvent(new Event(t, { bubbles: true }));

    const setField = (sel, val) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.focus();
      el.value = val;
      fire(el, "input");
      fire(el, "change");
      el.blur();
      return true;
    };

    const typeThenTab = (sel, val) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.focus();
      el.value = val;
      fire(el, "input");
      fire(el, "keyup");
      fire(el, "change");
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true })
      );
      el.blur();
      return true;
    };

    const ensureChecked = (sel) => {
      const el = document.querySelector(sel);
      if (el && !el.checked) el.click();
      return el?.checked;
    };

    // -----------------------------
    // Autofill fields
    // -----------------------------
    setField("#custbody_sd_orf_invoice_number", "ORF-" + orderNumber);
    setField("#custbody_sd_ymm", ymmRaw);
    setField("#custbody_sd_ymm_year", ymmYear);
    setField("#custbody_sd_ymm_make", ymmMake);
    setField("#custbody_sd_ymm_model", ymmModel);

    typeThenTab("#inpt_class_6", "ORF");
    typeThenTab("#inpt_location_7", "Wrightstown Facility : Wrightstown (SD Wheel)");
    typeThenTab("#taxitem_display", "-Not Taxable-");

    ensureChecked("#custbody_sd_new_so_reminder_check_fs_inp");
    ensureChecked("#custbody_tirebundle_fs_inp");

    // -----------------------------
    // Shipping address comparison
    // -----------------------------
    const normalize = (s) =>
      String(s || "")
        .replace(/United States$/i, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const nsShip =
      document.querySelector("#shipaddress")?.value || "";

    if (shipFromHS && nsShip) {
      if (normalize(shipFromHS) !== normalize(nsShip)) {
        alert(
          "Shipping address mismatch.\n\nHelp Scout:\n" +
            shipFromHS +
            "\n\nNetSuite:\n" +
            nsShip
        );
      }
    }

    console.log("ORF Step 2 completed", {
      orderNumber,
      ymmRaw,
    });
  } catch (e) {
    alert("Step 2 failed: " + String(e));
    console.error(e);
  }
})();
