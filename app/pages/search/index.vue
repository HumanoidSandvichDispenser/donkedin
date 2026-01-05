<template>
  <div class="search-page">
    <div class="search-main">
      <div class="search-controls">
        <input
          v-model="typedQuery"
          class="search-input"
          placeholder="Search players..."
          @keyup.enter="onSubmit"
        >
      </div>

      <div class="results">
        <div v-if="pending" class="muted-text">Searching...</div>
        <div v-else-if="error" class="muted-text">
          An error occurred while searching.
        </div>

        <template v-else>
          <div v-if="!query" class="muted-text">
            Enter a query to search players.
          </div>

          <template v-else>
            <div v-if="players.length === 0" class="muted-text">
              No players found.
            </div>

            <ProfileCard
              v-for="p in players"
              v-else
              :key="p.id"
              :player="p"
              :interactive="true"
            />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "#imports";
import ProfileCard from "@@/components/ProfileCard.vue";
import type { PlayerNode } from "~~/repositories/types";

const route = useRoute();
const router = useRouter();
const query = ref(String(route.query.q ?? ""));
const typedQuery = ref<string>(query.value);
const players = ref<PlayerNode[]>([]);

watch(
  () => route.query.q,
  (q) => {
    query.value = String(q ?? "");
  },
);

// lazy useFetch for the search endpoint
const {
  data: res,
  pending,
  error,
} = await useFetch("/api/players/search", {
  params: { q: query.value },
  lazy: true,
});
players.value = res.value?.players ?? [];

async function runSearch() {
  await $fetch("/api/players/search", {
    params: { q: query.value },
  })
    .then((data: { players: PlayerNode[] }) => {
      players.value = data.players;
      console.log(data.players);
    })
    .catch(() => {
      players.value = [];
    });
}

async function onSubmit() {
  query.value = typedQuery.value;
  await router.replace({ path: "/search", query: { q: query.value } });
  await runSearch();
}

onMounted(() => {
  if (query.value) {
    runSearch();
  }
});
</script>

<style scoped>
.search-page {
  padding: 24px;
}

.search-main {
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}

.search-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  justify-content: center;
}

.search-input {
  width: 100%;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: var(--surface-0);
  color: var(--text);
}

.results {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.muted-text {
  color: var(--muted-text);
  text-align: center;
}
</style>
