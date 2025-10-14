import { api } from 'src/services/api';
import type {
  GalleryResponse,
  CreateGalleryPayload,
  UpdateGalleriePayload,
  GalleryData,
} from 'src/types/gallery.interface';
import { useAuthStore } from 'src/stores/auth';
import { ref } from 'vue';
import type { Pagination } from 'src/types/common/pagination.interface';
import type { DeleteResponse } from 'src/types/common/common.interface';

export function useGallery() {
  const authStore = useAuthStore();
  const token = authStore.token;

  const galleries = ref<GalleryData[]>([]);
  const pagination = ref<Pagination>({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
    total_pages: 0,
    to: 0,
    from: 0,
  });
  const loading = ref(false);
  const isEditOpen = ref(false);

  async function listGalleries() {
    loading.value = true;
    try {
      const { data } = await api.get<GalleryResponse>(`/galleriesAdmin`, {
        params: {
          page: pagination.value.page,
          per_page: pagination.value.rowsPerPage,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      galleries.value = data.data.data;

      const p = data.data;
      pagination.value = {
        page: p.current_page,
        rowsPerPage: p.per_page,
        rowsNumber: p.total,
        total_pages: p.last_page,
        to: p.to,
        from: p.from,
      };
      return data;
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createGallery(payload: CreateGalleryPayload | FormData): Promise<GalleryResponse> {
    try {
      const formData: FormData =
        payload instanceof FormData
          ? payload
          : (() => {
              const fd = new FormData();
              fd.append('category_id', String(payload.category_id));
              fd.append('is_pinned', String(payload.is_pinned));
              fd.append('is_visible', String(payload.is_visible));
              fd.append('type', payload.type);
              fd.append('title', payload.title);
              if (payload.description !== undefined && payload.description !== null) {
                fd.append('description', payload.description);
              }
              fd.append('duration', payload.duration);
              if (payload.participants !== undefined && payload.participants !== null) {
                fd.append('participants', String(payload.participants));
              }
              fd.append('image', payload.image);
              return fd;
            })();

      const { data } = await api.post<GalleryResponse>(`/galleries`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      console.error('Error creating gallery:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteGallery(galleryId: number): Promise<DeleteResponse | undefined> {
    loading.value = true;
    try {
      const { data } = await api.delete<DeleteResponse>(`/galleries/${galleryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      console.error('Error deleting gallery:', error);
    } finally {
      loading.value = false;
    }
  }

  async function updateGallery(
    galleryId: number,
    payload: UpdateGalleriePayload | FormData,
  ): Promise<GalleryResponse> {
    loading.value = true;
    isEditOpen.value = true;
    try {
      const formData: FormData =
        payload instanceof FormData
          ? payload
          : (() => {
              const fd = new FormData();
              if (payload.category_id !== undefined)
                fd.append('category_id', String(payload.category_id));
              if (payload.is_pinned !== undefined)
                fd.append('is_pinned', String(payload.is_pinned));
              if (payload.is_visible !== undefined)
                fd.append('is_visible', String(payload.is_visible));
              if (payload.type !== undefined) fd.append('type', payload.type);
              if (payload.src !== undefined) fd.append('src', String(payload.src));
              if (payload.title !== undefined) fd.append('title', String(payload.title));
              if (payload.description !== undefined && payload.description !== null)
                fd.append('description', payload.description);
              if (payload.duration !== undefined) fd.append('duration', String(payload.duration));
              if (payload.participants !== undefined)
                fd.append('participants', String(payload.participants));
              return fd;
            })();

      const { data } = await api.post<GalleryResponse>(`/galleries/${galleryId}/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      console.error('Error updating gallery:', error);
      throw error;
    } finally {
      loading.value = false;
      isEditOpen.value = false;
    }
  }

  async function changeGalleryVisibility(galleryId: number) {
    loading.value = true;
    try {
      const { data } = await api.put<GalleryResponse>(`/galleries/${galleryId}/visibility`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      console.error('Error changing gallery visibility:', error);
    } finally {
      loading.value = false;
    }
  }
  async function togglePinGallery(galleryId: number) {
    try {
      const { data } = await api.put<GalleryResponse>(`/galleries/${galleryId}/pin`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      console.error('Error pinning/unpinning gallery:', error);
    } finally {
      loading.value = false;
    }
  }

  return {
    // methods
    listGalleries,
    createGallery,
    deleteGallery,
    updateGallery,
    changeGalleryVisibility,
    togglePinGallery,

    // props
    galleries,
    pagination,
    loading,
    isEditOpen,
  };
}
