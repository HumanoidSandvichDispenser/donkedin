<template>
  <div>
    <h1>Graph Viewer</h1>
    <GraphViewer :initialGraph="graph" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GraphViewer from '@@/components/GraphViewer.vue';

const graph = ref({ nodes: [], links: [] });

onMounted(async () => {
  try {
    // seed graph with some popular players or sample
    // For demo, empty - user can expand by clicking nodes after adding them via search/URL
    // Could fetch a seed player to show initial content
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
