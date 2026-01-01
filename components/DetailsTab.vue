<template>
  <div class="details-tab">
    <div v-if="!node" class="empty">Select a node to see details</div>
    <div v-else class="content">
      <div class="header">
        <h3>{{ node.name }}</h3>
        <div class="meta">Type: {{ node.type }}</div>
      </div>

      <div class="actions">
        <button class="btn" @click="expandNode">Expand</button>
        <NuxtLink
          v-if="node.type === 'player'"
          :to="`/player/${node.id}`"
          class="btn-ghost"
        >
          Open player page
        </NuxtLink>
      </div>

      <pre class="raw">{{ node.raw }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGraphStore } from "@/stores/graph";

const graph = useGraphStore();

const node = computed(() => graph.selectedNode);

function expandNode() {
  if (!node.value) return;
  graph.expandNodeById(String(node.value.id), node.value.type || "player");
}
</script>

<style scoped>
.empty {
  color: var(--muted-text);
}

.header h3 {
  margin: 8px 0;
}

.meta {
  color: var(--muted-text);
  margin-bottom: 8px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.raw {
  background: var(--surface-1);
  padding: 8px;
  border-radius: 8px;
  overflow: auto;
}
</style>
