import { api } from 'src/services/api';
import type { GalleryResponse, CreateGalleryPayload } from 'src/types/gallery.interface';
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

export async function createGallery(payload: CreateGalleryPayload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

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

export async function updateGallery(galleryId: number, payload: CreateGalleryPayload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const { data } = await api.post<GalleryResponse>(`/galleries/${galleryId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export async function changeGalleryVisibility(galleryId: number) {
  const { data } = await api.put<GalleryResponse>(`/galleries/${galleryId}/visibility`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
export async function togglePinGallery(galleryId: number) {
  const { data } = await api.put<GalleryResponse>(`/galleries/${galleryId}/pin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
