<template>
  <div class="player-page">
    <div v-if="!loaded" class="loading">Loading...</div>
    <div v-else-if="!found" class="not-found">Player not found</div>
    <div v-else class="content">
      <div class="left">
        <ProfileCard
          :player="player"
          :interactive="true"
          :name-linkable="false"
        />

        <div class="teams-section">
          <TeamTable :player-id="id" />
        </div>
      </div>

      <aside class="right">
        <div class="teammates-section">
          <TeammateList :player-id="id" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, watch } from "vue";
import type { PlayerNode } from "~~/repositories/types";
import TeammateList from "~~/components/TeammateList.vue";
import TeamTable from "~~/components/TeamTable.vue";
import ProfileCard from "~~/components/ProfileCard.vue";

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
