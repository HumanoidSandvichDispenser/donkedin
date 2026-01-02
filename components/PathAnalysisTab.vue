<template>
  <div class="path-analysis">
    <div class="path-controls">
      <div class="row">
        <button class="btn card-btn" @click="openSourceModal" type="button">
          <TeammateCard
            :person="sourcePlayer"
            placeholder-text="Select a source player"
          />
        </button>

        <button class="btn card-btn" @click="openDestModal" type="button">
          <TeammateCard
            :person="destPlayer"
            placeholder-text="Select a destination player"
          />
        </button>

        <button class="btn" @click="handleLoad" :disabled="loading">
          Find Shortest Path
        </button>
      </div>
    </div>
    <PlayerSearchModal
      v-model="showSourceModal"
      @select="onSourceSelected"
      @close="closeSourceModal"
    />
    <PlayerSearchModal
      v-model="showDestModal"
      @select="onDestSelected"
      @close="closeDestModal"
    />
    <template v-if="pathPlayers.length">
      <PathCount :pathPlayers="pathPlayers" />
      <div class="flow">
        <template v-for="(p, idx) in pathPlayers" :key="pKey(p)">
          <div class="flow-item">
            <div class="player-box">
              <TeammateCard :person="mapPlayer(p.node)" />
            </div>

            <div v-if="idx < pathPlayers.length - 1" class="team-box">
              <TeamCard
                :team="
                  teamBetween(
                    pathPlayers[idx].index,
                    pathPlayers[idx + 1].index,
                  )
                "
              />
            </div>
          </div>
        </template>
      </div>
    </template>

    <div v-else class="no-path">
      <!-- branch svg -->
      <svg
        width="256px"
        height="256px"
        viewBox="0 0 24 24"
        fill="var(--muted)"
        stroke="var(--muted)"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13.5 7L17 10.5" stroke-linecap="round" />
        <path d="M7 13.5L10.5 17" stroke-linecap="round" />
        <path d="M10.5 7L7 10.5" stroke-linecap="round" />
        <path d="M17 13.5L13.5 17" stroke-linecap="round" />
        <circle cx="12" cy="5.5" r="2" />
        <circle cx="12" cy="18.5" r="2" />
        <circle cx="5.5" cy="12" r="2" />
        <circle cx="18.5" cy="12" r="2" />
      </svg>
      <span> Input two players to see their connection path. </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useGraphStore } from "@/stores/graph";
import TeammateCard from "@@/components/TeammateCard.vue";
import TeamCard from "@@/components/TeamCard.vue";
import PathCount from "./PathCount.vue";
import PlayerSearchModal from "@@/components/PlayerSearchModal.vue";
import GraphIcon from "@/assets/graph.svg?inline";

const graph = useGraphStore();
const showSourceModal = ref(false);
const showDestModal = ref(false);
const loading = ref(false);
const sourcePlayer = ref<any | null>(null);
const destPlayer = ref<any | null>(null);

const sourceLabel = computed(() => {
  if (!sourcePlayer.value) return "";
  return (
    sourcePlayer.value.rglName ??
    sourcePlayer.value.etf2lName ??
    String(sourcePlayer.value.id)
  );
});

const destLabel = computed(() => {
  if (!destPlayer.value) return "";
  return (
    destPlayer.value.rglName ??
    destPlayer.value.etf2lName ??
    String(destPlayer.value.id)
  );
});

// nodes in the raw path (in order)
const rawNodes = computed(() => graph.pathInfo?.nodes || []);

function openSourceModal() {
  showSourceModal.value = true;
}

function openDestModal() {
  showDestModal.value = true;
}

function closeSourceModal() {
  showSourceModal.value = false;
}

function closeDestModal() {
  showDestModal.value = false;
}

async function onSourceSelected(res: any) {
  // player may be the full server response ({ player, teams }) or a direct object
  const p = res.player;
  sourcePlayer.value = {
    id: p.id,
    rglName: p.rglName,
    etf2lName: p.etf2lName,
    avatarUrl: p.avatarUrl,
  };
  showSourceModal.value = false;
}

async function onDestSelected(res: any) {
  const p = res.player;
  destPlayer.value = {
    id: p.id,
    rglName: p.rglName,
    etf2lName: p.etf2lName,
    avatarUrl: p.avatarUrl,
  };
  showDestModal.value = false;
}

async function handleLoad() {
  if (!sourcePlayer.value) return;
  const sourceIdVal = sourcePlayer.value.id;
  const destIdVal = destPlayer.value ? destPlayer.value.id : null;
  loading.value = true;
  try {
    graph.clear();
    if (!destIdVal) {
      await graph.loadSourceOnly(sourceIdVal);
      return;
    }
    await graph.loadPath(sourceIdVal, destIdVal);
  } catch (err) {
    console.error("Path load failed", err);
  } finally {
    loading.value = false;
  }
}

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
        name: props.name ?? props.label ?? String(n.id),
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
.path-analysis {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.search-controls {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  flex-direction: column;
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

.no-select {
  user-select: none;
}

.card-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
}

.card-btn:hover {
  border-color: var(--muted);
}

.no-path {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--muted-text);
  background-color: var(--surface-0);
  border-radius: 10px;
  padding: 32px 16px;
}
</style>
