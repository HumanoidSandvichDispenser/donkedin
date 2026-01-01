<template>
  <aside class="path-sidebar">
    <PathAnalysisTab />
  </aside>
</template>

<script setup lang="ts">
import PathAnalysisTab from "./PathAnalysisTab.vue";
</script>

<style scoped>
.path-sidebar {
  width: 400px;
  border-left: 1px solid var(--muted);
  padding: 16px;
  background: var(--bg);
  position: relative;
}

</style>
