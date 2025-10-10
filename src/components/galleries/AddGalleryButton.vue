<template>
  <q-btn
    color="primary"
    icon="add_photo_alternate"
    label="Agregar Nueva Imagen"
    @click="openModal"
  />
  <CreateGalleryModal v-model="isModalOpen" @created="$emit('created')" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CreateGalleryModal from './CreateGalleryModal.vue';

defineEmits(['created']);

const isModalOpen = ref(false);

function openModal() {
  isModalOpen.value = true;
}
</script>
