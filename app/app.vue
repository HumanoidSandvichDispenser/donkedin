<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useGraphStore } from '@/stores/graph';

const graph = useGraphStore();

// watch pathInfo so other parts of the app can react when a path is loaded
watch(() => graph.pathInfo, (v) => {
  // for now just log; UI to use this will be added later
  if (v) {
    console.debug('Graph path loaded', v);
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap');

:root {
  /* Miramare palette */
  --mr-bg0: #2A2426;
  --mr-bg1: #242021;
  --mr-bg2: #2e272a;
  --mr-bg3: #332c2f;
  --mr-bg4: #383135;
  --mr-bg5: #40393d;
  --mr-bg-red: #392f32;
  --mr-bg-green: #333b2f;
  --mr-bg-blue: #203a41;
  --mr-fg: #e6d6ac;
  --mr-fg-light: #f7f5ed;
  --mr-red: #e68183;
  --mr-orange: #e39b7b;
  --mr-yellow: #d9bb80;
  --mr-green: #87af87;
  --mr-cyan: #87c095;
  --mr-blue: #89beba;
  --mr-purple: #d3a0bc;
  --mr-grey: #444444;
  --mr-light-grey: #5b5b5b;
  --mr-gold: #d8caac;

  /* Semantic aliases */
  --bg: var(--mr-bg0);
  --surface-0: var(--mr-bg1);
  --surface-1: var(--mr-bg2);
  --surface-2: var(--mr-bg3);
  --muted: var(--mr-bg5);
  --text: var(--mr-fg-light);
  --accent: var(--mr-orange);
  --accent-2: var(--mr-blue);
  --success: var(--mr-green);
  --danger: var(--mr-red);
  --warning: var(--mr-yellow);
  --muted-text: var(--mr-light-grey);
}

body {
  font-family: "Noto Serif", serif;
  background-color: var(--bg);
  color: var(--text);
}

a {
  color: var(--accent);
  text-decoration: none;
}
</style>
