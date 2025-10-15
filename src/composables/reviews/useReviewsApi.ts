import type { ReviewVisibilityData, ReviewVisibilityResponse } from 'src/types/review.interface';
import { api } from 'src/services/api';
import type { ReviewResponse } from 'src/types/review.interface';
import { useAuthStore } from 'src/stores/auth';
import type { DeleteResponse } from 'src/types/common/common.interface';
import { ref } from 'vue';
import type { Pagination } from 'src/types/common/pagination.interface';

export function useReviewsApi() {
  const authStore = useAuthStore();
  const token = authStore.token;

  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const reviews = ref<ReviewVisibilityData[]>([]);
  const pagination = ref<Pagination>({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
    total_pages: 0,
    to: 0,
    from: 0,
  });
  const loading = ref(false);

  async function listReviews() {
    loading.value = true;
    try {
      const { data } = await api.get<ReviewResponse>(`/reviewsAdmin`, {
        params: {
          page: pagination.value.page,
          rowsPerPage: pagination.value.rowsPerPage,
        },
      });
      reviews.value = data.data.data;

      const p = data.data;
      pagination.value = {
        page: p.current_page,
        rowsPerPage: p.rowsPerPage,
        rowsNumber: p.rowsNumber,
        total_pages: p.last_page,
        to: p.to,
        from: p.from,
      };
      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      loading.value = false;
    }
  }

  async function changeReviewVisibility(reviewId: number) {
    loading.value = true;
    try {
      const { data } = await api.put<ReviewVisibilityResponse>(
        `/reviews/${reviewId}/visibility`,
        undefined,
        {},
      );
      return data;
    } catch (error) {
      console.error('Error changing review visibility:', error);
    } finally {
      loading.value = false;
    }
  }

  async function deleteReview(reviewId: number) {
    loading.value = true;
    try {
      const { data } = await api.delete<DeleteResponse>(`/reviews/${reviewId}`, {});
      return data;
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      loading.value = false;
    }
  }

  return {
    // methods
    listReviews,
    changeReviewVisibility,
    deleteReview,

    // props
    reviews,
    pagination,
    loading,
  };
}
