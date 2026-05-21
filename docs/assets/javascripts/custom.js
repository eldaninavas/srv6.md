// SRv6.md - Custom JavaScript

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("srv6-loaded");
});

// --- Top Contributors ---

function renderContributors(list, contributors) {
  list.innerHTML = "";
  contributors.slice(0, 3).forEach(function (c) {
    var li = document.createElement("li");
    li.className = "srv6-contributor-item";
    li.innerHTML =
      '<a href="' + c.html_url + '" target="_blank" rel="noopener noreferrer" class="srv6-contributor-link">' +
        '<img src="' + c.avatar_url + '&s=64" alt="' + c.login + '" width="32" height="32" loading="lazy" />' +
        '<span class="srv6-contributor-info">' +
          '<span class="srv6-contributor-name">' + c.login + '</span>' +
          '<span class="srv6-contributor-commits">' + c.contributions + ' commit' + (c.contributions !== 1 ? 's' : '') + '</span>' +
        '</span>' +
      '</a>';
    list.appendChild(li);
  });
}

function loadContributors() {
  var list = document.getElementById("srv6-contributors");
  if (!list) return;

  fetch("https://api.github.com/repos/eldaninavas/srv6.md/contributors?per_page=10")
    .then(function (res) {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then(function (data) {
      var humans = data.filter(function (c) {
        return c.type !== "Bot" && c.login.indexOf("[bot]") === -1;
      });
      if (humans.length > 0) renderContributors(list, humans);
    })
    .catch(function () {
      // API failed — show link fallback without clearing loading state
      list.innerHTML = '<li><a href="https://github.com/eldaninavas/srv6.md/graphs/contributors" target="_blank" rel="noopener" style="font-size:0.75rem;color:#ce93d8">View on GitHub →</a></li>';
    });
}

// Run on initial load and on every MkDocs instant-navigation
document.addEventListener("DOMContentLoaded", loadContributors);

if (typeof document$ !== "undefined") {
  document$.subscribe(function () { loadContributors(); });
}
