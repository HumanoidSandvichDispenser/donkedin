<template>
  <div class="path-controls">
    <div class="search-controls">
      <div class="row">
        <input
          v-model="source"
          class="input full"
          placeholder="source (steamid64, rgl:alias, etf2l:alias)"
        >
      </div>
      <div class="row">
        <input
          v-model="dest"
          class="input"
          placeholder="destination (optional)"
        >
        <button class="btn" :disabled="loading" @click="handleLoad">
          Load
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGraphStore } from "@/stores/graph";

const graph = useGraphStore();
const source = ref("");
const dest = ref("");
const loading = ref(false);

async function handleLoad() {
  if (!source.value) return;
  loading.value = true;
  try {
    // clear store state
    graph.clear();

    if (!dest.value) {
      await graph.loadSourceOnly(source.value);
      return;
    }

    await graph.loadPath(source.value, dest.value);
  } catch (err) {
    console.error("Path load failed", err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.search-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-controls {
  padding: 8px 0;
}

.row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input.full {
  width: 100%;
}

.row .input {
  flex: 1 1 auto;
}
</style>
