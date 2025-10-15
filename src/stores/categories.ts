import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CategoryData } from 'src/types/category.interface';
import { useCategoryApi } from 'src/composables/categories/useCategoryApi';

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<CategoryData[]>([]);
  const loading = ref(false);
  const creating = ref(false);
  const deletingIds = ref<Set<number>>(new Set());

  const {
    listCategories: apiListCategories,
    createCategory: apiCreateCategory,
    deleteCategory: apiDeleteCategory,
    updateCategory: apiUpdateCategory,
  } = useCategoryApi();

  async function fetchAll() {
    loading.value = true;
    try {
      const res = await apiListCategories(1, 100);
      categories.value = res.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function create(name: string) {
    creating.value = true;
    try {
      const data = await apiCreateCategory({ name });
      await fetchAll();
      console.log(data.message, 'message');
      return data;
    } catch (err) {
      console.log(err);
    } finally {
      creating.value = false;
    }
  }

  async function remove(id: number) {
    deletingIds.value.add(id);
    try {
      await apiDeleteCategory(id);
      categories.value = categories.value.filter((c) => c.id !== id);
    } finally {
      deletingIds.value.delete(id);
    }
  }

  async function update(id: number, name: string) {
    await apiUpdateCategory(id, { name });
    const idx = categories.value.findIndex((c) => c.id === id);
    if (idx !== -1) {
      categories.value[idx] = { ...categories.value[idx], name } as CategoryData;
    }
  }

  return {
    categories,
    loading,
    creating,
    deletingIds,
    fetchAll,
    create,
    remove,
    update,
  };
});
