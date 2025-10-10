<template>
  <ModalTriggerButton
    color="primary"
    icon="add_photo_alternate"
    label="Agregar Nueva Imagen"
    :modal-component="CreateGalleryModal"
    :modal-props="{ mode: 'create' }"
    @modal:created="$emit('created')"
  />
</template>

<script setup lang="ts">
import ModalTriggerButton from 'src/components/common/ModalTriggerButton.vue';
import CreateGalleryModal from './CreateGalleryModal.vue';

defineEmits(['created']);
</script>
