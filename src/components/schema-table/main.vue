<script lang="jsx">
import { cloneDeep, isFunction, isNil, merge } from 'lodash-es';

import TableComponent from 'element-ui/lib/table';
import TableColumnComponent from 'element-ui/lib/table-column';

export default {
  name: 'SchemaTable',
  props: {
    /**
     * @type { Partial<import("element-ui").Table> }
     */
    config: Object,
    data: {
      type: Array,
      default: () => [],
    },
    /**
     * @type { Partial<import("element-ui").TableColumn>[] }
     */
    columns: {
      type: Array,
      default: () => [],
    },
    emptyCellValue: {
      type: String,
      default: '-',
    },
  },
  computed: {
    tableProps() {
      return this.makeTableProps();
    },
    internalColumns() {
      return this.makeColumns();
    },
  },
  methods: {
    getSlots() {
      return {
        ...this.$slots,
        ...this.$scopedSlots,
      };
    },
    makeTableProps() {
      return merge({ data: this.data }, this.config);
    },
    generateColumnKey({ prop, label, index }) {
      const input = `${prop}:${label}:${index}`;

      let hash = 5381;
      for (let i = 0; i < input.length; i++) {
        hash = (hash << 5) + hash + input.charCodeAt(i);
        hash = hash & hash;
      }

      hash = Math.abs(hash);

      return hash.toString(36).toLowerCase().padStart(8, '0').slice(-8);
    },
    makeColumns() {
      let index = 0;
      const cloneColumns = cloneDeep(this.columns);

      const deepHandler = columns => {
        columns.forEach(column => {
          column._key = this.generateColumnKey({ ...column, index: index++ });

          if (Array.isArray(column.children)) {
            column.children = deepHandler(column.children);
          }
        });

        return columns;
      };

      return deepHandler(cloneColumns);
    },
    renderColumns(columns) {
      return columns.map(column => {
        return this.renderColumn(column);
      });
    },
    renderColumn(column) {
      const globalSlots = this.getSlots();
      const columnSlots = {
        header: props => {
          return this._t(
            column['headerSlotName'],
            () => {
              return this.renderCellHeader({ ...props, col: column });
            },
            props
          );
        },
      };

      const isTypeColumn = column.type != null;
      const isCustmRender = isFunction(column.render) || column['slotName'] in globalSlots;
      const hasChildren = Array.isArray(column.children);

      if (!hasChildren && (!isTypeColumn || isCustmRender)) {
        columnSlots.default = props => {
          return this._t(
            column['slotName'],
            () => {
              return this.renderCell({ ...props, col: column });
            },
            props
          );
        };
      }

      return this.$createElement(
        TableColumnComponent,
        {
          key: column._key,
          props: column,
          scopedSlots: columnSlots,
        },
        hasChildren ? this.renderColumns(column.children) : null
      );
    },
    renderCellHeader(params) {
      const h = this.$createElement;

      const { col, column } = params;

      if (isFunction(col.renderHeader)) {
        return col.renderHeader(h, params);
      }

      return column.label;
    },
    renderCell(params) {
      const h = this.$createElement;

      const { row, col } = params;
      const cellValue = row[col.prop];

      if (isFunction(col.render)) {
        return col.render(h, { ...params, cellValue });
      }

      if (isNil(cellValue) || cellValue === '') {
        return this.emptyCellValue;
      }

      if (isFunction(col.formatter)) {
        return col.formatter(cellValue, { h, ...params });
      }

      return cellValue;
    },
  },
  render(h) {
    return h(
      TableComponent,
      {
        props: this.tableProps,
        attrs: this.$attrs,
        on: this.$listeners,
      },
      this.renderColumns(this.internalColumns)
    );
  },
};
</script>
