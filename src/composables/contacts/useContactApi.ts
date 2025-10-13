import { api } from 'src/services/api';
import type { ContactResponse, Datum } from 'src/types/contact.interface';
import { useAuthStore } from 'src/stores/auth';
import type { DeleteResponse } from 'src/types/common/common.interface';
import { ref } from 'vue';
import type { Pagination } from 'src/types/common/pagination.interface';

export function useContactApi() {
  const authStore = useAuthStore();
  const token = authStore.token;

  const contacts = ref<Datum[]>([]);
  const pagination = ref<Pagination>({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
    total_pages: 0,
    to: 0,
    from: 0,
  });
  const loading = ref(false);

  async function listContacts(page: number = 1, rowsPerPage: number = 10) {
    try {
      loading.value = true;
      const { data } = await api.get<ContactResponse>('/contacts', {
        params: {
          page,
          rowsPerPage,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      contacts.value = data.data.data;
      console.log('Contacts ref:', contacts.value);
      console.log('Contacts API data:', data);
      // pagination.value = {
      //   current_page: data.data.current_page,
      //   rowsPerPage: data.data.rowsPerPage,
      //   rowsNumber: data.data.rowsNumber,
      //   total_pages: data.data.last_page,
      //   to: data.data.to,
      //   from: data.data.from,
      // };
      console.log('Contacts Pagination:', pagination.value);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      loading.value = false;
    }
  }

  async function deleteContact(contactId: number) {
    loading.value = true;
    const { data } = await api.delete<DeleteResponse>(`/contacts/${contactId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    loading.value = false;
    return data;
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
