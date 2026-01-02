<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="handleClose">
    <div class="modal" role="dialog" aria-modal="true">
      <header class="modal-header">
        <slot name="header" />
        <button class="icon modal-close" @click="handleClose" aria-label="Close">
          ✕
        </button>
      </header>

      <div class="modal-content">
        <slot />
      </div>

      <footer class="modal-footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue", "close"]);

function handleClose() {
  emit("update:modelValue", false);
  emit("close");
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal {
  background: var(--bg);
  border-radius: 8px;
  width: 540px;
  max-width: calc(100% - 32px);
  padding: 12px 24px;
  box-shadow: 0 8px 32px rgba(25, 10, 20, 0.2);
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-close {
  font-size: 16px;
}

.modal-content {
  margin-top: 12px;
}

.modal-footer {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
