<template>
  <table class="team-table">
    <thead>
      <tr>
        <th>League</th>
        <th>Team</th>
        <th>Season</th>
        <th>Division</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="team in teams" :key="team.league + '-' + team.id">
        <td>
          <a
            v-if="team.league === 'rgl'"
            :href="`https://rgl.gg/Public/Team?t=${team.id}`"
            target="_blank"
            rel="noopener"
            >RGL</a
          >
          <a
            v-else
            :href="`https://etf2l.org/teams/${team.id}`"
            target="_blank"
            rel="noopener"
            >ETF2L</a
          >
        </td>
        <td>
          <a
            v-if="team.league === 'rgl'"
            :href="`https://rgl.gg/Public/Team?t=${team.id}`"
            target="_blank"
            rel="noopener"
            >{{ team.name }}</a
          >
          <a
            v-else
            :href="`https://etf2l.org/teams/${team.id}`"
            target="_blank"
            rel="noopener"
            >{{ team.name }}</a
          >
        </td>
        <td>{{ team.seasonName ?? "-" }}</td>
        <td>{{ team.divisionName ?? "-" }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

interface TeamRow {
  league: "rgl" | "etf2l";
  id: number;
  name: string | null;
  seasonName?: string | null;
  divisionName?: string | null;
}

const props = defineProps<{ playerId: string }>();

const teams = ref<TeamRow[]>([]);
const loading = ref(false);

async function fetchTeams() {
  loading.value = true;
  try {
    const res = await $fetch(`/api/players/id/${props.playerId}/teams`);
    const rglRaw = (res.teams?.rgl ?? []) as any[];
    const etf2lRaw = (res.teams?.etf2l ?? []) as any[];

    const rgl = rglRaw.map((t) => ({
      league: "rgl" as const,
      id: typeof t.id === "number" ? t.id : parseInt(String(t.id), 10),
      name: t.name ?? null,
      seasonName: t.seasonName ?? null,
      divisionName: t.divisionName ?? null,
    }));

    const etf2l = etf2lRaw.map((t) => ({
      league: "etf2l" as const,
      id: typeof t.id === "number" ? t.id : parseInt(String(t.id), 10),
      name: t.name ?? null,
      seasonName: t.seasonName ?? null,
      divisionName: t.divisionName ?? null,
    }));

    teams.value = [...rgl, ...etf2l].slice().sort((a, b) => a.id - b.id);
  } catch (err) {
    console.error("Failed to load teams", err);
    teams.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (props.playerId) fetchTeams();
});

watch(
  () => props.playerId,
  (newId, oldId) => {
    if (newId && newId !== oldId) fetchTeams();
  },
);
</script>

<style scoped>
.team-table {
  width: 100%;
  border-collapse: collapse;
}
.team-table th,
.team-table td {
  border: 1px solid var(--muted-border);
  padding: 6px 8px;
  text-align: left;
}
.team-table th {
  background: var(--muted-bg);
}
</style>
