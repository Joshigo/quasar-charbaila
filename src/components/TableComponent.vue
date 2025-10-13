<template>
  <q-table
    :rows="effectiveRows"
    :columns="computedColumns"
    :row-key="rowKey"
    :loading="effectiveLoading"
    :pagination="effectivePagination"
    :separator="separator"
    :dense="dense"
    :flat="flat"
    :bordered="bordered"
    :wrap-cells="wrapCells"
    :no-data-label="noDataLabel"
    @request="onRequest"
  >
    <template v-if="$slots['top-right']" #top-right>
      <slot name="top-right" />
    </template>

    <template #body-cell="slotProps">
      <q-td :props="slotProps">
        <slot :name="`body-cell-${slotProps.col.name}`" v-bind="slotProps">
          <template v-if="resolveRenderer(slotProps.col.name, slotProps.value) === 'rating'">
            <q-rating
              :model-value="Number(slotProps.value ?? 0)"
              :max="5"
              color="amber"
              size="16px"
              readonly
              icon-selected="star"
            />
          </template>
          <template v-else-if="resolveRenderer(slotProps.col.name, slotProps.value) === 'date'">
            <span>{{ slotProps.value }}</span>
          </template>
          <template v-else-if="resolveRenderer(slotProps.col.name, slotProps.value) === 'boolean'">
            <q-badge
              :label="
                (
                  typeof slotProps.value === 'boolean'
                    ? slotProps.value
                    : Number(slotProps.value) === 1
                )
                  ? 'Visible'
                  : 'Oculto'
              "
              :color="
                (
                  typeof slotProps.value === 'boolean'
                    ? slotProps.value
                    : Number(slotProps.value) === 1
                )
                  ? 'positive'
                  : 'negative'
              "
              rounded
              :outline="
                !(typeof slotProps.value === 'boolean'
                  ? slotProps.value
                  : Number(slotProps.value) === 1)
              "
            />
          </template>
          <template v-else>
            <span>{{ String(slotProps.value ?? '') }}</span>
          </template>
        </slot>
      </q-td>
    </template>
    <template v-if="showActions && $slots['body-cell-actions']" #body-cell-actions="slotProps">
      <q-td :props="slotProps">
        <slot name="body-cell-actions" v-bind="slotProps" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { Datum as ContactRow } from 'src/types/contact.interface';
import type { ReviewVisibilityData } from 'src/types/review.interface';
import { useReviewsApi } from 'src/composables/reviews/useReviewsApi';
import { useContactApi } from 'src/composables/contacts/useContactApi';
import type { Pagination as ApiPagination } from 'src/types/common/pagination.interface';

// Minimal local type compatible with Quasar QTable @request payload
interface QTableRequestLike {
  pagination: {
    page: number;
    rowsPerPage: number;
    rowsNumber?: number;
    sortBy?: string;
    descending?: boolean;
  };
  filter?: string | null;
}
// import { usePagination } from 'src/composables/usePagination';

// Instantiate composables
const reviewsApi = useReviewsApi();
const contactsApi = useContactApi();

type Align = 'left' | 'right' | 'center';
type TableRow = ContactRow | ReviewVisibilityData;
type CellValue = string | number | boolean | Date | null | undefined;

export interface ColumnDef<RowT = TableRow> {
  name: string;
  label: string;
  field: string | ((row: RowT) => CellValue);
  align?: Align;
  sortable?: boolean;
}

interface TablePagination {
  page: number;
  rowsPerPage: number;
  rowsNumber?: number;
  sortBy?: string;
  descending?: boolean;
}

interface Props<RowT = TableRow> {
  rows?: RowT[];
  columns?: Array<string | ColumnDef<RowT>>;
  rowKey?: string;
  loading?: boolean;
  dense?: boolean;
  flat?: boolean;
  bordered?: boolean;
  wrapCells?: boolean;
  separator?: 'horizontal' | 'vertical' | 'cell' | 'none';
  pagination?: TablePagination;
  noDataLabel?: string;
  columnLabels?: Record<string, string>;
  showActions?: boolean;
  dataSource?: 'reviews' | 'contacts' | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [],
  rowKey: 'id',
  loading: false,
  dense: false,
  flat: false,
  bordered: true,
  wrapCells: true,
  separator: 'horizontal',
  pagination: () => ({ rowsPerPage: 10, page: 1, rowsNumber: 0 }),
  noDataLabel: 'No hay datos',
  columnLabels: () => ({}),
  showActions: false,
});

