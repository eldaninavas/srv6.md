// SRv6.md - Custom JavaScript

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("srv6-loaded");
});

// --- Top Contributors (GitHub API) ---

function loadContributors() {
  var container = document.getElementById("srv6-contributors");
  if (!container) return;

  // Prevent duplicate fetches on the same page render
  if (container.dataset.loaded === "1") return;
  container.dataset.loaded = "1";

  fetch("https://api.github.com/repos/eldaninavas/srv6.md/contributors?per_page=20")
    .then(function (res) {
      if (!res.ok) throw new Error("status " + res.status);
      return res.json();
    })
    .then(function (contributors) {
      container.innerHTML = "";
      contributors.forEach(function (c) {
        if (c.type === "Bot" || c.login.indexOf("[bot]") !== -1) return;

        var card = document.createElement("a");
        card.href = c.html_url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.className = "srv6-contributor";
        card.title = c.login + " — " + c.contributions + " commit" + (c.contributions !== 1 ? "s" : "");

        var info = '<span class="srv6-contributor-info">' +
          '<span class="srv6-contributor-name">' + c.login + "</span>" +
          '<span class="srv6-contributor-commits">' + c.contributions + " commit" + (c.contributions !== 1 ? "s" : "") + "</span>" +
          "</span>";

        card.innerHTML =
          '<img src="' + c.avatar_url + '&s=64" alt="' + c.login + '" width="28" height="28" loading="lazy">' +
          info;

        container.appendChild(card);
      });

      if (container.children.length === 0) container.style.display = "none";
    })
    .catch(function () {
      container.innerHTML =
        '<p class="srv6-contributors-fallback">' +
        '<a href="https://github.com/eldaninavas/srv6.md/graphs/contributors" target="_blank" rel="noopener">View on GitHub</a></p>';
    });
}

// MkDocs Material instant navigation: document$ is a global RxJS observable.
// It fires on every page load (initial + SPA navigations).
// IMPORTANT: subscribe at top level — by the time scripts run (defer),
// document$ is defined but the initial emission has already fired,
// so we also call loadContributors() immediately.
if (typeof document$ !== "undefined") {
  document$.subscribe(function () {
    loadContributors();
  });
}

// Immediate call covers the initial page load (works with or without document$)
loadContributors();
