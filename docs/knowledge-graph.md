---
title: Knowledge Graph
description: Interactive visual map of all SRv6 concepts and their relationships
hide:
  - toc
  - navigation
tags:
  - navigation
  - graph
---

<style>
#knowledge-graph {
  width: 100%;
  height: calc(100vh - 160px);
  min-height: 500px;
  border: 1px solid rgba(171, 71, 188, 0.2);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(13, 13, 26, 0.8);
  margin: 0.5rem 0;
  position: relative;
}
#knowledge-graph svg {
  display: block;
  width: 100%;
  height: 100%;
}
.graph-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.graph-help {
  color: var(--md-default-fg-color--lighter);
  font-size: 0.8rem;
  margin: 0;
}
.graph-controls {
  display: flex;
  gap: 0.4rem;
}
.graph-controls button {
  background: rgba(171, 71, 188, 0.15);
  border: 1px solid rgba(171, 71, 188, 0.3);
  color: #ce93d8;
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}
.graph-controls button:hover {
  background: rgba(171, 71, 188, 0.3);
  border-color: #ab47bc;
}
.graph-controls button.active {
  background: rgba(171, 71, 188, 0.4);
  border-color: #ab47bc;
}
.graph-filter {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.graph-filter button {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}
.graph-filter button[data-group="core"] { border-color: #ab47bc; color: #ce93d8; }
.graph-filter button[data-group="usecase"] { border-color: #5c6bc0; color: #7986cb; }
.graph-filter button[data-group="rfc"] { border-color: #66bb6a; color: #81c784; }
.graph-filter button[data-group="impl"] { border-color: #ff9800; color: #ffb74d; }
.graph-filter button.active[data-group="core"] { background: rgba(171, 71, 188, 0.3); }
.graph-filter button.active[data-group="usecase"] { background: rgba(92, 107, 192, 0.3); }
.graph-filter button.active[data-group="rfc"] { background: rgba(102, 187, 106, 0.3); }
.graph-filter button.active[data-group="impl"] { background: rgba(255, 152, 0, 0.3); }
#node-tooltip {
  position: fixed;
  background: rgba(13, 13, 26, 0.95);
  border: 1px solid rgba(171, 71, 188, 0.4);
  border-radius: 8px;
  padding: 0.5rem 0.8rem;
  color: #e8e6f0;
  font-size: 0.8rem;
  pointer-events: none;
  display: none;
  z-index: 1000;
  max-width: 200px;
}
#node-tooltip .tooltip-title {
  font-weight: 600;
  color: #ce93d8;
  margin-bottom: 0.2rem;
}
#node-tooltip .tooltip-group {
  font-size: 0.7rem;
  color: var(--md-default-fg-color--lighter);
}
#fullscreen-graph {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  background: #0d0d1a;
  display: none;
}
#fullscreen-graph.active {
  display: block;
}
#fullscreen-graph .close-btn {
  position: absolute;
  top: 1rem; right: 1rem;
  background: rgba(171, 71, 188, 0.2);
  border: 1px solid rgba(171, 71, 188, 0.4);
  color: #ce93d8;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  z-index: 10000;
}
</style>

# :material-graph: Knowledge Graph

<div class="graph-toolbar">
  <p class="graph-help">
    Scroll to zoom &middot; Drag canvas to pan &middot; Drag nodes to move &middot; Click to navigate
  </p>
  <div class="graph-controls">
    <button onclick="resetZoom()" title="Reset view">Reset</button>
    <button onclick="toggleFullscreen()" title="Fullscreen" id="fs-btn">Fullscreen</button>
  </div>
</div>

<div class="graph-toolbar">
  <div class="graph-filter">
    <button data-group="core" class="active" onclick="toggleFilter(this)">Topics</button>
    <button data-group="usecase" class="active" onclick="toggleFilter(this)">Use Cases</button>
    <button data-group="rfc" class="active" onclick="toggleFilter(this)">RFCs</button>
    <button data-group="impl" class="active" onclick="toggleFilter(this)">Implementations</button>
  </div>
</div>

<div id="knowledge-graph"></div>
<div id="node-tooltip"><div class="tooltip-title"></div><div class="tooltip-group"></div></div>
<div id="fullscreen-graph"><button class="close-btn" onclick="toggleFullscreen()">Close</button><div id="fullscreen-container"></div></div>

<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script src="../assets/javascripts/knowledge-graph.js"></script>
