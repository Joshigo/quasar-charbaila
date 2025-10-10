import { api } from 'src/services/api';
import type {
  GalleryResponse,
  CreateGalleryPayload,
  UpdateGalleriePayload,
} from 'src/types/gallery.interface';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();
const token = authStore.token;

export async function listGalleries(page = 1, per_page = 10) {
  const { data } = await api.get<GalleryResponse>(`/galleriesAdmin`, {
    params: { page, per_page },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function createGallery(
  payload: CreateGalleryPayload | FormData,
): Promise<GalleryResponse> {
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
}

export async function deleteGallery(galleryId: number) {
  const { data } = await api.delete<GalleryResponse>(`/galleries/${galleryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function updateGallery(
  galleryId: number,
  payload: UpdateGalleriePayload | FormData,
): Promise<GalleryResponse> {
  const formData: FormData =
    payload instanceof FormData
      ? payload
      : (() => {
          const fd = new FormData();
          if (payload.category_id !== undefined)
            fd.append('category_id', String(payload.category_id));
          if (payload.is_pinned !== undefined) fd.append('is_pinned', String(payload.is_pinned));
          if (payload.is_visible !== undefined) fd.append('is_visible', String(payload.is_visible));
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

  const { data } = await api.post<GalleryResponse>(`/galleries/${galleryId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export async function changeGalleryVisibility(galleryId: number) {
  const { data } = await api.put<GalleryResponse>(`/galleries/${galleryId}/visibility`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
export async function togglePinGallery(galleryId: number) {
  const { data } = await api.put<GalleryResponse>(`/galleries/${galleryId}/pin`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
