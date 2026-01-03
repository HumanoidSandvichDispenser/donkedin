<template>
  <main class="app-root">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </main>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useGraphStore } from "@/stores/graph";

const graph = useGraphStore();

// watch pathInfo so other parts of the app can react when a path is loaded
watch(
  () => graph.pathInfo,
  (v) => {
    // for now just log; UI to use this will be added later
    if (v) {
      console.debug("Graph path loaded", v);
    }
  },
);
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap");

:root {
  /* Miramare palette */
  --mr-bg0: #2a2426;
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
  --mr-fg-dark: #807178;
  --mr-red: #e68183;
  --mr-orange: #e39b7b;
  --mr-yellow: #d9bb80;
  --mr-green: #87af87;
  --mr-cyan: #87c095;
  --mr-blue: #89beba;
  --mr-purple: #d3a0bc;
  --mr-grey: #444444;
  --mr-light-grey: #5e5459;
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
  --subtext: var(--mr-fg-dark);
  --rgl: var(--mr-orange);
  --etf2l: var(--mr-blue);
}

body {
  /*font-family: "Noto Serif", serif;*/
  font-family: "Inter", sans-serif;
  background-color: var(--surface-0);
  color: var(--text);
  margin: 0;
}

.app-root {
  padding: 0;
  margin: 0 192px;
  background-color: var(--bg);
}

a {
  color: var(--accent);
  text-decoration: none;
}

/* Buttons */
button,
.btn {
  -webkit-appearance: none;
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--muted);
  background: var(--surface-0);
  color: var(--text);
  cursor: pointer;
  font-weight: 500;
  transition:
    transform 120ms ease,
    filter 120ms ease;
}

button:hover,
.btn:hover {
  border-color: var(--accent);
  filter: brightness(1.03);
}

button:active,
.btn:active {
  transform: translateY(0);
  filter: brightness(0.98);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

button:focus-visible,
.btn:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 6px rgba(135, 192, 149, 0.16),
    0 8px 20px rgba(0, 0, 0, 0.55);
}

button.icon {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  aspect-ratio: 1 / 1;
  color: var(--subtext);
}

button.icon:hover {
  background-color: var(--surface-0);
}

/* Secondary / ghost buttons */
.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: none;
}

.btn-ghost {
  background: transparent;
  color: var(--text);
  border: none;
  opacity: 0.95;
}

/* Inputs, selects, textareas */
input,
textarea,
select {
  background: var(--surface-0);
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 0.25rem 1rem;
  border-radius: 8px;
  transition:
    box-shadow 160ms ease,
    border-color 120ms ease,
    transform 120ms ease;
  outline: none;
  min-height: 2.2rem;
}

input::placeholder,
textarea::placeholder {
  color: var(--muted-text);
  opacity: 0.95;
}

input:focus,
textarea:focus,
select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 6px rgba(135, 192, 149, 0.12);
  transform: translateY(-1px);
}

/* subtle focus for keyboard users */
/*:focus:not(:focus-visible) { box-shadow: none; }*/

/* make forms look tidy */
.form-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* small utility */
.small {
  font-size: 0.9rem;
  color: var(--muted-text);
}

.muted-text {
  color: var(--muted-text);
}
</style>
