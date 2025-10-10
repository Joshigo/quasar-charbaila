<template>
  <div>
    <q-btn
      :color="color"
      :icon="icon"
      :label="label"
      :flat="flat"
      :outline="outline"
      :round="round"
      :dense="dense"
      :disable="disable"
      @click="openModal"
    />

    <component
      v-if="isOpen"
      :is="modalComponent"
      v-model="isOpen"
      v-bind="computedModalProps"
      v-on="modalListeners"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// Generic, reusable trigger button that opens a dynamic modal component.
// Usage example:
// <ModalTriggerButton
//   label="Agregar Nueva Imagen"
//   icon="add_photo_alternate"
//   :modal-component="CreateGalleryModal"
//   :modal-props="{ mode: 'create' }"
//   @modal:created="onCreated"
// />

const props = defineProps<{
  // Button props
  label?: string;
  icon?: string;
  color?: string;
  flat?: boolean;
  outline?: boolean;
  round?: boolean;
  dense?: boolean;
  disable?: boolean;

  // Modal configuration
  modalComponent: any; // a SFC or async component
  modalProps?: Record<string, unknown>;
  // Event forwarding: which modal events to re-emit with a namespaced prefix
  forwardEvents?: string[]; // e.g., ['created', 'updated']
  namespace?: string; // default: 'modal'
}>();

const emit = defineEmits<{
  // Forwarded namespaced events: `${namespace}:${event}` (defaults to modal:<event>)
  (e: `${string}:${string}`, ...args: any[]): void;
}>();

const isOpen = ref(false);

function openModal() {
  isOpen.value = true;
}

// Always inject the v-model binding expected by dialogs: `modelValue` or `v-model` prop.
// Our convention: the modal must support v-model (modelValue/update:modelValue) for visibility.
const computedModalProps = computed(() => ({
  ...(props.modalProps || {}),
}));

// Build explicit listeners for the dynamic component so Vue can enumerate them.
const modalListeners = computed(() => {
  const listeners: Record<string, (...args: unknown[]) => void> = {};

  // Maintain v-model wiring for the dialog visibility
  listeners['update:modelValue'] = (visible: unknown) => {
    isOpen.value = Boolean(visible);
    // Also re-emit namespaced if asked for
    const ns = props.namespace ?? 'modal';
    emit(`${ns}:update:modelValue`, visible as any);
  };

  const events = props.forwardEvents ?? ['created', 'updated'];
  const ns = props.namespace ?? 'modal';
  for (const ev of events) {
    listeners[ev] = (...args: unknown[]) => {
      emit(`${ns}:${ev}`, ...(args as any));
    };
  }

  return listeners;
});
</script>
