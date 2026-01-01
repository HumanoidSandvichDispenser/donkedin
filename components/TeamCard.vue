<template>
  <div class="outer-container">
    <div class="line">
    </div>
    <div class="inner-container">
      <div class="team-card subtle">
        <div class="league muted-text">
          <span v-if="team?.type">
            {{ team.type.toUpperCase() }}
          </span>
          <span v-if="team?.seasonName">
            {{ team.seasonName }}
          </span>
          <span class="muted-text" v-if="team?.divisionName">
            &mdash;
            {{ team.divisionName }}
          </span>
        </div>
        <div class="team-name">
          <span :class="[team?.type]">
            {{ team?.name }}
          </span>
          <span v-if="team?.tag" class="tag-name">
            ({{ team?.tag }})
          </span>
        </div>
        <div v-if="team?.divisionName">
        </div>
      </div>
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
.outer-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.line {
  width: 2px;
  margin-left: 24px;
  margin-right: 12px;
  height: 100%;
  background-color: var(--muted);
}

.inner-container {
  flex: 1;
}

.team-card.subtle {
  font-family: "Inter", sans-serif;
  color: var(--muted-text);
  font-size: 13px;
  text-align: left;
  box-shadow: none;
}

.muted-text {
  color: var(--muted-text);
}

.team-name {
  color: var(--text);
}

.league {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.tag {
  background-color: var(--muted);
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
}

span.rgl {
  color: var(--rgl);
}

span.etf2l {
  color: var(--etf2l);
}

.tag[type="rgl"] {
  background-color: var(--rgl);
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
}

.tag[type="etf2l"] {
  background-color: var(--etf2l);
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
