import { api } from 'src/services/api';
import type {
  CategoryResponse,
  CategoryCreateResponse,
  CreateCategoryPayload,
} from 'src/types/category.interface';
import { useAuthStore } from 'src/stores/auth';

export function useCategoryApi() {
  const authStore = useAuthStore();
  const token = authStore.token;

  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  async function listCategories(page = 1, per_page = 10) {
    const { data } = await api.get<CategoryResponse>(`/categories`, {
      params: { page, per_page },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  }

  async function createCategory(payload: CreateCategoryPayload): Promise<CategoryCreateResponse> {
    const { data } = await api.post<CategoryCreateResponse>(`/categories`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  }

  async function deleteCategory(categoryId: number) {
    const { data } = await api.delete<CategoryResponse>(`/categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  }

  async function updateCategory(categoryId: number, payload: CreateCategoryPayload) {
    const { data } = await api.put<CategoryResponse>(`/categories/${categoryId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  }

  return {
    listCategories,
    createCategory,
    deleteCategory,
    updateCategory,
  };
}
