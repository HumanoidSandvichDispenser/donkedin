<template>
  <div>
    <h1>{{ player?.name || player?.id || "Player" }}</h1>

    <div v-if="!loaded">Loading...</div>
    <div v-else-if="!found">Player not found</div>
    <div v-else>
      <div>
        <strong>Top teammates</strong>
        <ul>
          <li v-for="t in teammates" :key="t.id">
            {{ t.name }} ({{ t.weight }})
          </li>
        </ul>
      </div>

      <!--GraphViewer :graph="graph" /-->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import GraphViewer from "@/components/GraphViewer.vue";
import { ref, onMounted } from "vue";

const route = useRoute();
const id = String(route.params.id || "");

const player = ref<any | null>(null);
const teammates = ref<any[]>([]);
const graph = ref({ nodes: [], links: [] });
const found = ref(false);
const loaded = ref(false);

onMounted(async () => {
  loaded.value = false;
  try {
    const res = await $fetch(`/api/player/${id}`);
    if (res && res.found) {
      found.value = true;
      player.value = res.player;
      teammates.value = res.teammates || [];
      graph.value = res.graph || { nodes: [], links: [] };
    } else {
      found.value = false;
    }
  } catch (err) {
    console.error(err);
    found.value = false;
  } finally {
    loaded.value = true;
  }
});
</script>
