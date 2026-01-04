<template>
  <div class="player-page">
    <h1 class="title">{{ displayName }}</h1>

    <div v-if="!loaded" class="loading">Loading...</div>
    <div v-else-if="!found" class="not-found">Player not found</div>
    <div v-else class="content">
      <div class="profile">
        <img
          v-if="player?.avatarUrl"
          :src="player?.avatarUrl"
          alt="avatar"
          class="avatar"
        >
        <div class="meta">
          <div><strong>ID:</strong> {{ player?.id }}</div>
          <div v-if="teams.rgl.length">
            <strong>RGL teams:</strong>
            {{ teams.rgl.map((t) => t.name).join(", ") }}
          </div>
          <div v-if="teams.etf2l.length">
            <strong>ETF2L teams:</strong>
            {{ teams.etf2l.map((t) => t.name).join(", ") }}
          </div>
        </div>
      </div>

      <div class="teammates-section">
        <strong>Top teammates</strong>
        <TeammateList :player-id="id" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, computed } from "vue";
import type { PlayerNode } from "~~/repositories/types";
import TeammateList from "~~/components/TeammateList.vue";

const route = useRoute();
const id = String(route.params.id || "");

const player = ref<PlayerNode | null>(null);
const teams = ref({
  rgl: [] as { id: number; name: string }[],
  etf2l: [] as { id: number; name: string }[],
});
const found = ref(false);
const loaded = ref(false);

const displayName = computed(() => {
  if (!player.value) return "Player";
  return player.value.rglName || player.value.etf2lName || player.value.id;
});

onMounted(async () => {
  loaded.value = false;
  try {
    const res = await $fetch(`/api/players/${id}/details`);
    if (res) {
      found.value = true;
      player.value = res.player ?? null;
      teams.value = res.teams ?? { rgl: [], etf2l: [] };
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

<style scoped>
.player-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.title {
  font-size: 20px;
}
.loading,
.not-found {
  color: var(--subtext);
}
.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.profile {
  display: flex;
  gap: 12px;
  align-items: center;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
}
.meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.teammates-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
