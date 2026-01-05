<template>
  <div class="profile-card">
    <img v-if="player?.avatarUrl" :src="player.avatarUrl" class="avatar" >
    <div class="meta">
      <div class="name-row">
        <template v-if="player">
          <NuxtLink
            v-if="interactive && nameLinkable"
            :to="`/players/id/${player.id}`"
            class="title-link"
          >
            <h2 class="title">{{ displayName }}</h2>
          </NuxtLink>
          <h2 v-else class="title">{{ displayName }}</h2>

          <div class="subtext">
            <template v-if="interactive">
              <span v-if="player.rglName">
                RGL:
                <a
                  :href="`https://rgl.gg/Public/PlayerProfile?p=${player.id}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ player.rglName }}</a
                >
              </span>
              <span v-else>RGL: not found</span>

              &middot;

              <span> ETF2L: {{ player.etf2lName ?? "not found" }} </span>

              &middot;

              <span>
                SteamID64:
                <a
                  :href="`https://steamcommunity.com/profiles/${player.id}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ player.id }}</a
                >
              </span>
            </template>

            <template v-else>
              RGL: {{ player.rglName ?? "not found" }} &middot; ETF2L:
              {{ player.etf2lName ?? "not found" }} &middot; SteamID64:
              {{ player.id ?? "not found" }}
            </template>
          </div>
        </template>

        <div v-else class="placeholder">Player</div>
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerNode } from "~~/repositories/types";
import { toRef } from "vue";

const props = withDefaults(
  defineProps<{
    player?: PlayerNode | null;
    interactive?: boolean;
    nameLinkable?: boolean;
  }>(),
  { interactive: true, nameLinkable: true },
);

const player = toRef(props, "player");
const interactive = toRef(props, "interactive");
const nameLinkable = toRef(props, "nameLinkable");

const displayName = computed(() => {
  return (
    player.value?.rglName ??
    player.value?.etf2lName ??
    player.value?.id ??
    "Player"
  );
});
</script>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: var(--surface-0);
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
  flex: 1 1 auto;
}

.title {
  margin: 0;
  font-size: 20px;
  line-height: 1.1;
  font-weight: 600;
}

.title-link {
  color: inherit;
  text-decoration: none;
}

.title-link:hover {
  text-decoration: underline;
}

.subtext {
  font-size: 13px;
  color: var(--subtext);
}
</style>
