<template>
  <div class="team-card subtle">
    <div class="league">
      <span v-if="team?.type" class="tag" :type="team.type">
        {{ team.type.toUpperCase() }}
      </span>
      <span v-if="team?.seasonName" class="muted-text">
        {{ team.seasonName }}
      </span>
    </div>
    <div class="team-name">
      {{ team?.name }}
      <span v-if="team?.tag" class="tag-name">
        ({{ team?.tag }})
      </span>
    </div>
    <div v-if="team?.divisionName">
      <span class="muted-text">
        {{ team.divisionName }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  team: {
    name: string,
    divisionName?: string,
    seasonName?: string,
    tag?: string,
    type?: string,
  };
}>();
</script>

<style scoped>
.team-card.subtle {
  font-family: "Inter", sans-serif;
  width: 200px;
  padding: 10px;
  border: none;
  background-color: var(--bg);
  border: 1px solid var(--muted);
  border-radius: 8px;
  color: var(--text);
  font-size: 13px;
  text-align: left;
  box-shadow: none;
}

.muted-text {
  color: var(--muted-text);
}

.team-name {
  font-weight: 600;
}

.league {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #888;
}

.tag {
  background-color: var(--muted);
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
}

.tag[type="rgl"] {
  background-color: var(--mr-orange);
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
}

.tag[type="etf2l"] {
  background-color: var(--mr-blue);
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
}

.tag-name {
  color: var(--muted-text);
  font-weight: 400;
}

.no-path {
  color: #777;
  padding: 8px 0;
}
</style>
