<template>
  <div ref="container" class="graph-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import cytoscape from "cytoscape";

const props = defineProps<{ graph: { nodes: any[]; links: any[] } }>();
const container = ref<HTMLDivElement | null>(null);
let cy: cytoscape.Core | null = null;

onMounted(() => {
  watch(
    () => props.graph,
    (g) => {
      if (!container.value) return;
      if (cy) {
        cy.destroy();
        cy = null;
      }
      cy = cytoscape({
        container: container.value,
        elements: {
          nodes: g.nodes.map((n) => ({ data: { id: n.id, label: n.name } })),
          edges: g.links.map((l, i) => ({
            data: {
              id: `e${i}`,
              source: l.source,
              target: l.target,
              weight: l.weight,
            },
          })),
        },
        style: [
          {
            selector: "node",
            style: {
              label: "data(label)",
              "background-color": "#3366ff",
              color: "#fff",
              "text-valign": "center",
              "text-halign": "center",
              width: 30,
              height: 30,
            },
          },
          {
            selector: "edge",
            style: {
              width: "mapData(weight, 1, 10, 1, 6)",
              "line-color": "#999",
            },
          },
        ],
        layout: { name: "cose" },
      });
    },
    { immediate: true },
  );
});
</script>

<style scoped>
.graph-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
}
</style>
