<template>
  <q-card class="bg-grey-1 q-mb-md section-card" bordered>
    <q-card-section class="row items-center no-wrap">
      <div class="text-h6">Categorías</div>
      <q-space />
      <q-btn
        color="primary"
        dense
        size="sm"
        icon="add"
        label="Nueva"
        class="q-mr-sm"
        @click="openCreateDialog"
        aria-label="Crear categoría"
      />
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

    <q-dialog v-model="createDialog" @hide="resetCreateForm">
      <q-card style="min-width: 360px; max-width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Crear categoría</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit.prevent="submitCreateCategory">
            <q-input
              v-model="newCategoryName"
              label="Nombre"
              dense
              outlined
              autofocus
              :disable="creating"
              :rules="[(val) => !!(val && val.trim()) || 'El nombre es requerido']"
              @keyup.enter="submitCreateCategory"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup :disable="creating" />
          <q-btn color="primary" label="Crear" :loading="creating" @click="submitCreateCategory" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { Datum } from 'src/types/category.interface';
import { useCategoriesStore } from 'src/stores/categories';

const emit = defineEmits<{
  (e: 'created'): void;
}>();

const $q = useQuasar();

const store = useCategoriesStore();
const categories = computed<Datum[]>(() => store.categories);
const loading = computed(() => store.loading);
const creating = computed(() => store.creating);
const createDialog = ref(false);
const newCategoryName = ref('');

async function fetchCategories() {
  try {
    await store.fetchAll();
  } catch (err) {
    console.log(err);
    $q.notify({ type: 'negative', message: 'Error al cargar categorías' });
  }
}

function openCreateDialog() {
  createDialog.value = true;
}

function resetCreateForm() {
  newCategoryName.value = '';
}

async function submitCreateCategory() {
  const name = newCategoryName.value.trim();
  if (!name) {
    $q.notify({ type: 'warning', message: 'El nombre es requerido' });
    return;
  }
  try {
    const res = await store.create(name);
    const message = res?.message || `Categoría "${name}" creada`;
    createDialog.value = false;
    $q.notify({ type: 'positive', message });
    emit('created');
    return message;
  } catch (err) {
    console.log(err);
    $q.notify({ type: 'negative', message: 'No se pudo crear la categoría' });
  }
}

async function onDelete(categoryId: number) {
  const toDelete = categories.value.find((c) => c.id === categoryId);
  try {
    await store.remove(categoryId);
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
