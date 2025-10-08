import { api } from 'src/services/api';
import type { ContactResponse } from 'src/types/contact.interface';
import { useAuthStore } from 'src/stores/auth';
import type { DeleteResponse } from 'src/types/common/common.interface';

const authStore = useAuthStore();
const token = authStore.token;

export async function listContacts(page = 1, per_page = 10) {
  const { data } = await api.get<ContactResponse>('/contacts', {
    params: { page, per_page },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function deleteContact(contactId: number) {
  const { data } = await api.delete<DeleteResponse>(`/contacts/${contactId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
