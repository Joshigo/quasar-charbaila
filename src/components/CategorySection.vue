<template>
  <q-card class="bg-grey-1 q-mb-md section-card" bordered>
    <q-card-section class="row items-center no-wrap">
      <div class="text-h6">Categorías</div>
      <q-space />
      <q-btn
        flat
        round
        dense
        size="sm"
        icon="refresh"
        :loading="loading"
        @click="fetchCategories"
        aria-label="Refrescar categorías"
      />
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row items-center q-gutter-sm">
        <q-chip
          v-for="category in categories"
          :key="category.id"
          color="primary"
          text-color="white"
          removable
          @remove="onDelete(category.id)"
        >
          {{ category.name }}
        </q-chip>

        <q-spinner v-if="loading" size="24px" class="q-ml-sm" />
        <div v-else-if="categories.length === 0" class="text-grey-7">No hay categorías</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { listCategories, deleteCategory } from 'src/composables/categories/useCategoryApi';
import type { Datum } from 'src/types/category.interface';

const $q = useQuasar();

const categories = ref<Datum[]>([]);
const loading = ref(false);

async function fetchCategories() {
  loading.value = true;
  try {
    const res = await listCategories(1, 100);
    categories.value = res.data.data;
  } catch (err) {
    console.log(err);
    $q.notify({ type: 'negative', message: 'Error al cargar categorías' });
  } finally {
    loading.value = false;
  }
}

async function onDelete(categoryId: number) {
  const toDelete = categories.value.find((c) => c.id === categoryId);
  try {
    await deleteCategory(categoryId);
    categories.value = categories.value.filter((c) => c.id !== categoryId);
    $q.notify({
      type: 'positive',
      message: `Categoría${toDelete ? ` "${toDelete.name}"` : ''} eliminada`,
    });
  } catch (err) {
    console.log(err);
    $q.notify({ type: 'negative', message: 'No se pudo eliminar la categoría' });
  }
}

onMounted(fetchCategories);
</script>

<style scoped>
.section-card {
  border-radius: 8px;
}
</style>
