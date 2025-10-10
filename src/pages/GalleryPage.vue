<template>
  <div class="gallery-page q-pa-md">
    <CategorySection @created="onCategoryCreated" />

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
import { useCategoriesStore } from 'src/stores/categories';
import GalleryGrid from 'src/components/galleries/GalleryGrid.vue';
import AddGalleryButton from 'src/components/galleries/AddGalleryButton.vue';

const gridRef = ref<InstanceType<typeof GalleryGrid> | null>(null);
const categoriesStore = useCategoriesStore();

function onCreated() {
  gridRef.value?.fetchGalleries?.();
}

async function onCategoryCreated() {
  // Asegura que otros componentes que dependen de categorías tengan los datos actualizados
  await categoriesStore.fetchAll();
}
</script>
