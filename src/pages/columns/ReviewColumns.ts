import { formatDate } from 'src/utils';

export const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, sortable: true },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const, sortable: true },
  { name: 'email', label: 'Correo', field: 'email', align: 'left' as const, sortable: true },
  {
    name: 'comment',
    label: 'Comentario',
    field: 'comment',
    align: 'left' as const,
    sortable: false,
  },
  {
    name: 'rating',
    label: 'Calificación',
    field: 'rating',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'is_visible',
    label: 'Visible',
    field: 'is_visible',
    align: 'center' as const,
    sortable: true,
    format: (val: number) => (val ? 'Sí' : 'No'),
  },
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
