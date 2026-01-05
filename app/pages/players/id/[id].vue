<template>
  <div class="player-page">
    <div v-if="!loaded" class="loading">Loading...</div>
    <div v-else-if="!found" class="not-found">Player not found</div>
    <div v-else class="content">
      <div class="left">
        <div class="profile-wrap">
          <div class="profile">
            <img
              v-if="player?.avatarUrl"
              :src="player?.avatarUrl"
              alt="avatar"
              class="avatar"
            >
            <div class="meta">
              <div class="name-row">
                <h1 class="title">{{ displayName }}</h1>
                <div class="subtext">
                  RGL: {{ player?.rglName ?? "not found" }} &middot; ETF2L:
                  {{ player?.etf2lName ?? "not found" }} &middot; SteamID64:
                  {{ player?.id ?? "not found" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="teams-section">
          <TeamTable :player-id="id" />
        </div>
      </div>

      <aside class="right">
        <div class="teammates-section">
          <strong>Top teammates</strong>
          <TeammateList :player-id="id" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, watch } from "vue";
import type { PlayerNode } from "~~/repositories/types";
import TeammateList from "~~/components/TeammateList.vue";
import TeamTable from "~~/components/TeamTable.vue";

const route = useRoute();
const id = String(route.params.id || "");

const {
  data: playerData,
  pending,
  error,
} = await useFetch(`/api/players/id/${id}`);

const player = ref<PlayerNode | null>(playerData.value?.player ?? null);
const found = ref<boolean>(Boolean(player.value));
const loaded = ref<boolean>(!pending.value && !error.value);

const displayName = computed(() => {
  if (!player.value) {
    return "Player";
  }
  return player.value.rglName ?? player.value.etf2lName ?? player.value.id;
});

// Keep reactive updates in case of client-side navigation
if (import.meta.client) {
  watch(
    () => route.params.id,
    async (newId) => {
      const sid = String(newId || "");
      if (!sid) return;
      try {
        loaded.value = false;
        const playerRes = await $fetch(`/api/players/id/${sid}`);
        if (!playerRes) {
          found.value = false;
          player.value = null;
        } else {
          found.value = true;
          player.value = playerRes.player ?? null;
        }
      } catch (err) {
        console.error(err);
        found.value = false;
      } finally {
        loaded.value = true;
      }
    },
  );
}
</script>

<style scoped>
.player-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
.title {
  font-size: 28px;
  margin: 0;
  line-height: 1.1;
}
.name-row {
  display: flex;
  flex-direction: column;
}
.subtext {
  font-size: 13px;
  color: var(--subtext);
  margin-top: 4px;
}
.loading,
.not-found {
  color: var(--subtext);
}
.content {
  display: flex;
  gap: 16px;
}
.left {
  flex: 1 1 60%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.right {
  flex: 0 0 320px;
}
.profile-wrap {
  background: var(--surface-0);
  padding: 16px;
  border-radius: 6px;
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
.teams-section {
  margin-top: 8px;
}
</style>
