import SchemaTable from './components/schema-table';
import schemaTable from './components/schema-table';

function install(Vue) {
  Vue.component(schemaTable.name, schemaTable);
}

export { install as default, SchemaTable };
