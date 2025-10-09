<template>
  <TableComponent
    :rows="rows"
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
    :loading="loading"
    :pagination="pagination"
    @request="onRequest"
  >
    <!-- Acciones -->
    <template #body-cell-actions="{ row }">
      <q-btn flat dense icon="visibility" @click="handleToggleVisibility(row)" />
      <q-btn flat dense color="negative" icon="delete" @click="handleDelete(row)" />
    </template>
  </TableComponent>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TableComponent from 'src/components/TableComponent.vue';
import {
  listReviews,
  changeReviewVisibility,
  deleteReview,
} from 'src/composables/reviews/useReviewsApi';
import type { Datum } from 'src/types/review.interface';

const rows = ref<Datum[]>([]);
const loading = ref(false);
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 });

async function fetchReviews() {
  loading.value = true;
  try {
    const res = await listReviews(pagination.value.page, pagination.value.rowsPerPage);
    rows.value = res.data.data;
    // actualizar paginación desde respuesta
    pagination.value.rowsNumber = res.data.total;
    if (res.data.per_page) pagination.value.rowsPerPage = res.data.per_page as unknown as number;
    if (res.data.current_page) pagination.value.page = res.data.current_page as unknown as number;
  } finally {
    loading.value = false;
  }
}

function onRequest(payload: unknown) {
  const p = payload as { pagination?: { page?: number; rowsPerPage?: number } };
  const pg = p?.pagination ?? {};
  if (typeof pg.page === 'number') pagination.value.page = pg.page;
  if (typeof pg.rowsPerPage === 'number') pagination.value.rowsPerPage = pg.rowsPerPage;
  void fetchReviews();
}

async function handleToggleVisibility(row: Datum) {
  await changeReviewVisibility(row.id);
  await fetchReviews();
}

async function handleDelete(row: Datum) {
  await deleteReview(row.id);
  await fetchReviews();
}

onMounted(() => {
  void fetchReviews();
});
</script>
