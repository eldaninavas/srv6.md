// SRv6.md - Custom JavaScript

// Smooth scroll offset for fixed header
document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("srv6-loaded");
});

// Fix mermaid node text color — Mermaid sets inline styles on <span>
// but not on <p> inside it, so we propagate the color down
const observer = new MutationObserver(function() {
  document.querySelectorAll(".mermaid .nodeLabel p, .mermaid .nodeLabel span").forEach(function(el) {
    if (!el.style.color) {
      var parent = el.closest("[style*='color']");
      if (parent) el.style.color = parent.style.color;
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });
