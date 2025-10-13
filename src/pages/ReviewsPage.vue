<template>
  <q-page class="row items-center justify-evenly">
    <div class="q-mx-auto full-width" style="max-width: 1200px">
      <!-- Page header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5">Reseñas</div>
        <div class="text-caption text-grey-7">Listado y acciones</div>
      </div>

      <q-card flat bordered>
        <q-card-section class="q-pa-md">
          <TableComponent
            ref="tableRef"
            data-source="reviews"
            :columns="['id', 'name', 'email', 'comment', 'rating', 'is_visible', 'created_at']"
            :column-labels="{
              id: 'ID',
              name: 'Nombre',
              email: 'Correo',
              comment: 'Comentario',
              rating: 'Calificación',
              is_visible: 'Visible',
              created_at: 'Creado',
            }"
            :show-actions="true"
            @request="onRequest"
            separator="vertical"
          >
            <template #body-cell-created_at="{ value }">
              <span>{{ formatDate(value) }}</span>
            </template>
            <template #body-cell-actions="{ row }">
              <q-btn flat dense icon="visibility" @click="handleToggleVisibility(row)" />
              <q-btn flat dense color="negative" icon="delete" @click="handleDelete(row)" />
            </template>
          </TableComponent>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TableComponent from 'src/components/TableComponent.vue';
import { useReviewsApi } from 'src/composables/reviews/useReviewsApi';
import type { ReviewVisibilityData } from 'src/types/review.interface';
import { formatDate } from 'src/utils';

const { deleteReview, changeReviewVisibility } = useReviewsApi();

const tableRef = ref<InstanceType<typeof TableComponent> | null>(null);

function onRequest(payload: unknown) {
  console.log('Request payload:', payload);
}

async function handleToggleVisibility(row: ReviewVisibilityData) {
  await changeReviewVisibility(row.id);
  tableRef.value?.refresh?.();
}

async function handleDelete(row: ReviewVisibilityData) {
  await deleteReview(row.id);
  tableRef.value?.refresh?.();
}
</script>
