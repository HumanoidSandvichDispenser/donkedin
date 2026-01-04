<template>
  <div
    :class="{
      'teammate-card': true,
      'no-player': !person,
    }"
  >
    <div class="profile-picture">
      <img
        v-if="person?.avatarUrl"
        :src="person.avatarUrl"
        :alt="person?.name ?? person?.id"
        width="32"
        height="32"
      >
      <div v-else class="placeholder-avatar">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="var(--muted)"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </svg>
      </div>
    </div>
    <div class="card-content">
      <div class="name">
        {{
          person?.rglName ?? person?.etf2lName ?? person?.id ?? placeholderText
        }}
      </div>
      <div v-if="person" class="aliases">
        <span class="alias steam">
          <a
            :href="`https://steamcommunity.com/profiles/${person.id}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            Steam &nearr;
          </a>
        </span>
        <span v-if="person.rglName" class="alias rgl">
          &middot;
          <a
            :href="`https://rgl.gg/Public/PlayerProfile?p=${person.id}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            RGL/{{ person.rglName }} &nearr;
          </a>
        </span>
        <span v-if="person.etf2lName" class="alias etf2l">
          &middot; ETF2L/{{ person.etf2lName }}
        </span>
      </div>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  person?: {
    id: string;
    name: string;
    rglName?: string;
    etf2lName?: string;
    avatarUrl?: string;
  };
  placeholderText?: string;
}>();
</script>

<style scoped>
.teammate-card {
  display: flex;
  padding: 8px;
  border-radius: 8px;
  flex-direction: row;
  font-weight: 500;
  width: 100%;
  gap: 12px;
}

.teammate-card a {
  color: inherit;
  text-decoration: none;
}

.teammate-card a:hover {
  text-decoration: underline;
}

.profile-picture {
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-picture > img {
  border-radius: 4px;
}

.card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.name {
  font-weight: 500;
  width: 100%;
  text-align: left;
}

.no-player .name {
  color: var(--muted-text);
}

.aliases {
  gap: 8px;
  width: 100%;
  font-size: 12px;
  color: var(--subtext);
}
</style>
