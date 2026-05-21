// SRv6.md - Custom JavaScript

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("srv6-loaded");
});

// --- Top Contributors (GitHub API) ---

function loadContributors() {
  var container = document.getElementById("srv6-contributors");
  if (!container) return;

  // Already loaded (avoid re-fetching on instant navigation back)
  if (container.dataset.loaded) return;
  container.dataset.loaded = "1";

  fetch("https://api.github.com/repos/eldaninavas/srv6.md/contributors?per_page=30")
    .then(function (res) {
      if (!res.ok) throw new Error("GitHub API error: " + res.status);
      return res.json();
    })
    .then(function (contributors) {
      container.innerHTML = "";
      contributors.forEach(function (c) {
        // Skip bots
        if (c.type === "Bot" || c.login.indexOf("[bot]") !== -1) return;

        var card = document.createElement("a");
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

      if (container.children.length === 0) container.style.display = "none";
    })
    .catch(function () {
      container.innerHTML =
        '<p class="srv6-contributors-fallback">Could not load contributors &mdash; ' +
        '<a href="https://github.com/eldaninavas/srv6.md/graphs/contributors" target="_blank" rel="noopener">view on GitHub</a></p>';
    });
}

// MkDocs Material exposes document$ as a global RxJS observable for instant navigation.
// We wait for DOMContentLoaded first, then check if document$ is available.
document.addEventListener("DOMContentLoaded", function () {
  if (typeof document$ !== "undefined") {
    // Subscribe to every page load (initial + SPA navigations)
    document$.subscribe(function () { loadContributors(); });
  } else {
    loadContributors();
  }
});
