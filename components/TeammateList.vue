<template>
  <div class="teammate-list">
    <div v-if="loading" class="loading">Loading teammates...</div>
    <div v-else>
      <div v-if="teammates.length === 0" class="empty">No teammates found</div>
      <div class="list">
        <TeammateCard v-for="t in teammates" :key="t.id" :person="t" />
      </div>

      <div class="pagination">
        <button class="btn" :disabled="page <= 0" @click="prevPage">
          Prev
        </button>
        <span class="page-indicator">Page {{ page + 1 }}</span>
        <button class="btn" :disabled="!hasMore" @click="nextPage">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import TeammateCard from "~~/components/TeammateCard.vue";

interface PlayerNode {
  id: string;
  rglName?: string | null;
  etf2lName?: string | null;
  lastUpdated?: string | null;
  avatarUrl?: string | null;
}

const props = defineProps<{ playerId: string; limit?: number }>();

const teammates = ref<PlayerNode[]>([]);
const page = ref(0);
const loading = ref(false);
const pageCount = ref(1);

async function fetchPage(p: number) {
  loading.value = true;
  try {
    const limit = typeof props.limit === "number" ? props.limit : 25;
    const res = await $fetch(`/api/players/id/${props.playerId}/details`, {
      params: { page: p, limit },
    });
    teammates.value = res.teammates;
    page.value = p;
    pageCount.value = typeof res.pageCount === "number" ? res.pageCount : 1;
  } catch (err) {
    console.error("Failed to load teammates", err);
    teammates.value = [];
    pageCount.value = 1;
  } finally {
    loading.value = false;
  }
}

function prevPage() {
  if (page.value > 0) {
    fetchPage(page.value - 1);
  }
}

function nextPage() {
  if (page.value < pageCount.value - 1) {
    fetchPage(page.value + 1);
  }
}

onMounted(() => {
  // load first page
  fetchPage(0);
});

// allow parent to trigger refresh by watching playerId
watch(
  () => props.playerId,
  () => {
    page.value = 0;
    fetchPage(0);
  },
);
</script>

<style scoped>
.teammate-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}
.btn {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--muted-border);
  background: var(--surface);
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-indicator {
  font-size: 14px;
  color: var(--subtext);
}
.loading,
.empty {
  color: var(--subtext);
}
</style>
