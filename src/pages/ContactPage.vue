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
            ref="tableRef"
            data-source="contacts"
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
import { ref } from 'vue';
import TableComponent from 'src/components/TableComponent.vue';
import { useContactApi } from 'src/composables/contacts/useContactApi';
import type { Datum } from 'src/types/contact.interface';
import { formatDate } from 'src/utils';

const { deleteContact } = useContactApi();

const tableRef = ref<InstanceType<typeof TableComponent> | null>(null);

function onRequest(/* payload: unknown */) {
  // The TableComponent handles pagination and fetching in contacts mode.
}

async function handleDelete(row: Datum) {
  await deleteContact(row.id);
  tableRef.value?.refresh?.();
}
</script>
