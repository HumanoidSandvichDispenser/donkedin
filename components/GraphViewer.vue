<template>
  <div>
    <div class="controls">
      <button class="btn" @click="centerFirst">Center First Node</button>
    </div>
    <div ref="container" class="graph-container"></div>
    <div class="legend">
      <span class="dot player" /> Player <span class="dot rgl" /> RGL Team
      <span class="dot etf2l" /> ETF2L Team
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import cytoscape from "cytoscape";

const props = defineProps<{ initialGraph?: { nodes: any[]; links: any[] } }>();

const container = ref<HTMLDivElement | null>(null);
let cy: cytoscape.Core | null = null;

const nuxt = useNuxtApp();
const fetcher = (url: string) =>
  $fetch(url).catch((e: any) => {
    throw e;
  });

function makeNodeId(n: any) {
  if (!n) return "";
  if (n.type && n.type !== "player") return `${n.type}:${n.id}`;
  return `player:${n.id}`;
}

function addNodeIfMissing(node: any) {
  if (!cy) return;
  const id = makeNodeId(node);
  if (cy.$id(id).length === 0) {
    cy.add({
      data: {
        id,
        label: node.name || node.id,
        origId: node.id,
        type: node.type || "player",
      },
    });
  }
}

function addEdgeIfMissing(source: any, target: any, weight = 1) {
  if (!cy) return;
  const sid = makeNodeId(source);
  const tid = makeNodeId(target);
  const edgeId = `e:${sid}->${tid}`;
  if (cy.$id(edgeId).length === 0) {
    cy.add({ data: { id: edgeId, source: sid, target: tid, weight } });
  }
}

async function expandNodeById(origId: string, type: string) {
  try {
    if (type === "player") {
      const res: any = await fetcher(`/api/player/${origId}`);
      if (!res?.found) return;
      const playerNode = {
        id: res.player.id,
        name: res.player.rglName || res.player.etf2lName || res.player.id,
        type: "player",
      };
      addNodeIfMissing(playerNode);
      const teams = res.teams || {};
      for (const t of teams.rgl || []) {
        const teamNode = { id: t.teamId, name: t.teamName, type: "rgl" };
        addNodeIfMissing(teamNode);
        addEdgeIfMissing(playerNode, teamNode, 1);
      }
      for (const t of teams.etf2l || []) {
        const teamNode = { id: t.id, name: t.name, type: "etf2l" };
        addNodeIfMissing(teamNode);
        addEdgeIfMissing(playerNode, teamNode, 1);
      }
    } else if (type === "rgl") {
      const res: any = await fetcher(`/api/team/rgl/${origId}`);
      if (!res?.found) return;
      const team = res.team;
      const teamNode = { id: team.id, name: team.name, type: "rgl" };
      addNodeIfMissing(teamNode);
      for (const p of res.players || []) {
        const playerNode = { id: p.id, name: p.name, type: "player" };
        addNodeIfMissing(playerNode);
        addEdgeIfMissing(playerNode, teamNode, 1);
      }
    } else if (type === "etf2l") {
      const res: any = await fetcher(`/api/team/etf2l/${origId}`);
      if (!res?.found) return;
      const team = res.team;
      const teamNode = { id: team.id, name: team.name, type: "etf2l" };
      addNodeIfMissing(teamNode);
      for (const p of res.players || []) {
        const playerNode = { id: p.id, name: p.name, type: "player" };
        addNodeIfMissing(playerNode);
        addEdgeIfMissing(playerNode, teamNode, 1);
      }
    }

    if (cy) {
      const layout = cy.layout({ name: "cose", animate: true });
      layout.run();
    }
  } catch (err) {
    console.error("Expand node failed", err);
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
        selector: 'node',
        style: {
          "font-size": 8,
          "text-valign": "center",
          "text-halign": "center",
        },
      },
      {
        selector: 'node[type="player"]',
        style: {
          "background-color": "#3366ff",
          label: "data(label)",
          color: "#fff",
          width: 30,
          height: 30,
        },
      },
      {
        selector: 'node[type="rgl"]',
        style: {
          "background-color": "#ff6633",
          label: "data(label)",
          color: "#fff",
          width: 28,
          height: 28,
        },
      },
      {
        selector: 'node[type="etf2l"]',
        style: {
          "background-color": "#33cc66",
          label: "data(label)",
          color: "#fff",
          width: 28,
          height: 28,
        },
      },
      { selector: "edge", style: { width: 2, "line-color": "#999" } },
    ],
    layout: { name: "cose" },
  });

  cy.on("tap", "node", (evt) => {
    const node = evt.target;
    const origId = node.data("origId");
    const type = node.data("type");
    expandNodeById(String(origId), type);
  });

  cy.on("dragfree", "node", (evt) => {
    const node = evt.target;
    const neighborhood = node.closedNeighborhood();
    const layout = neighborhood.layout({

      name: "cose",

      animate: true,
      animationDuration: 400,
      fit: false,
      randomize: false,
      gravity: 0.25,
      idealEdgeLength: 50,
    })
  });
}

function centerFirst() {
  if (!cy) return;
  const nodes = cy.nodes();
  if (!nodes || nodes.length === 0) return;
  const first = nodes[0];
  try {
    cy.animate({ fit: { eles: first, padding: 80 } }, { duration: 450 });
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
.graph-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
}

.controls {
  position: absolute;
  z-index: 10;
  margin: 12px;
}

.btn {
  background: #fff;
  border: 1px solid #ddd;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.legend {
  margin-top: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 14px;
}

.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.dot.player {
  background: #3366ff;
}

.dot.rgl {
  background: #ff6633;
}

.dot.etf2l {
  background: #33cc66;
}
</style>
