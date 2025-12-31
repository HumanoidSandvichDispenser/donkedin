<template>
  <aside class="path-sidebar">
    <h3>{{ pathTitle }}</h3>

    <div class="flow">
      <template v-if="pathPlayers.length">
        <template v-for="(p, idx) in pathPlayers" :key="pKey(p)">
          <div class="flow-item">
            <div class="player-box">
              <TeammateCard :person="mapPlayer(p.node)" />
            </div>

            <div v-if="idx < pathPlayers.length - 1" class="team-box">
              <TeamCard :team="teamBetween(pathPlayers[idx].index, pathPlayers[idx + 1].index)"/>
            </div>
          </div>
        </template>
      </template>

      <div v-else class="no-path">No path loaded</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGraphStore } from "@/stores/graph";
import TeammateCard from "@@/components/TeammateCard.vue";
import TeamCard from "@@/components/TeamCard.vue";

const graph = useGraphStore();

// nodes in the raw path (in order)
const rawNodes = computed(() => graph.pathInfo?.nodes || []);

// collect only player nodes, preserving their index in the raw path
const pathPlayers = computed(() => {
  const out: Array<{ node: any; index: number }> = [];
  const nodes = rawNodes.value;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const labels = n.labels || [];
    if (
      labels.includes("Player") ||
      (!labels.includes("RglTeam") &&
        !labels.includes("Etf2lTeam") &&
        labels.length === 0)
    ) {
      out.push({ node: n, index: i });
    }
  }
  return out;
});

const pathTitle = computed(() => {
  if (!pathPlayers.value || pathPlayers.value.length < 2) {
    return "Shortest Path";
  }
  const firstNode = pathPlayers.value[0].node;
  const lastNode = pathPlayers.value[pathPlayers.value.length - 1].node;
  const fprops = firstNode.properties;
  const lprops = lastNode.properties;
  const firstName = fprops.rglName ?? fprops.etf2lName;
  const lastName = lprops.rglName ?? lprops.etf2lName;
  const k = Math.max(0, pathPlayers.value.length - 1);
  return `${firstName} and ${lastName} are degree-${k} connections!`;
});

function mapPlayer(n: any) {
  const props = n.properties || {};
  return {
    id: props.id ?? n.id,
    name:
      props.rglName ??
      props.etf2lName ??
      props.name ??
      props.label ??
      String(n.id),
    rglName: props.rglName,
    etf2lName: props.etf2lName,
    raw: n,
  };
}

function pKey(p: { node: any; index: number }) {
  return `${p.node.properties?.id ?? p.node.id}-${p.index}`;
}

function teamBetween(prevIdx: number, currIdx: number) {
  const nodes = rawNodes.value;
  if (!Array.isArray(nodes) || prevIdx >= currIdx) return null;
  const slice = nodes.slice(prevIdx + 1, currIdx);
  for (const n of slice) {
    const labels = n.labels || [];
    if (labels.includes("RglTeam") || labels.includes("Etf2lTeam")) {
      const props = n.properties || {};

      const type = labels.includes("RglTeam")
        ? "rgl"
        : labels.includes("Etf2lTeam")
          ? "etf2l"
          : "team";

      return {
        name:
          props.name ??
          props.label ??
          String(n.id),
        divisionName: props.divisionName,
        seasonName: props.seasonName,
        tag: props.tag,
        type,
      };
    }
  }

  // fallback: try segments
  const segs = graph.pathInfo?.segments || [];
  if (Array.isArray(segs)) {
    for (const s of segs) {
      const startId = s.start?.properties?.id ?? s.start?.id;
      const endId = s.end?.properties?.id ?? s.end?.id;
      const aId = nodes[prevIdx]?.properties?.id ?? nodes[prevIdx]?.id;
      const bId = nodes[currIdx]?.properties?.id ?? nodes[currIdx]?.id;
      if (
        (String(startId) === String(aId) && String(endId) === String(bId)) ||
        (String(startId) === String(bId) && String(endId) === String(aId))
      ) {
        if (
          (s.start?.labels || []).includes("RglTeam") ||
          (s.start?.labels || []).includes("Etf2lTeam")
        ) {
          const t = s.start;
          const props = t.properties || {};
          const labels = t.labels || [];
          const type = labels.includes("RglTeam")
            ? "rgl"
            : labels.includes("Etf2lTeam")
              ? "etf2l"
              : "team";
          return {
            name:
              props.name ??
              props.label ??
              props.rglName ??
              props.etf2lName ??
              String(t.id),
            type,
          };
        }
        if (
          (s.end?.labels || []).includes("RglTeam") ||
          (s.end?.labels || []).includes("Etf2lTeam")
        ) {
          const t = s.end;
          const props = t.properties || {};
          const labels = t.labels || [];
          const type = labels.includes("RglTeam")
            ? "rgl"
            : labels.includes("Etf2lTeam")
              ? "etf2l"
              : "team";
          return {
            name:
              props.name ??
              props.label ??
              props.rglName ??
              props.etf2lName ??
              String(t.id),
            type,
          };
        }
      }
    }
  }
  return null;
}
</script>

<style scoped>
.path-sidebar {
  width: 320px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-left: 1px solid var(--muted);
  padding: 12px;
  background: var(--bg);
  position: relative;
}

.flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 8px 0;
}

/* central vertical line */
.flow::before {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 36px;
  bottom: 16px;
  width: 2px;
  background: var(--muted);
  z-index: 0;
}

.flow-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
  margin-bottom: 12px;
}

.player-box,
.team-box {
  width: 260px;
  display: flex;
  justify-content: center;
}

.team-box {
  margin-top: 6px;
}
</style>
