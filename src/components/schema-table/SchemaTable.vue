<script>
import { cloneDeep, isFunction, isNil, merge, get } from 'lodash-es'

export default {
  name: 'SchemaTable',
  props: {
    /**
     * @type { Partial<import('element-ui').Table> }
     */
    config: Object,
    data: {
      type: Array,
      default: () => []
    },
    /**
     * @type { Partial<import('element-ui').TableColumn>[] }
     */
    columns: {
      type: Array,
      default: () => [],
    },
    commonColumnProps: Object,
    categoryColumnProps: Object,
    emptyCellValue: {
      type: String,
      default: '-'
    }
  },
  computed: {
    tableProps() {
      return this.makeTableProps()
    },
    internalColumns() {
      return this.makeColumns()
    }
  },
  methods: {
    getSlots() {
      return {
        ...this.$slots,
        ...this.$scopedSlots
      }
    },
    makeTableProps() {
      return merge({ data: this.data }, this.config)
    },
    generateColumnKey({ prop, label, index }) {
      const input = `${prop}:${label}:${index}`

      let hash = 5381
      for (let i = 0; i < input.length; i++) {
        hash = (hash << 5) + hash + input.charCodeAt(i)
        hash = hash & hash
      }

      hash = Math.abs(hash)

      return hash.toString(36).toLowerCase().padStart(8, '0').slice(-8)
    },
    makeColumns() {
      let index = 0
      const cloneColumns = cloneDeep(this.columns)

      const makeColumnHandle = columns => {
        return columns.map(column => {
          const columnProps = {}
          const internalProps = {
            _key: this.generateColumnKey({ ...column, index: index++ })
          }

          if (column.useCommon !== false) {
            Object.assign(columnProps, this.commonColumnProps, get(this.categoryColumnProps, column.category))
          }

          if (Array.isArray(column.children)) {
            internalProps.children = makeColumnHandle(column.children)
          }

          return merge(columnProps, column, internalProps)
        })
      }

      return makeColumnHandle(cloneColumns)
    },
    renderColumns(columns) {
      return columns.map(column => {
        return this.renderColumn(column)
      })
    },
    renderColumn(column) {
      const globalSlots = this.getSlots()
      const columnSlots = {
        header: props => {
          return this._t(
            column['headerSlotName'],
            () => {
              return this.renderCellHeader({ ...props, col: column })
            },
            props
          )
        }
      }

      const isTypeColumn = column.type != null
      const isCustmRender = isFunction(column.render) || column['slotName'] in globalSlots
      const hasChildren = Array.isArray(column.children)

      if (!hasChildren && (!isTypeColumn || isCustmRender)) {
        columnSlots.default = props => {
          return this._t(
            column['slotName'],
            () => {
              return this.renderCell({ ...props, col: column })
            },
            props
          )
        }
      }

      return this.$createElement(
        'el-table-column',
        {
          key: column._key,
          props: column,
          scopedSlots: columnSlots
        },
        hasChildren ? this.renderColumns(column.children) : null
      )
    },
    renderCellHeader(params) {
      const h = this.$createElement

      const { col, column } = params

      if (isFunction(col.renderHeader)) {
        return col.renderHeader(h, params)
      }

      return column.label
    },
    renderCell(params) {
      const h = this.$createElement

      const { row, col } = params
      const cellValue = row[col.prop]

      if (isFunction(col.render)) {
        return col.render(h, { ...params, cellValue })
      }

      if (isNil(cellValue) || cellValue === '') {
        return this.emptyCellValue
      }

      if (isFunction(col.formatter)) {
        return col.formatter(cellValue, { h, ...params })
      }

      return cellValue
    }
  },
  render(h) {
    return h('el-table', {
      props: this.tableProps,
      attrs: this.$attrs,
      on: this.$listeners,
      scopedSlots: this._u(
        [
          // 解决table组件在jsx模式下$slots取不到append
          {
            key: 'append',
            fn: () => this._t('append'),
            proxy: true
          }
        ],
        {
          empty: () => this._t('empty'),
          default: () => this.renderColumns(this.internalColumns)
        }
      )
    })
  }
}
</script>
