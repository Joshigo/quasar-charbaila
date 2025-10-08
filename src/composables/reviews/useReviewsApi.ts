import type { ReviewVisibilityResponse } from 'src/types/review.interface';
import { api } from 'src/services/api';
import type { ReviewResponse } from 'src/types/review.interface';
import { useAuthStore } from 'src/stores/auth';
import type { DeleteResponse } from 'src/types/common/common.interface';

const authStore = useAuthStore();
const token = authStore.token;

export async function listReviews(page = 1) {
  const { data } = await api.get<ReviewResponse>('/reviews', {
    params: { page },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function changeReviewVisibility(reviewId: number) {
  const { data } = await api.put<ReviewVisibilityResponse>(`/reviews/${reviewId}/visibility`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function deleteReview(reviewId: number) {
  const { data } = await api.delete<DeleteResponse>(`/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