console.log('Props:', props);

const emit = defineEmits<{
  (e: 'request', payload: QTableRequestLike): void;
}>();

function startCase(str: string) {
  return str
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

function isDateLike(val: unknown): boolean {
  if (!val) return false;
  if (val instanceof Date && !isNaN(val.valueOf())) return true;
  if (typeof val === 'string') {
    const d = new Date(val);
    return !isNaN(d.valueOf());
  }
  return false;
}

function isBooleanLike(val: unknown): boolean {
  return typeof val === 'boolean' || val === 0 || val === 1;
}

const inferredColumns = computed<ColumnDef<TableRow>[]>(() => {
  const sourceRows = isReviewsMode.value
    ? (reviewsApi.reviews.value as unknown as TableRow[])
    : isContactsMode.value
      ? (contactsApi.contacts.value as unknown as TableRow[])
      : props.rows;
  if (!sourceRows || sourceRows.length === 0) return [];
  const sample = sourceRows[0] as unknown as Record<string, unknown>;
  const keys = Object.keys(sample).filter((k) => {
    const v = sample[k];
    return typeof v !== 'object' || v === null || v instanceof Date;
  });
  const cols: ColumnDef<TableRow>[] = keys.map((k) => ({
    name: k,
    label: props.columnLabels?.[k] ?? startCase(k),
    field: k,
    align: 'left',
    sortable: true,
  }));

  if (props.showActions) {
    cols.push({
      name: 'actions',
      label: 'Acciones',
      field: 'actions',
      align: 'right',
      sortable: false,
    });
  }
  return cols;
});

const computedColumns = computed<ColumnDef<TableRow>[]>(() => {
  if (props.columns && props.columns.length) {
    const cols = props.columns.map((c) =>
      typeof c === 'string'
        ? ({
            name: c,
            label: props.columnLabels?.[c] ?? startCase(c),
            field: c,
            align: 'left',
            sortable: true,
          } as ColumnDef<TableRow>)
        : c,
    );
    if (props.showActions && !cols.some((c) => c.name === 'actions')) {
      cols.push({
        name: 'actions',
        label: 'Acciones',
        field: 'actions',
        align: 'right',
        sortable: false,
      });
    }
    return cols;
  }
  return inferredColumns.value;
});

const isReviewsMode = computed(() => props.dataSource === 'reviews');
const isContactsMode = computed(() => props.dataSource === 'contacts');
const innerPagination = ref<TablePagination>({
  ...(props.pagination ?? { page: 1, rowsPerPage: 10, rowsNumber: 0 }),
});

const effectiveRows = computed<TableRow[]>(() => {
  if (isReviewsMode.value) return reviewsApi.reviews.value as unknown as TableRow[];
  if (isContactsMode.value) return contactsApi.contacts.value as unknown as TableRow[];
  return props.rows ?? [];
});

const effectiveLoading = computed<boolean>(() => {
  if (isReviewsMode.value) return !!reviewsApi.loading.value;
  if (isContactsMode.value) return !!contactsApi.loading.value;
  return !!props.loading;
});

const effectivePagination = computed<TablePagination>(() => {
  if (isReviewsMode.value) {
    console.log('Reviews pagination:', reviewsApi.pagination.value);
    const rp = reviewsApi.pagination.value;
    return {
      page: rp?.page ?? reviewsApi.pagination.value.page ?? 1,
      rowsPerPage: rp?.rowsPerPage ?? reviewsApi.pagination.value.rowsPerPage ?? 10,
      rowsNumber: rp?.rowsNumber ?? reviewsApi.pagination.value.rowsNumber ?? 0,
      total_pages: rp?.total_pages ?? reviewsApi.pagination.value.total_pages ?? 0,
      to: rp?.to ?? reviewsApi.pagination.value.to ?? 0,
      from: rp?.from ?? reviewsApi.pagination.value.from ?? 0,
    };
  }
  if (isContactsMode.value) {
    const cp = contactsApi.pagination.value;
    console.log('Contacts pagination:', contactsApi.pagination.value);
    return {
      page: cp?.page ?? contactsApi.pagination.value.page ?? 1,
      rowsPerPage: cp?.rowsPerPage ?? contactsApi.pagination.value.rowsPerPage ?? 10,
      rowsNumber: cp?.rowsNumber ?? contactsApi.pagination.value.rowsNumber ?? 0,
      total_pages: cp?.total_pages ?? contactsApi.pagination.value.total_pages ?? 0,
      to: cp?.to ?? contactsApi.pagination.value.to ?? 0,
      from: cp?.from ?? contactsApi.pagination.value.from ?? 0,
    };
  }
  return props.pagination ?? { page: 1, rowsPerPage: 10, rowsNumber: 0 };
});

async function fetchReviews() {
  if (!isReviewsMode.value) return;
  // Setting page/rowsPerPage will trigger the composable's watch to fetch
  reviewsApi.pagination.value.page = innerPagination.value.page;
  reviewsApi.pagination.value.rowsPerPage = innerPagination.value.rowsPerPage;
  await reviewsApi.listReviews();
}

async function fetchContacts() {
  if (!isContactsMode.value) return;
  await contactsApi.listContacts(innerPagination.value.page, innerPagination.value.rowsPerPage);
}

function onRequest(payload: QTableRequestLike) {
  emit('request', payload);
  if (isReviewsMode.value || isContactsMode.value) {
    const p = payload.pagination;
    console.log(payload, 'onRequest pagination');
    if (typeof p.page === 'number') {
      innerPagination.value.page = p.page;
      if (isReviewsMode.value) reviewsApi.pagination.value.page = p.page;
      if (isContactsMode.value) contactsApi.pagination.value.page = p.page;
    }
    if (typeof p.rowsPerPage === 'number') {
      innerPagination.value.rowsPerPage = p.rowsPerPage;
      if (isReviewsMode.value) reviewsApi.pagination.value.rowsPerPage = p.rowsPerPage;
      if (isContactsMode.value) contactsApi.pagination.value.rowsPerPage = p.rowsPerPage;
    }
    if (typeof p.rowsNumber === 'number') {
      innerPagination.value.rowsNumber = p.rowsNumber;
    }
    void (isReviewsMode.value ? fetchReviews() : fetchContacts());
  }
}

onMounted(() => {
  if (isReviewsMode.value) {
    innerPagination.value.page = reviewsApi.pagination.value.page;
    innerPagination.value.rowsPerPage = reviewsApi.pagination.value.rowsPerPage;
    const rp = reviewsApi.pagination.value;
    innerPagination.value.rowsNumber = rp?.rowsNumber ?? 0;
    void fetchReviews();
  }
  if (isContactsMode.value) {
    innerPagination.value.page = contactsApi.pagination.value.page;
    innerPagination.value.rowsPerPage = contactsApi.pagination.value.rowsPerPage;
    const cp = contactsApi.pagination.value;
    innerPagination.value.rowsNumber = cp?.rowsNumber ?? 0;
    void fetchContacts();
  }
});

watch(
  () => reviewsApi.pagination.value,
  (rp: ApiPagination | undefined) => {
    if (!isReviewsMode.value || !rp) return;
    innerPagination.value.page = rp.page;
    innerPagination.value.rowsPerPage = rp.rowsPerPage;
    innerPagination.value.rowsNumber = rp.rowsNumber;
  },
  { deep: true },
);
watch(
  () => contactsApi.pagination.value,
  (cp: ApiPagination | undefined) => {
    if (!isContactsMode.value || !cp) return;
    innerPagination.value.page = cp.page;
    innerPagination.value.rowsPerPage = cp.rowsPerPage;
    innerPagination.value.rowsNumber = cp.rowsNumber;
  },
  { deep: true },
);

defineExpose({
  refresh: () =>
    isReviewsMode.value
      ? reviewsApi.listReviews()
      : isContactsMode.value
        ? fetchContacts()
        : undefined,
});

type Renderer = 'rating' | 'date' | 'boolean' | 'text';
function resolveRenderer(colName: string, value: CellValue): Renderer {
  if (colName === 'rating' && typeof value === 'number') return 'rating';
  if (/(_at|date)$/i.test(colName) && isDateLike(value)) return 'date';
  if (/^(is_|has_)/i.test(colName) && isBooleanLike(value)) return 'boolean';
  return 'text';
}
</script>

<style scoped>
/* Optional: tweak default cell styles */
</style>
