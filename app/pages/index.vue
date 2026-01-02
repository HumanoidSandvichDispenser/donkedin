<template>
  <div class="page-root">
    <div class="main">
      <GraphViewer :initialGraph="graph" />
    </div>
    <PathSidebar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import GraphViewer from "@@/components/GraphViewer.vue";
import PathSidebar from "@@/components/PathSidebar.vue";
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
