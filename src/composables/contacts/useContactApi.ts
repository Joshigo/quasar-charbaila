import { api } from 'src/services/api';
import type { ContactResponse, ContactData } from 'src/types/contact.interface';
import { useAuthStore } from 'src/stores/auth';
import type { DeleteResponse } from 'src/types/common/common.interface';
import { ref } from 'vue';
import type { Pagination } from 'src/types/common/pagination.interface';

export function useContactApi() {
  const authStore = useAuthStore();
  const token = authStore.token;

  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const contacts = ref<ContactData[]>([]);
  const pagination = ref<Pagination>({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
    total_pages: 0,
    to: 0,
    from: 0,
  });
  const loading = ref(false);

  async function listContacts() {
    loading.value = true;
    try {
      const { data } = await api.get<ContactResponse>('/contacts', {
        params: {
          page: pagination.value.page,
          rowsPerPage: pagination.value.rowsPerPage,
        },
      });
      contacts.value = data.data.data;
      const p = data.data;

      pagination.value.page = p.current_page ?? 1;
      pagination.value.rowsPerPage = p.rowsPerPage ?? 10;
      pagination.value.rowsNumber = p.rowsNumber ?? 0;
      pagination.value.total_pages = p.last_page ?? 0;
      pagination.value.to = p.to ?? 0;
      pagination.value.from = p.from ?? 0;
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      loading.value = false;
    }
  }

  async function deleteContact(contactId: number) {
    loading.value = true;
    try {
      const { data } = await api.delete<DeleteResponse>(`/contacts/${contactId}`, {});
      return data;
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      loading.value = false;
    }
  }

  return {
    // methods
    listContacts,
    deleteContact,

    // props
    contacts,
    pagination,
    loading,
  };
}
