<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isEdit ? 'Editar Imagen' : 'Agregar Nueva Imagen' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="form.title"
            label="Título"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'El título es requerido']"
          />

          <q-select
            filled
            v-model="form.category_id"
            :options="categoryOptions"
            label="Categoría"
            emit-value
            map-options
            lazy-rules
            :rules="[(val) => val !== null || 'Selecciona una categoría']"
          />

          <q-file
            filled
            v-model="form.image"
            label="Imagen"
            accept="image/*"
            lazy-rules
            :rules="[(val) => !!val || 'La imagen es requerida']"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <q-input
            filled
            v-model="form.duration"
            label="Duración (ej. 2h 30m)"
            placeholder="2h 30m"
          />

          <q-input filled v-model.number="form.participants" type="number" label="Participantes" />

          <q-toggle v-model="form.is_pinned" label="Fijar en la galería" />
          <q-toggle v-model="form.is_visible" label="Visible" />

          <q-card-actions align="right">
            <q-btn label="Cancelar" color="grey" flat v-close-popup />
            <q-btn
              :label="isEdit ? 'Actualizar' : 'Guardar'"
              type="submit"
              color="primary"
              :loading="loading"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import { createGallery, updateGallery } from 'src/composables/galleries/useGallery';
import { useCategoriesStore } from 'src/stores/categories';
// No usamos el payload tipado de la API directamente aquí, ya que el formulario maneja tipos cómodos
// (booleans y File) y luego transformamos a FormData en el submit.

const props = defineProps<{
  modelValue: boolean;
  mode?: 'create' | 'edit';
  galleryId?: number;
  initialData?: Partial<{
    title: string;
    category_id: number;
    duration: string;
    participants: number;
    is_pinned: boolean | number;
    is_visible: boolean | number;
  }>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'created'): void;
  (e: 'updated'): void;
}>();

const $q = useQuasar();

const loading = ref(false);
const store = useCategoriesStore();
const categoryOptions = computed<{ label: string; value: number }[]>(() =>
  store.categories.map((c) => ({ label: c.name, value: c.id })),
);

type GalleryForm = {
  title: string;
  category_id: number | null;
  image: File | null;
  duration: string;
  participants: number | null;
  is_pinned: boolean;
  is_visible: boolean;
};

const initialFormState: GalleryForm = {
  title: '',
  category_id: null,
  image: null,
  duration: '',
  participants: 1,
  is_pinned: false,
  is_visible: true,
};

const form = ref<GalleryForm>({ ...initialFormState });

const isEdit = computed(() => props.mode === 'edit');

async function ensureCategoriesLoaded() {
  if (!store.categories.length) {
    try {
      await store.fetchAll();
    } catch (err) {
      console.log(err);
      $q.notify({ type: 'negative', message: 'Error al cargar categorías' });
    }
  }
}

async function onSubmit() {
  loading.value = true;
  try {
    const fd = new FormData();
    // comunes a create/update
    if (form.value.title) fd.append('title', form.value.title);
    if (form.value.category_id !== null) fd.append('category_id', String(form.value.category_id));
    if (form.value.duration) fd.append('duration', form.value.duration);
    if (form.value.participants !== null)
      fd.append('participants', String(form.value.participants));
    fd.append('is_pinned', form.value.is_pinned ? '1' : '0');
    fd.append('is_visible', form.value.is_visible ? '1' : '0');
    if (form.value.image) fd.append('image', form.value.image);

    if (isEdit.value && props.galleryId) {
      await updateGallery(props.galleryId, fd);
      $q.notify({ type: 'positive', message: 'Imagen actualizada correctamente' });
      emit('updated');
      emit('update:modelValue', false);
    } else {
      fd.append('type', 'image');
      await createGallery(fd);
      $q.notify({ type: 'positive', message: 'Imagen agregada correctamente' });
      emit('created');
      emit('update:modelValue', false);
    }
  } catch (err) {
    console.log(err);
    $q.notify({
      type: 'negative',
      message: isEdit.value ? 'No se pudo actualizar la imagen' : 'No se pudo agregar la imagen',
    });
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Reset y precarga si hay datos iniciales (modo edición)
      form.value = { ...initialFormState };
      if (props.initialData) {
        form.value.title = props.initialData.title ?? '';
        form.value.category_id =
          props.initialData.category_id !== undefined ? props.initialData.category_id : null;
        form.value.duration = props.initialData.duration ?? '';
        form.value.participants =
          props.initialData.participants !== undefined ? props.initialData.participants : 1;
        const pinned = props.initialData.is_pinned;
        const visible = props.initialData.is_visible;
        form.value.is_pinned = typeof pinned === 'number' ? pinned === 1 : Boolean(pinned);
        form.value.is_visible = typeof visible === 'number' ? visible === 1 : Boolean(visible);
      }
    }
  },
);

onMounted(ensureCategoriesLoaded);
</script>
