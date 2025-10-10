<template>
  <div class="q-pa-md">
    <div v-if="loading" class="row justify-center q-my-md">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else-if="galleries.length === 0" class="text-center text-grey-7 q-mt-md">
      No hay imágenes en la galería. ¡Agrega una!
    </div>

    <div v-else class="row q-gutter-md justify-center">
      <q-card v-for="item in galleries" :key="item.id" class="gallery-card">
        <q-img :src="getImageUrl(item.src)" :ratio="1">
          <div class="absolute-bottom text-subtitle2 text-center">
            {{ item.title }}
          </div>
          <q-badge v-if="item.is_pinned" color="red" floating class="q-ma-xs" title="Fijado">
            <q-icon name="push_pin" size="14px" />
          </q-badge>
        </q-img>

        <q-card-actions align="around" class="q-pt-none">
          <q-btn
            flat
            round
            :color="item.is_visible ? 'green' : 'grey'"
            :icon="item.is_visible ? 'visibility' : 'visibility_off'"
            @click="() => toggleVisibility(item)"
          >
            <q-tooltip>{{ item.is_visible ? 'Ocultar' : 'Mostrar' }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            :color="item.is_pinned ? 'red' : 'grey'"
            icon="push_pin"
            @click="() => togglePin(item)"
          >
            <q-tooltip>{{ item.is_pinned ? 'Desfijar' : 'Fijar' }}</q-tooltip>
          </q-btn>
          <q-btn flat round color="grey" icon="edit" @click="() => openEdit(item)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn flat round color="grey" icon="delete" @click="() => confirmDelete(item.id)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </div>
  <CreateGalleryModal
    v-model="isEditOpen"
    mode="edit"
    :gallery-id="selectedId!"
    :initial-data="selectedData"
    @updated="fetchGalleries"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import {
  listGalleries,
  changeGalleryVisibility,
  togglePinGallery,
  deleteGallery,
} from 'src/composables/galleries/useGallery';
import type { Datum as GalleryItem } from 'src/types/gallery.interface';
import CreateGalleryModal from './CreateGalleryModal.vue';

const $q = useQuasar();
const galleries = ref<GalleryItem[]>([]);
const loading = ref(false);
const isEditOpen = ref(false);
const selectedId = ref<number | null>(null);
const selectedData = ref<
  Partial<{
    title: string;
    category_id: number;
    duration: string;
    participants: number;
    is_pinned: number;
    is_visible: number;
  }>
>({});

const API_URL = 'http://127.0.0.1:8000';

function getImageUrl(src: string) {
  return `${API_URL}/storage/${src}`;
}

async function fetchGalleries() {
  loading.value = true;
  try {
    const response = await listGalleries(1, 100); // Fetch all for now
    galleries.value = response.data.data;
  } catch (error) {
    console.log(error);
    $q.notify({ type: 'negative', message: 'Error al cargar la galería' });
  } finally {
    loading.value = false;
  }
}

function openEdit(item: GalleryItem) {
  selectedId.value = item.id;
  selectedData.value = {
    title: item.title,
    category_id: item.category_id,
    duration: item.duration,
    participants: item.participants,
    is_pinned: item.is_pinned,
    is_visible: item.is_visible,
  };
  isEditOpen.value = true;
}

async function toggleVisibility(item: GalleryItem) {
  try {
    await changeGalleryVisibility(item.id);
    item.is_visible = item.is_visible ? 0 : 1;
    $q.notify({
      type: 'positive',
      message: `Visibilidad de "${item.title}" cambiada`,
    });
  } catch (error) {
    console.log(error);
    $q.notify({ type: 'negative', message: 'No se pudo cambiar la visibilidad' });
  }
}

async function togglePin(item: GalleryItem) {
  try {
    await togglePinGallery(item.id);
    item.is_pinned = item.is_pinned ? 0 : 1;
    $q.notify({
      type: 'positive',
      message: `"${item.title}" ${item.is_pinned ? 'fijada' : 'desfijada'}`,
    });
  } catch (error) {
    console.log(error);
    $q.notify({ type: 'negative', message: 'No se pudo cambiar el anclaje' });
  }
}

function confirmDelete(galleryId: number) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de que quieres eliminar esta imagen?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Wrap async work to avoid returning a Promise from the callback
    void (async () => {
      try {
        await deleteGallery(galleryId);
        galleries.value = galleries.value.filter((g) => g.id !== galleryId);
        $q.notify({ type: 'positive', message: 'Imagen eliminada' });
      } catch (error) {
        console.log(error);
        $q.notify({ type: 'negative', message: 'No se pudo eliminar la imagen' });
      }
    })();
  });
}

onMounted(fetchGalleries);

defineExpose({
  fetchGalleries,
});
</script>

<style scoped>
.gallery-card {
  width: 100%;
  max-width: 250px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.gallery-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>
