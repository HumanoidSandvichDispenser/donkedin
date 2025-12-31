<template>
  <div class="graph-viewer">
    <div class="controls">
      <div class="search-controls">
        <input
          class="input"
          v-model="source"
          placeholder="source (rgl:alias, etf2l:alias, or steamid64)"
        />
        <input
          class="input"
          v-model="dest"
          placeholder="destination (optional)"
        />
        <button class="btn" @click="handleLoad">Load</button>
        <button class="btn" @click="centerFirst">Center First Node</button>
      </div>
    </div>
    <div ref="container" class="graph-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
import fcose from "cytoscape-fcose";
import { useGraphStore } from "@/stores/graph";

cytoscape.use(cola);
cytoscape.use(fcose);

const props = defineProps<{ initialGraph?: { nodes: any[]; links: any[] } }>();

const container = ref<HTMLDivElement | null>(null);
let cy: cytoscape.Core | null = null;
let liveLayout: any = null;

const graph = useGraphStore();

const source = ref("");
const dest = ref("");

function makeNodeId(n: any) {
  if (!n) return "";
  if (n.type && n.type !== "player") return `${n.type}:${n.id}`;
  return `player:${n.id}`;
}

function syncStoreToCy() {
  if (!cy) return;

  // add any missing nodes from store
  for (const n of graph.nodes) {
    const id = makeNodeId(n);
    if (cy.$id(id).length === 0) {
      cy.add({ data: { id, label: n.name || n.id, origId: n.id, type: n.type || 'player' } });
    }
  }

  // add any missing edges from store
  for (const e of graph.links) {
    if (cy.$id(e.id).length === 0) {
      cy.add({ data: { id: e.id, source: e.source, target: e.target, weight: e.weight ?? 1 } });
    }
  }
}

function clearCy() {
  if (!cy) return;
  cy.elements().remove();
}

async function handleLoad() {
  if (!source.value) return;

  // clear existing graph
  clearCy();
  graph.clear();

  // Always add source node
  if (!dest.value) {
    await graph.loadSourceOnly(source.value);
    syncStoreToCy();
    return;
  }

  // dest provided: call path API to get nodes and segments
  await graph.loadPath(source.value, dest.value);
  syncStoreToCy();

  if (cy) {
    const layout = cy.layout({
      name: 'fcose',
      animate: true,
      animationDuration: 250,
      animationEasing: "ease-in",
      fit: true,
    });
    layout.run();
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
          type: n.type || 'player',
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
        selector: 'node',
        style: {
          'font-size': 5,
          'text-valign': 'center',
          'text-halign': 'center',
          'font-family': 'Inter',
          'font-weight': 600,
          'max-width': '100%',
          'overflow': 'hidden',
          'text-overflow': 'ellipsis',
        },
      },
      {
        selector: 'node[type="player"]',
        style: {
          'background-color': '#5b5b5b',
          label: 'data(label)',
          color: '#fff',
          width: 30,
          height: 30,
        },
      },
      {
        selector: 'node[type="rgl"]',
        style: {
          'background-color': '#e39b7b',
          label: 'data(label)',
          color: '#fff',
          width: 28,
          height: 28,
        },
      },
      {
        selector: 'node[type="etf2l"]',
        style: {
          'background-color': '#89beba',
          label: 'data(label)',
          color: '#fff',
          width: 28,
          height: 28,
        },
      },
      { selector: 'edge', style: { width: 1, 'line-color': '#383135' } },
    ],
    layout: { name: 'fcose', animationEasing: "ease-in" },
  });

  // react to store changes by syncing
  watch(() => graph.nodes.slice(), () => syncStoreToCy());
  watch(() => graph.links.slice(), () => {
    syncStoreToCy();
    if (cy) {
      cy
        .layout({
          name: 'fcose',
          animate: true,
          animationDuration: 250,
          animationEasing: "ease-in",
        })
        .run();
    }
  });

  cy.on('tap', 'node', (evt) => {
    const node = evt.target;
    const origId = node.data('origId');
    const type = node.data('type');
    graph.expandNodeById(String(origId), type);
  });
}

function centerFirst() {
  if (!cy) return;
  const nodes = cy.nodes();
  if (!nodes || nodes.length === 0) return;
  const first = nodes[0];
  try {
    cy.animate({ fit: { eles: first, padding: 400 } }, { duration: 450 });
  } catch (err) {
    // fallback to immediate fit
    cy.fit(first, 80);
  }
}

onMounted(() => setupCy(props.initialGraph));

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
.graph-viewer {
  height: 100%;
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
  background: #fff;
  border: 1px solid #ddd;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
