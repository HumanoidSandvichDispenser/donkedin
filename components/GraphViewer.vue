<template>
  <div class="graph-viewer">
    <div ref="container" class="graph-container"/>

    <div class="floating-controls">
      <button class="btn" title="Add player" @click="openAddModal">＋</button>
      <button
        class="btn"
        :disabled="!graph.selectedNode"
        title="Remove selected node"
        @click="removeSelectedNode"
      >
        −
      </button>
      <button class="btn" title="Find node" @click="openFindModal">🔍</button>
    </div>

    <PlayerSearchModal
      v-model="showAddModal"
      @select="onAddSelected"
      @close="closeAddModal"
    />

    <div v-if="showFindModal" class="find-modal-overlay">
      <div class="find-modal">
        <div class="form-row">
          <input v-model="filterText" placeholder="Search nodes..." >
          <button class="btn" @click="closeFindModal">Close</button>
        </div>
        <div class="node-list">
          <button
            v-for="n in filteredNodes"
            :key="nKey(n)"
            class="btn-ghost"
            @click="jumpToNode(n)"
          >
            {{ n.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
import fcose from "cytoscape-fcose";
import { useGraphStore } from "@/stores/graph";
import PlayerSearchModal from "@@/components/PlayerSearchModal.vue";

cytoscape.use(cola);
cytoscape.use(fcose);

const props = defineProps<{ initialGraph?: { nodes: any[]; links: any[] } }>();

const container = ref<HTMLDivElement | null>(null);
let cy: cytoscape.Core | null = null;

const graph = useGraphStore();

function makeNodeId(n: any) {
  if (!n) {
    return "";
  }

  if (n.type && n.type !== "player") {
    return `${n.type}:${n.id}`;
  }

  return `player:${n.id}`;
}

function syncStoreToCy() {
  if (!cy) {
    return;
  }

  if (graph.nodes.length === 0 && graph.links.length === 0) {
    cy.elements().remove();
    return;
  }

  // add any missing nodes from store
  for (const n of graph.nodes) {
    const id = makeNodeId(n);
    if (cy.$id(id).length === 0) {
      cy.add({
        data: {
          id,
          label: n.name || n.id,
          origId: n.id,
          type: n.type || "player",
        },
      });
    }
  }

  // add any missing edges from store
  for (const e of graph.links) {
    if (cy.$id(e.id).length === 0) {
      cy.add({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          weight: e.weight ?? 1,
        },
      });
    }
  }

  // update selection classes
  try {
    const selId = graph.selectedNode?.id
      ? makeNodeId({ id: graph.selectedNode.id, type: graph.selectedNode.type })
      : null;
    if (selId) {
      cy.elements().removeClass("selected");
      const el = cy.$id(selId);
      if (el) {
        el.addClass("selected");
      }
    } else {
      cy.elements().removeClass("selected");
    }
  } catch {
    /* ignore */
  }
}

function setupCy(initial?: { nodes: any[]; links: any[] }) {
  if (!container.value) return;
  if (cy) {
    cy.destroy();
    cy = null;
  }

  cy = cytoscape({
    container: container.value,
    elements: {
      nodes: (initial?.nodes || []).map((n: any) => ({
        data: {
          id: makeNodeId(n),
          label: n.name || n.id,
          origId: n.id,
          type: n.type || "player",
        },
      })),
      edges: (initial?.links || []).map((l: any, i: number) => ({
        data: {
          id: `e:${i}`,
          source: makeNodeId(l.source),
          target: makeNodeId(l.target),
          weight: l.weight ?? 1,
        },
      })),
    },
    style: [
      {
        selector: "node",
        style: {
          "font-size": 5,
          "text-valign": "center",
          "text-halign": "center",
          "font-family": "Inter",
          "font-weight": 600,
          "max-width": "100%",
          overflow: "hidden",
          "text-overflow": "ellipsis",
        },
      },
      {
        selector: 'node[type="player"]',
        style: {
          "background-color": "#5b5b5b",
          label: "data(label)",
          color: "#fff",
          width: 30,
          height: 30,
        },
      },
      {
        selector: 'node[type="rgl"]',
        style: {
          "background-color": "#e39b7b",
          label: "data(label)",
          color: "#fff",
          width: 28,
          height: 28,
        },
      },
      {
        selector: 'node[type="etf2l"]',
        style: {
          "background-color": "#89beba",
          label: "data(label)",
          color: "#fff",
          width: 28,
          height: 28,
        },
      },
      { selector: "edge", style: { width: 1, "line-color": "#383135" } },
      {
        selector: "node.selected",
        style: {
          "animation-duration": "150ms",
          "outline-width": 1.5,
          "outline-color": "#e39b7b",
          "outline-offset": 1.5,
          "border-opacity": 1,
          shadow: "0 0 4px #e39b7b",
        },
      },
    ],
    layout: { name: "fcose", animationEasing: "ease-in" },
  });

  // react to store changes by syncing
  watch(
    () => graph.nodes.slice(),
    () => syncStoreToCy(),
  );
  watch(
    () => graph.links.slice(),
    () => {
      syncStoreToCy();
      if (cy) {
        cy.layout({
          name: "fcose",
          animate: true,
          animationDuration: 250,
          animationEasing: "ease-in",
        }).run();
      }
    },
  );

  // update selection immediately when selectedNode changes
  watch(
    () => graph.selectedNode,
    (v) => {
      try {
        if (!cy) {
          return;
        }

        cy.elements().removeClass("selected");

        if (v && v.id) {
          const selId = makeNodeId({ id: v.id, type: v.type });
          const el = cy.$id(selId);
          if (el && el.length) {
            el.addClass("selected");
            // bring selected node to front for visibility
            try {
              el.move({ parent: null });
            } catch {
              /* ignore */
            }
          }
        }
      } catch {
        /* ignore */
      }
    },
    { flush: "post" },
  );

  // single tap selects node (shows details); a quick second tap expands the node
  let tappedBefore: any = null;
  let tappedTimeout: any = null;

  cy.on("tap", "node", (evt) => {
    const node = evt.target;
    const origId = node.data("origId");
    const type = node.data("type") || "player";
    const name = node.data("label") || String(origId);

    // always perform single-click behavior immediately
    graph.selectNode({
      id: String(origId),
      type,
      name,
      raw: { id: origId, labels: [type] },
    });

    if (tappedTimeout && tappedBefore) {
      clearTimeout(tappedTimeout);
      if (tappedBefore === node) {
        // treat as double-click: expand the node as well
        graph.expandNodeById(String(origId), type);
      }
      tappedBefore = null;
      tappedTimeout = null;
      return;
    }

    tappedBefore = node;
    tappedTimeout = setTimeout(() => {
      // timeout expired: no second tap — clear state
      tappedBefore = null;
      tappedTimeout = null;
    }, 300);
  });
}

function centerNode(origId: string, type: string = "player") {
  if (!cy) return;
  try {
    const el = cy.$id(makeNodeId({ id: origId, type }));
    if (el && el.length) {
      cy.animate({ fit: { eles: el, padding: 200 } }, { duration: 450 });
      return;
    }

    // fallback: center first node
    const nodes = cy.nodes();
    if (nodes && nodes.length) {
      try {
        cy.animate(
          { fit: { eles: nodes[0], padding: 400 } },
          { duration: 450 },
        );
      } catch {
        cy.fit(nodes[0], 80);
      }
    }
  } catch {
    try {
      const nodes = cy.nodes();
      if (nodes && nodes.length) cy.fit(nodes[0], 80);
    } catch {
      /* ignore */
    }
  }
}

onMounted(() => setupCy(props.initialGraph));

// floating control state
const showAddModal = ref(false);
const showFindModal = ref(false);
const filterText = ref("");

function openAddModal() {
  showAddModal.value = true;
}

function closeAddModal() {
  showAddModal.value = false;
}

// handle add selection from PlayerSearchModal
async function onAddSelected(res: any) {
  const p = res.player;
  const player = {
    id: p.id,
    rglName: p.rglName,
    etf2lName: p.etf2lName,
    avatarUrl: p.avatarUrl,
  };
  // add node
  graph.addNodeIfMissing({
    id: player.id,
    name: player.rglName ?? player.etf2lName ?? player.id,
    type: "player",
  });
  closeAddModal();

  // run layout then center on the newly-added node
  if (cy) {
    try {
      const layout = cy.layout({
        name: "fcose",
        animate: true,
        animationDuration: 300,
        animationEasing: "ease-in",
      });
      layout.run();
      // wait briefly for layout to reposition
      setTimeout(() => {
        centerNode(String(player.id), "player");
      }, 350);
    } catch {
      // fall back to immediate centering
      centerNode(String(player.id), "player");
    }
  }
}

function openFindModal() {
  showFindModal.value = true;
}

function closeFindModal() {
  showFindModal.value = false;
  filterText.value = "";
}

function removeSelectedNode() {
  if (!graph.selectedNode) {
    return;
  }

  //cy.remove(makeNodeId(graph.selectedNode));
  const id = makeNodeId(graph.selectedNode);
  const node = cy.$id(id);
  cy.remove(node);
  graph.removeNodeById(id);
  cy.edges().forEach((edge) => {
    const edgeId = `e:${edge.source}->${edge.target}`;
    removeEdgeById(edgeId);
  });
}

const nodeList = computed(() =>
  graph.nodes.map((n: any) => ({
    id: n.id,
    name: n.name || n.id,
    type: n.type,
  })),
);
const filteredNodes = computed(() => {
  if (!filterText.value) return nodeList.value;
  const q = filterText.value.toLowerCase();
  return nodeList.value.filter(
    (n: any) =>
      String(n.name).toLowerCase().includes(q) ||
      String(n.id).toLowerCase().includes(q),
  );
});

function nKey(n: any) {
  return `${n.type}:${n.id}`;
}

function jumpToNode(n: any) {
  graph.selectNode({
    id: String(n.id),
    type: n.type,
    name: n.name,
    raw: { id: n.id },
  });
  if (cy) {
    try {
      const el = cy.$id(makeNodeId({ id: n.id, type: n.type }));
      if (el && el.length) {
        cy.animate({ fit: { eles: el, padding: 200 } }, { duration: 350 });
      }
    } catch {
      /* ignore */
    }
  }
  closeFindModal();
}

watch(
  () => props.initialGraph,
  (g) => {
    setupCy(g);
  },
);

onBeforeUnmount(() => {
  if (cy) {
    cy.destroy();
    cy = null;
  }
});
</script>

<style scoped>
.search-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.graph-viewer {
  height: 100%;
  position: relative;
}

.graph-container {
  flex: 1 1 auto;
  height: 100%;
  border: 1px solid var(--muted);
  background-color: var(--surface-0);
}

.controls {
  position: relative;
  z-index: 10;
  margin: 12px 0 12px 0;
}

.btn {
  cursor: pointer;
}

.floating-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 40;
  background: rgba(0, 0, 0, 0);
  padding: 4px;
  border-radius: 8px;
}

.floating-controls .btn {
  padding: 8px 10px;
  min-width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.find-modal-overlay {
  position: absolute;
  top: 56px;
  right: 12px;
  z-index: 50;
}

.find-modal {
  background: var(--surface-0);
  border: 1px solid var(--muted);
  padding: 12px;
  border-radius: 10px;
  width: 280px;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  max-height: 240px;
  overflow: auto;
}

.btn-ghost {
  background: transparent;
  border: none;
  text-align: left;
  padding: 8px;
  border-radius: 8px;
  color: var(--text);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.02);
}
</style>
