<template>
  <GenericModal v-model="visible">
    <template #header>
      <h3>Find player</h3>
    </template>

    <div class="content">
      <div class="search-form">
        <input
          ref="inputRef"
          v-model="query"
          @keyup.enter="doSearch"
          @keydown.esc.prevent="onEsc"
          placeholder="SteamID64 or RGL/ETF2L Alias"
          aria-label="Player search"
        />

        <div class="actions">
          <button @click="doSearch" :disabled="loading">Search</button>
        </div>
      </div>

      <div class="status muted-text">
        <div v-if="loading">Searching...</div>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="results.length > 0 && !loading">
          {{ resultsText }}
        </div>
        <div
          v-if="results.length === 0 && !loading"
          class="no-results muted-text"
        >
          No results. Try inputting the exact SteamID64 to select a specific
          player.
        </div>
      </div>

      <div v-if="isSteamId && !loading" class="steam-direct muted-text">
        <p>Detected SteamID64. Fetching player directly...</p>
      </div>

      <div v-if="!isSteamId">
        <ul class="results">
          <li v-for="p in results" :key="p.id" class="result-item">
            <div class="select-actions">
              <button @click="selectPlayer(p.id)">
                <TeammateCard
                  :person="{
                    id: p.id,
                    name: p.rglName ?? p.etf2lName ?? p.id,
                    rglName: p.rglName,
                    etf2lName: p.etf2lName,
                    avatarUrl: p.avatarUrl,
                  }"
                />
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="selectedLoading" class="loading-player muted-text">
        Loading player info...
      </div>
    </div>

    <template #footer>
      <button @click="close">Cancel</button>
    </template>
  </GenericModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, computed as _computed, nextTick } from "vue";
import TeammateCard from "./TeammateCard.vue";
import GenericModal from "./GenericModal.vue";
import pluralize from "pluralize";

const props = defineProps<{ modelValue?: boolean }>();
const emit = defineEmits(["update:modelValue", "select", "close"]);

const visible = _computed<boolean>({
  get: () => !!props.modelValue,
  set: (v: boolean) => emit("update:modelValue", v),
});

const query = ref("");
const loading = ref(false);
const selectedLoading = ref(false);
const error = ref<string | null>(null);
const results = ref<Array<any>>([]);
const inputRef = ref<HTMLInputElement | null>(null);

function isSteamId64(val: string) {
  if (!val) return false;
  const s = val.trim();
  return /^7656\d{13}$/.test(s) && s.length === 17;
}

const isSteamId = computed(() => isSteamId64(query.value));

watch(isSteamId, async (v) => {
  if (v) {
    // when user types a steamid we can auto-fetch
    await fetchAndEmit(query.value.trim());
  }
});

// focus input when modal opens
watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      await nextTick();
      inputRef.value?.focus();
    }
  },
);

const resultsText = computed(() => {
  const resultCount = results.value.length;
  return `${resultCount} ${pluralize("result", resultCount)}`;
});

async function doSearch() {
  error.value = null;
  results.value = [];

  const q = query.value.trim();
  if (!q) return;

  if (isSteamId64(q)) {
    await fetchAndEmit(q);
    return;
  }

  loading.value = true;
  try {
    const response = await $fetch(`/api/player/search?q=${encodeURIComponent(q)}&limit=25`);
    results.value = response.players;
  } catch (err: any) {
    console.error(err);
    error.value = err?.message || String(err);
  } finally {
    loading.value = false;
  }
}

async function selectPlayer(id: string) {
  await fetchAndEmit(id);
}

async function fetchAndEmit(id: string) {
  selectedLoading.value = true;
  error.value = null;
  try {
    const body = await $fetch(`/api/player/${encodeURIComponent(id)}`);
    // close the modal via v-model and emit selection
    emit("update:modelValue", false);
    emit("select", body);
    emit("close");
  } catch (err: any) {
    console.error(err);
    error.value = err?.message || String(err);
  } finally {
    selectedLoading.value = false;
  }
}

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function onEsc() {
  close();
}
</script>

<style scoped>
.content {
  display: flex;
  gap: 8px;
  flex-direction: column;
  margin-top: 12px;
}

.search-form {
  display: flex;
  gap: 8px;
}

.search-form > input {
  flex: 1;
}

.results {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
  display: grid;
  gap: 8px;
  max-height: 50vh;
  overflow: scroll;
}

.result-item {
  width: 100%;
}

.select-actions button {
  margin: 0;
  padding: 4px;
  width: 100%;
  background-color: transparent;
}

.status .error {
  color: var(--danger);
}
</style>
