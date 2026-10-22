// SRv6.md - Custom JavaScript

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("srv6-loaded");
});

// --- Top Contributors ---

function renderContributors(list, contributors) {
  list.innerHTML = "";
  contributors.slice(0, 6).forEach(function (c) {
    var li = document.createElement("li");
    li.className = "srv6-contributor-item";
    li.innerHTML =
      '<a href="' + c.html_url + '" target="_blank" rel="noopener noreferrer" class="srv6-contributor-link" title="' + c.login + '">' +
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

// Instant navigation swaps the page body but keeps <html>, so keep its lang
// in step with the translated sections (hooks/i18n.py sets it on full loads)
if (typeof document$ !== "undefined") {
  document$.subscribe(function () {
    var m = location.pathname.match(/^\/(es|ja)\//);
    document.documentElement.lang = m ? m[1] : "en";
  });
}

// --- SRv6 support matrix: platform and category filters ---
// hooks/support_matrix.py renders the table and hidden controls; the first
// cell of each row carries data-cat and each header cell data-p.

function initSupportMatrix() {
  var controls = document.querySelector(".smx-controls");
  var table = document.querySelector(".smx table");
  if (!controls || !table) return;

  var cols = {};
  table.querySelectorAll("thead th").forEach(function (th, i) {
    var p = th.querySelector("[data-p]");
    if (p) cols[p.getAttribute("data-p")] = i;
  });
  var rows = Array.prototype.map.call(table.querySelectorAll("tbody tr"), function (tr) {
    var tag = tr.querySelector(".smx-cat, .smx-row");
    if (tag && tag.classList.contains("smx-cat")) tr.classList.add("smx-cat-row");
    if (tag && tag.id) tr.id = tag.id, tag.removeAttribute("id");
    return { tr: tr, cat: tag ? tag.getAttribute("data-cat") : "" };
  });

  var boxes = controls.querySelectorAll("input[type=checkbox]");
  var select = controls.querySelector("select");

  function apply() {
    var shown = {};
    boxes.forEach(function (b) { shown[b.value] = b.checked; });
    Object.keys(cols).forEach(function (p) {
      var i = cols[p];
      table.querySelectorAll("tr").forEach(function (tr) {
        var cell = tr.children[i];
        if (cell) cell.classList.toggle("smx-hide", !shown[p]);
      });
    });
    var cat = select.value;
    rows.forEach(function (r) { r.tr.classList.toggle("smx-hide", !!cat && r.cat !== cat); });
  }

  boxes.forEach(function (b) { b.addEventListener("change", apply); });
  select.addEventListener("change", apply);
  controls.querySelectorAll("[data-smx]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("data-smx") === "all";
      boxes.forEach(function (b) { b.checked = on; });
      apply();
    });
  });

  // The ids moved from the spans to the rows, so re-run the hash scroll
  if (location.hash) {
    var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && target.tagName === "TR") {
      target.classList.add("smx-target");
      target.scrollIntoView({ block: "center" });
    }
  }
  // Open on wide screens; on phones the chips would push the table off screen
  controls.open = window.matchMedia("(min-width: 45em)").matches;
  controls.hidden = false;
}

if (typeof document$ !== "undefined") {
  document$.subscribe(initSupportMatrix);
} else {
  document.addEventListener("DOMContentLoaded", initSupportMatrix);
}
