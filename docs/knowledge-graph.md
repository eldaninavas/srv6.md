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
#graph-container {
  width: 100%;
  height: calc(100vh - 200px);
  min-height: 500px;
  border: 1px solid rgba(171, 71, 188, 0.2);
  border-radius: 12px;
  overflow: hidden;
  background: #0a0a18;
  margin: 0.5rem 0;
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
.graph-controls button, .graph-filter button {
  background: rgba(171, 71, 188, 0.15);
  border: 1px solid rgba(171, 71, 188, 0.3);
  color: #ce93d8;
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}
.graph-controls button:hover, .graph-filter button:hover {
  background: rgba(171, 71, 188, 0.3);
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
.graph-filter button.active { background: rgba(171, 71, 188, 0.3); }
.graph-filter button.off { opacity: 0.4; }
</style>

# :material-graph: Knowledge Graph

<div class="graph-toolbar">
  <p class="graph-help">
    Scroll to zoom &middot; Drag canvas to pan &middot; Drag nodes to move &middot; Click to navigate
  </p>
  <div class="graph-controls">
    <button onclick="window._graphCy && window._graphCy.fit(undefined, 30)" title="Reset view">Reset</button>
    <button onclick="toggleFS()" id="fs-btn">Fullscreen</button>
  </div>
</div>
<div class="graph-toolbar">
  <div class="graph-filter" id="filters"></div>
</div>

<div id="graph-container"></div>

<script src="https://cdn.jsdelivr.net/npm/cytoscape@3/dist/cytoscape.min.js"></script>
<script src="../assets/javascripts/knowledge-graph.js"></script>
