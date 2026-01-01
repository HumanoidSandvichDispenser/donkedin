<template>
  <aside class="path-analysis-tab">
    <PathCount :pathPlayers="pathPlayers" />
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
import PathCount from "./PathCount.vue";

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

function mapPlayer(n: any) {
  const props = n.properties || {};
  return {
    id: props.id ?? n.id,
    name: props.rglName ?? props.etf2lName ?? String(n.id),
    rglName: props.rglName,
    etf2lName: props.etf2lName,
    avatarUrl: props.avatarUrl,
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
h3 {
  margin: 20px 40px;
}

.path-analysis-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 400px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-left: 1px solid var(--muted);
  padding: 16px;
  background: var(--bg);
  position: relative;
}

.flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 16px;
  background-color: var(--surface-0);
  border-radius: 10px;
}

.flow-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.player-box,
.team-box {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
