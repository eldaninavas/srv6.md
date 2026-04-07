// SRv6.md - Custom JavaScript

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("srv6-loaded");
});

// Fix mermaid node text color.
// Mermaid puts style="color:#fff" on .nodeLabel <span> but the <p> inside
// doesn't inherit inline styles. We fix this by forcing color on ALL
// children inside .nodeLabel after mermaid renders.
function fixMermaidTextColor() {
  document.querySelectorAll(".mermaid .nodeLabel").forEach(function(label) {
    var color = label.style.color;
    if (color) {
      label.querySelectorAll("*").forEach(function(child) {
        child.style.color = color;
      });
    }
  });
}

// Run fix after mermaid renders — use multiple strategies to be safe
// 1. MutationObserver for dynamic renders
var mermaidObserver = new MutationObserver(function(mutations) {
  for (var i = 0; i < mutations.length; i++) {
    if (mutations[i].addedNodes.length) {
      fixMermaidTextColor();
      break;
    }
  }
});
mermaidObserver.observe(document.body, { childList: true, subtree: true });

// 2. Periodic check for first few seconds (catches race conditions)
var checks = 0;
var interval = setInterval(function() {
  fixMermaidTextColor();
  checks++;
  if (checks > 10) clearInterval(interval);
}, 500);

// 3. On page navigation (MkDocs Material SPA)
if (typeof document$ !== "undefined") {
  document$.subscribe(function() {
    setTimeout(fixMermaidTextColor, 500);
    setTimeout(fixMermaidTextColor, 1500);
    setTimeout(fixMermaidTextColor, 3000);
  });
}
