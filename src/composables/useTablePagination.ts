import type { Ref } from 'vue';
import { computed } from 'vue';

export interface Pagination {
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
}

export function useTablePagination(pagination: Ref<Pagination>, fetchFn: () => Promise<unknown>) {
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
    void fetchFn();
  }

  return {
    tablePagination,
    onRequest,
  };
}
