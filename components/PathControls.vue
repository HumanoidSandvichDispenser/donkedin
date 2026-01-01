<template>
  <div class="path-controls">
    <div class="search-controls">
      <div class="row">
        <input
          class="input full"
          v-model="source"
          placeholder="source (steamid64, rgl:alias, etf2l:alias)"
        />
      </div>
      <div class="row">
        <input
          class="input"
          v-model="dest"
          placeholder="destination (optional)"
        />
        <button class="btn" @click="handleLoad" :disabled="loading">Load</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGraphStore } from '@/stores/graph';

const graph = useGraphStore();
const source = ref('');
const dest = ref('');
const loading = ref(false);

async function handleLoad() {
  if (!source.value) return;
  loading.value = true;
  try {
    // signal components to clear their visuals if needed
    graph.requestClear();

    // clear store state
    graph.clear();

    if (!dest.value) {
      await graph.loadSourceOnly(source.value);
      return;
    }

    await graph.loadPath(source.value, dest.value);
  } catch (err) {
    console.error('Path load failed', err);
  } finally {
    loading.value = false;
    // ack clear request so viewer can stop clearing
    graph.ackClearRequest();
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
