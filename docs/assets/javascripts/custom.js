// SRv6.md - Custom JavaScript

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("srv6-loaded");
});

// --- Top Contributors (GitHub API) ---

function loadContributors() {
  const container = document.getElementById("srv6-contributors");
  if (!container) return;

  fetch("https://api.github.com/repos/eldaninavas/srv6.md/contributors?per_page=30")
    .then(function (res) {
      if (!res.ok) throw new Error("GitHub API error: " + res.status);
      return res.json();
    })
    .then(function (contributors) {
      container.innerHTML = "";
      contributors.forEach(function (c) {
        // Skip bots (GitHub Actions, dependabot, etc.)
        if (c.type === "Bot" || c.login.endsWith("[bot]")) return;

        const card = document.createElement("a");
        card.href = c.html_url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.className = "srv6-contributor";
        card.title = c.login + " — " + c.contributions + " commit" + (c.contributions !== 1 ? "s" : "");
        card.innerHTML =
          '<img src="' + c.avatar_url + '&s=128" alt="' + c.login + '" width="64" height="64" loading="lazy">' +
          '<span class="srv6-contributor-name">' + c.login + "</span>" +
          '<span class="srv6-contributor-commits">' + c.contributions + " commit" + (c.contributions !== 1 ? "s" : "") + "</span>";

        container.appendChild(card);
      });

      // If no contributors rendered (all bots), hide section
      if (container.children.length === 0) container.style.display = "none";
    })
    .catch(function () {
      container.innerHTML =
        '<p class="srv6-contributors-fallback">Could not load contributors &mdash; ' +
        '<a href="https://github.com/eldaninavas/srv6.md/graphs/contributors" target="_blank" rel="noopener">view on GitHub</a></p>';
    });
}

// MkDocs Material uses instant navigation (SPA-like) — document$ fires on every navigation.
// Fall back to DOMContentLoaded for non-Material builds.
if (typeof document$ !== "undefined") {
  document$.subscribe(loadContributors);
} else {
  document.addEventListener("DOMContentLoaded", loadContributors);
}
