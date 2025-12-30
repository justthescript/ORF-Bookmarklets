// bookmarklet_loader.js
// This file exists mainly for reference and sharing.
// Staff will use the bookmarklet shown in the README (or generated from this).

(function () {
  const url =
    "https://cdn.jsdelivr.net/gh/justthescript/ORF-Bookmarklets@main/hs_step1.js";
  const bookmarklet =
    "javascript:(()=>{var s=document.createElement('script');s.src='" +
    url +
    "?v='+Date.now();document.head.appendChild(s);})();";

  console.log("ORF Step 1 Bookmarklet:\n" + bookmarklet);
})();
