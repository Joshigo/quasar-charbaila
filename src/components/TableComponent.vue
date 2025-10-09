<template>
  <q-table
    :rows="rows"
    :columns="computedColumns"
    :row-key="rowKey"
    :loading="loading"
    :pagination="pagination"
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

    <!-- Generic cell renderer with sensible defaults; can be overridden by per-column slots -->
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
            <span>{{ formatDate(slotProps.value) }}</span>
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

    <!-- Optional Actions column slot -->
    <template v-if="showActions && $slots['body-cell-actions']" #body-cell-actions="slotProps">
      <q-td :props="slotProps">
        <slot name="body-cell-actions" v-bind="slotProps" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Minimal column type compatible with Quasar's QTable
type Align = 'left' | 'right' | 'center';
export interface ColumnDef<RowT = any> {
  name: string;
  label: string;
  field: string | ((row: RowT) => any);
  align?: Align;
  sortable?: boolean;
}

interface Props<RowT = Record<string, unknown>> {
  rows: RowT[];
  columns?: Array<string | ColumnDef<RowT>>;
  rowKey?: string;
  loading?: boolean;
  dense?: boolean;
  flat?: boolean;
  bordered?: boolean;
  wrapCells?: boolean;
  separator?: 'horizontal' | 'vertical' | 'cell' | 'none';
  pagination?: Record<string, unknown>;
  noDataLabel?: string;
  // Optional label overrides for inferred columns
  columnLabels?: Record<string, string>;
  // Whether to auto-add an actions column if slot provided
  showActions?: boolean;
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
  pagination: () => ({ rowsPerPage: 10, page: 1 }),
  noDataLabel: 'No hay datos',
  columnLabels: () => ({}),
  showActions: false,
});

const emit = defineEmits<{
  (e: 'request', payload: unknown): void;
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

const inferredColumns = computed<ColumnDef[]>(() => {
  if (props.rows.length === 0) return [];
  const sample = props.rows[0] as Record<string, unknown>;
  const keys = Object.keys(sample).filter((k) => {
    const v = (sample as any)[k];
    return typeof v !== 'object' || v === null || v instanceof Date;
  });
  const cols: ColumnDef[] = keys.map((k) => ({
    name: k,
    label: props.columnLabels?.[k] ?? startCase(k),
    field: k,
    align: 'left',
    sortable: true,
  }));

  // If consumer wants actions and exposes the slot, add a trailing actions column
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

const computedColumns = computed<ColumnDef[]>(() => {
  if (props.columns && props.columns.length) {
    const cols = props.columns.map((c) =>
      typeof c === 'string'
        ? ({
            name: c,
            label: props.columnLabels?.[c] ?? startCase(c),
            field: c,
            align: 'left',
            sortable: true,
          } as ColumnDef)
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
    return cols as ColumnDef[];
  }
  return inferredColumns.value;
});

function onRequest(payload: unknown) {
  emit('request', payload);
}

// Renderer selection
type Renderer = 'rating' | 'date' | 'boolean' | 'text';
function resolveRenderer(colName: string, value: unknown): Renderer {
  if (colName === 'rating' && typeof value === 'number') return 'rating';
  if (/(_at|date)$/i.test(colName) && isDateLike(value)) return 'date';
  if (/^(is_|has_)/i.test(colName) && isBooleanLike(value)) return 'boolean';
  return 'text';
}

function getDefaultRenderer(colName: string, value: unknown) {
  const r = resolveRenderer(colName, value);
  switch (r) {
    case 'rating':
      return 'q-rating';
    case 'date':
      return 'span';
    case 'boolean':
      return 'q-badge';
    default:
      return 'span';
  }
}

function formatDate(val: unknown): string {
  const d = val instanceof Date ? val : new Date(String(val));
  if (isNaN(d.valueOf())) return '';
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}

function getRendererProps(colName: string, value: unknown, row: Record<string, unknown>) {
  const r = resolveRenderer(colName, value);
  if (r === 'rating') {
    return {
      modelValue: Number(value ?? 0),
      max: 5,
      color: 'amber',
      size: '16px',
      readonly: true,
      'icon-selected': 'star',
    };
  }
  if (r === 'date') {
    return { innerHTML: formatDate(value) } as any;
  }
  if (r === 'boolean') {
    const v = typeof value === 'boolean' ? value : Number(value) === 1;
    return {
      label: v ? 'Visible' : 'Oculto',
      color: v ? 'positive' : 'negative',
      rounded: true,
      outline: !v,
    };
  }
  return { innerHTML: String(value ?? '') } as any;
}
</script>

<style scoped>
/* Optional: tweak default cell styles */
</style>
