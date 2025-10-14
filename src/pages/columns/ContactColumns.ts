import { formatDate } from 'src/utils';

export const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, sortable: true },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const, sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const, sortable: true },
  { name: 'message', label: 'Mensaje', field: 'message', align: 'left' as const, sortable: false },
  {
    name: 'created_at',
    label: 'Creado',
    field: 'created_at',
    align: 'left' as const,
    sortable: true,
    format: (val: string) => formatDate(val),
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'id',
    align: 'center' as const,
  },
];
