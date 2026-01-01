<template>
  <aside class="path-sidebar">
    <div class="tab-buttons">
      <button
        :class="{ active: activeTab === 'details' }"
        @click="setActive('details')"
      >
        Details
      </button>
      <button
        :class="{ active: activeTab === 'path' }"
        @click="setActive('path')"
      >
        Path Analysis
      </button>
    </div>

    <div class="tab-body">
      <DetailsTab v-if="activeTab === 'details'" />
      <PathAnalysisTab v-if="activeTab === 'path'" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import PathAnalysisTab from "./PathAnalysisTab.vue";
import DetailsTab from "./DetailsTab.vue";
import { useGraphStore } from "@/stores/graph";

const graph = useGraphStore();
const activeTab = ref("path");

function setActive(tab: string) {
  activeTab.value = tab;
}

// auto-switch to details when a node is selected
watch(
  () => graph.selectedNode,
  (v) => {
    if (v) {
      activeTab.value = "details";
    }
  },
);
</script>

<style scoped>
.path-sidebar {
  width: 400px;
  border-left: 1px solid var(--muted);
  padding: 16px;
  background: var(--bg);
  position: relative;
}

.tab-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tab-buttons button {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--muted);
  background: var(--surface-0);
}

.tab-buttons .active {
  background: var(--accent);
  color: var(--bg);
}

.tab-body {
  min-height: 100px;
}
</style>
