<template>
  <div class="gallery-page q-pa-md">
    <CategorySection />

    <div class="row items-center q-my-md">
      <div class="text-h5">Galería</div>
      <q-space />
      <AddGalleryButton @created="onCreated" />
    </div>

    <GalleryGrid ref="gridRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CategorySection from 'src/components/CategorySection.vue';
import GalleryGrid from 'src/components/galleries/GalleryGrid.vue';
import AddGalleryButton from 'src/components/galleries/AddGalleryButton.vue';

const gridRef = ref<InstanceType<typeof GalleryGrid> | null>(null);

function onCreated() {
  gridRef.value?.fetchGalleries?.();
}
</script>
