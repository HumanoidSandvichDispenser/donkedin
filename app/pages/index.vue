<template>
  <div class="page-root">
    <div class="main">
      <GraphViewer :initialGraph="graph" />
    </div>
    <PathAnalysisTab />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GraphViewer from '@@/components/GraphViewer.vue';
import PathAnalysisTab from '@@/components/PathAnalysisTab.vue';

const graph = ref({ nodes: [], links: [] });

onMounted(async () => {
  try {
    // seed graph with some popular players or sample
    const res = await $fetch('/api/player/76561198936168937')
      .catch(() => null);

    if (res && res.found) {
      graph.value.nodes = [
        {
          id: res.player.id,
          name: res.player.rglName || res.player.etf2lName || res.player.id,
          type: 'player'
        }
      ];
    }
  } catch (err) {
    console.error(err);
  }
});
</script>

<style scoped>
.page-root {
  display: flex;
  min-height: 100vh;
}

.main {
  flex: 1;
  padding: 12px;
  height: 100vh;
}
</style>
