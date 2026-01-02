<template>
  <div class="path-count">
    <div class="count-label">
      {{ firstNodeName }} and {{ lastNodeName }} are separated by
    </div>
    <div class="count-number">
      {{ degreeLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import pluralize from "pluralize";

const props = defineProps<{
  pathPlayers: Array<{ node: any; index: number }>;
}>();

const hopCount = computed(() => {
  return Math.max(0, (props.pathPlayers?.length || 0) - 1);
});

function nodeName(node: any) {
  const nodeProps = node?.properties || {};
  return nodeProps.rglName ?? nodeProps.etf2lName ?? String(node?.id ?? "");
}

const firstNodeName = computed(() => {
  if (!props.pathPlayers || props.pathPlayers.length === 0) {
    return "";
  }
  return nodeName(props.pathPlayers[0].node);
});

const lastNodeName = computed(() => {
  if (!props.pathPlayers || props.pathPlayers.length === 0) {
    return "";
  }
  return nodeName(props.pathPlayers[props.pathPlayers.length - 1].node);
});

const degreeLabel = computed(() => {
  const n = hopCount.value;
  return `${n} ${pluralize("degree", n)}`;
});
</script>

<style scoped>
.path-count {
  background-color: var(--surface-0);
  padding: 16px;
  border-radius: 10px;
}

.path-count .count-label {
  font-size: 14px;
  color: var(--muted-text);
}

.path-count .count-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}
</style>
