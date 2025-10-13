<template>
  <div>
    <q-table
      :rows="reviews"
      row-key="id"
      v-model:pagination="tablePagination"
      :rows-per-page-options="[5, 10, 20, 50]"
      :loading="loading"
      @request="onRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useReviewsApi } from 'src/composables/reviews/useReviewsApi';
const { reviews, loading, pagination, listReviews } = useReviewsApi();

onMounted(async () => {
  await listReviews();
});

const tablePagination = computed({
  get() {
    return {
      page: pagination.value.page,
      rowsPerPage: pagination.value.rowsPerPage,
      rowsNumber: pagination.value.rowsNumber,
    };
  },
  set(val: { page?: number; rowsPerPage?: number; rowsNumber?: number }) {
    if (typeof val.page === 'number') pagination.value.page = val.page;
    if (typeof val.rowsPerPage === 'number') pagination.value.rowsPerPage = val.rowsPerPage;
    if (typeof val.rowsNumber === 'number') pagination.value.rowsNumber = val.rowsNumber;
  },
});

function onRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  const { page, rowsPerPage } = props.pagination;
  if (page !== pagination.value.page) pagination.value.page = page;
  if (rowsPerPage !== pagination.value.rowsPerPage) pagination.value.rowsPerPage = rowsPerPage;
  void listReviews();
}
</script>
