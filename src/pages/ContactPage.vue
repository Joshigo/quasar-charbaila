<template>
  <q-page class="row items-center justify-evenly">
    <div class="q-mx-auto full-width" style="max-width: 1200px">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5">Contactos</div>
        <div class="text-caption text-grey-7">Listado y acciones</div>
      </div>

      <q-card flat bordered>
        <q-card-section class="q-pa-md">
          <q-table
            :rows="contacts"
            :columns="columns"
            row-key="id"
            v-model:pagination="tablePagination"
            :rows-per-page-options="[5, 10, 20, 50]"
            :loading="loading"
            @request="onRequest"
          >
            <template #body-cell-date="props">
              <q-td :props="props">
                {{ formatDate(props.row.date) }}
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  size="sm"
                  color="negative"
                  icon="delete"
                  round
                  dense
                  class="q-ml-xs"
                  @click="handleDelete(props.row.id)"
                  title="Eliminar"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useContactApi } from 'src/composables/contacts/useContactApi';
import { formatDate } from 'src/utils';
import { columns } from 'src/pages/columns/ContactColumns';

const {
  // methods
  listContacts,
  deleteContact,

  // props
  contacts,
  pagination,
  loading,
} = useContactApi();

const handleDelete = (id: number) => {
  void deleteContact(id).then(() => listContacts());
};

onMounted(async () => {
  await listContacts();
});

const tablePagination = computed({
  get() {
    return {
      page: pagination.value.page,
      rowsPerPage: pagination.value.rowsPerPage,
      rowsNumber: pagination.value.rowsNumber,
    };
  },
  set(val: { page?: number; rowsPerPage?: number; rowsNumber?: number }) {
    if (typeof val.page === 'number') pagination.value.page = val.page;
    if (typeof val.rowsPerPage === 'number') pagination.value.rowsPerPage = val.rowsPerPage;
    if (typeof val.rowsNumber === 'number') pagination.value.rowsNumber = val.rowsNumber;
  },
});

function onRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  const { page, rowsPerPage } = props.pagination;
  if (page !== pagination.value.page) pagination.value.page = page;
  if (rowsPerPage !== pagination.value.rowsPerPage) pagination.value.rowsPerPage = rowsPerPage;
  void listContacts();
}
</script>
