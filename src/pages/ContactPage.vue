<template>
  <q-page class="row items-center justify-evenly">
    <div class="q-mx-auto full-width" style="max-width: 1200px">
      <!-- Page header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5">Contactos</div>
        <div class="text-caption text-grey-7">Listado y acciones</div>
      </div>

      <q-card flat bordered>
        <q-card-section class="q-pa-md">
          <TableComponent
            :rows="rows"
            :columns="['id', 'name', 'email', 'message', 'subject', 'created_at']"
            :column-labels="{
              id: 'ID',
              name: 'Nombre',
              email: 'Correo',
              subject: 'Asunto',
              message: 'Mensaje',
              created_at: 'Creado',
            }"
            :show-actions="true"
            :loading="loading"
            :pagination="pagination"
            @request="onRequest"
            separator="vertical"
          >
            <template #body-cell-created_at="{ value }">
              <span>{{ formatDate(value) }}</span>
            </template>
            <template #body-cell-actions="{ row }">
              <q-btn flat dense color="negative" icon="delete" @click="handleDelete(row)" />
            </template>
          </TableComponent>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TableComponent from 'src/components/TableComponent.vue';
import { listContacts, deleteContact } from 'src/composables/contacts/useContactApi';
import type { Datum } from 'src/types/contact.interface';
import { formatDate } from 'src/utils';

const rows = ref<Datum[]>([]);
const loading = ref(false);
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 });

async function fetchContacts() {
  loading.value = true;
  try {
    const res = await listContacts(pagination.value.page, pagination.value.rowsPerPage);
    rows.value = res.data.data;
    // actualizar paginación desde respuesta
    pagination.value.rowsNumber = res.data.total;
    if (res.data.per_page) pagination.value.rowsPerPage = res.data.per_page as unknown as number;
    if (res.data.current_page) pagination.value.page = res.data.current_page as unknown as number;
  } finally {
    loading.value = false;
  }
}

function onRequest(payload: unknown) {
  const p = payload as { pagination?: { page?: number; rowsPerPage?: number } };
  const pg = p?.pagination ?? {};
  if (typeof pg.page === 'number') pagination.value.page = pg.page;
  if (typeof pg.rowsPerPage === 'number') pagination.value.rowsPerPage = pg.rowsPerPage;
  void fetchContacts();
}

async function handleDelete(row: Datum) {
  await deleteContact(row.id);
  await fetchContacts();
}

onMounted(() => {
  void fetchContacts();
});
</script>
