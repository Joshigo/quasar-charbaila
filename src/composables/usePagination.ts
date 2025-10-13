import { ref } from 'vue';

export const usePagination = () => {
  const rowsPerPage = ref(15);
  const page = ref(1);
  const rowsPerPageOptions = [1, 5, 15, 30, 50, 100];

  const updateRowsPerPage = (value: number) => {
    rowsPerPage.value = value;
  };

  const updateCurrentPage = (value: number) => {
    page.value = value;
  };

  return {
    rowsPerPage,
    page,
    rowsPerPageOptions,
    updateRowsPerPage,
    updateCurrentPage,
  };
};
