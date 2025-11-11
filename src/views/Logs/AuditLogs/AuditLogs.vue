<template>
  <b-container fluid>
    <page-title />
    <b-row class="align-items-start">
      <b-col class="d-sm-flex align-items-end">
        <search
          :placeholder="$t('pageAuditLogs.table.searchLogs')"
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
        <div class="ml-sm-4">
          <table-cell-count
            :filtered-items-count="filteredRows"
            :total-number-of-cells="allLogs.length"
          ></table-cell-count>
        </div>
      </b-col>
      <b-col class="form-group-wrapper">
        <table-date-filter @change="onChangeDateTimeFilter" />
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          @clear-selected="clearSelectedRows($refs.table)"
        >
          <template #toolbar-buttons>
            <table-toolbar-export
              :data="batchExportData"
              :file-name="exportFileNameByDate()"
            />
          </template>
        </table-toolbar>
        <div class="table-container">
          <b-table
            id="table-post-code-logs"
            ref="table"
            responsive="md"
            selectable
            no-select-on-click
            sort-icon-left
            hover
            no-sort-reset
            sticky-header
            sort-desc
            show-empty
            sort-by="id"
            :fields="fields"
            :items="filteredLogs"
            :empty-text="$t('global.table.emptyMessage')"
            :empty-filtered-text="$t('global.table.emptySearchMessage')"
            :per-page="perPage"
            :current-page="currentPage"
            :filter="searchFilter"
            :busy="isBusy"
            @filtered="onFiltered"
            @row-selected="onRowSelected($event, filteredLogs.length)"
          >
            <!-- Checkbox column -->
            <template #head(checkbox)>
              <b-form-checkbox
                v-model="tableHeaderCheckboxModel"
                data-test-id="audit-checkbox-selectAll"
                :indeterminate="tableHeaderCheckboxIndeterminate"
                @change="onChangeHeaderCheckbox($refs.table)"
              >
                <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
              </b-form-checkbox>
            </template>
            <template #cell(checkbox)="row">
              <b-form-checkbox
                v-model="row.rowSelected"
                :data-test-id="`audit-checkbox-selectRow-${row.index}`"
                @change="toggleSelectRow($refs.table, row.index)"
              >
                <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
              </b-form-checkbox>
            </template>
            <!-- Date column -->
            <template #cell(date)="{ value }">
              <p class="mb-0">
                {{ value | formatDate }} {{ value | formatTime }}
              </p>
              <p class="mb-0">{{ timezone }}</p>
            </template>

            <!-- Actions column -->
            <template #cell(actions)="row">
              <table-row-action
                v-for="(action, index) in row.item.actions"
                :key="index"
                :value="action.value"
                :title="action.title"
                :row-data="row.item"
                :btn-icon-only="true"
                :export-name="exportFileNameByDate(action.value)"
                :download-location="row.item.uri"
                :download-in-new-tab="true"
                :show-button="false"
              >
                <template #icon>
                  <icon-export v-if="action.value === 'export'" />
                  <icon-download v-if="action.value === 'download'" />
                </template>
              </table-row-action>
            </template>
          </b-table>
        </div>
        <b-row class="justify-content-center">
          <div class="btn-container">
            <b-button
              variant="link"
              class="btn-table"
              :disabled="allLogs.length === 0"
              @click="deleteAllLogs"
            >
              <span class="d-inline-block d-sm-none">
                <icon-trashcan /> {{ $t('global.action.deleteAllMobile') }}
              </span>
              <span class="d-none d-sm-inline-block">
                <icon-trashcan /> {{ $t('global.action.deleteAll') }}
              </span>
            </b-button>
            <b-button
              variant="link"
              class="btn-table"
              :disabled="allLogs.length === 0"
              :download="exportFileNameByDate()"
              :href="href"
            >
              <icon-export /> {{ $t('pageAuditLogs.button.exportAll') }}
            </b-button>
          </div>
        </b-row>
      </b-col>
    </b-row>

    <!-- Table pagination -->
    <b-row class="table-pagination-container">
      <b-col sm="6">
        <b-form-group
          class="table-pagination-select"
          :label="$t('global.table.itemsPerPage')"
          label-for="pagination-items-per-page"
        >
          <b-form-select
            id="pagination-items-per-page"
            v-model="perPage"
            :options="itemsPerPageOptions"
          />
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <b-pagination
          v-model="currentPage"
          first-number
          last-number
          :per-page="perPage"
          :total-rows="getTotalRowCount(filteredRows)"
          aria-controls="table-post-code-logs"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import IconDelete from '@carbon/icons-vue/es/trash-can/20';
import IconDownload from '@carbon/icons-vue/es/download/20';
import IconExport from '@carbon/icons-vue/es/document--export/20';
import { omit } from 'lodash';
import PageTitle from '@/components/Global/PageTitle';
import Search from '@/components/Global/Search';
import TableCellCount from '@/components/Global/TableCellCount';
import TableDateFilter from '@/components/Global/TableDateFilter';
import TableRowAction from '@/components/Global/TableRowAction';
import TableToolbar from '@/components/Global/TableToolbar';
import TableToolbarExport from '@/components/Global/TableToolbarExport';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import TableFilterMixin from '@/components/Mixins/TableFilterMixin';
import BVPaginationMixin, {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';

export default {
  components: {
    IconDelete,
    IconExport,
    IconDownload,
    PageTitle,
    Search,
    TableCellCount,
    TableRowAction,
    TableToolbar,
    TableToolbarExport,
    TableDateFilter,
  },
  mixins: [
    BVPaginationMixin,
    BVTableSelectableMixin,
    BVToastMixin,
    LoadingBarMixin,
    TableFilterMixin,
    TableSortMixin,
    TableRowExpandMixin,
    SearchFilterMixin,
  ],
  beforeRouteLeave(to, from, next) {
    // Hide loader if the user navigates to another page
    // before request is fulfilled.
    this.hideLoader();
    next();
  },
  data() {
    return {
      isBusy: true,
      fields: [
        {
          key: 'checkbox',
          sortable: false,
        },
        {
          key: 'date',
          label: this.$t('pageAuditLogs.table.created'),
          sortable: true,
        },
        {
          key: 'timeStampOffset',
          label: this.$t('pageAuditLogs.table.timeStampOffset'),
        },
        {
          key: 'bootCount',
          label: this.$t('pageAuditLogs.table.bootCount'),
        },
        {
          key: 'message',
          label: this.$t('pageAuditLogs.table.message'),
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      expandRowLabel,
      activeFilters: [],
      currentPage: currentPage,
      filterStartDate: null,
      filterEndDate: null,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
    };
  },
  computed: {
    href() {
      return `data:text/json;charset=utf-8,${this.exportAllLogsString()}`;
    },
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.filteredLogs.length;
    },
    allLogs() {
      return [];
      //   return this.$store.getters['auditLogs/allAuditLogs'].map((auditLogs) => {
      //     return {
      //       ...auditLogs,
      //       actions: [
      //         {
      //           value: 'export',
      //           title: this.$t('pageAuditLogs.action.exportLogs'),
      //         },
      //         {
      //           value: 'download',
      //           title: this.$t('pageAuditLogs.action.downloadDetails'),
      //         },
      //       ],
      //     };
      //   });
    },
    batchExportData() {
      return this.selectedRows.map((row) => omit(row, 'actions'));
    },
    filteredLogsByDate() {
      return this.getFilteredTableDataByDate(
        this.allLogs,
        this.filterStartDate,
        this.filterEndDate,
      );
    },
    filteredLogs() {
      return this.getFilteredTableData(
        this.filteredLogsByDate,
        this.activeFilters,
      );
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('auditLogs/getAuditLogData').finally(() => {
      this.endLoader();
      this.isBusy = false;
    });
  },
  methods: {
    deleteAllLogs() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageAuditLogs.modal.deleteAllMessage'), {
          title: this.$t('pageAuditLogs.modal.deleteAllTitle'),
          okTitle: this.$t('global.action.delete'),
          okVariant: 'danger',
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.$store
              .dispatch('auditLogs/deleteAllAuditLogs', this.allLogs)
              .then((message) => this.successToast(message))
              .catch(({ message }) => this.errorToast(message));
          }
        });
    },
    exportAllLogsString() {
      {
        // return this.$store.getters['auditLogs/allAuditLogs'].map(
        //   (auditLogs) => {
        //     const allLogsString = JSON.stringify(auditLogs);
        //     return allLogsString;
        //   },
        // );
      }
    },
    onFilterChange({ activeFilters }) {
      this.activeFilters = activeFilters;
    },
    onChangeDateTimeFilter({ fromDate, toDate }) {
      this.filterStartDate = fromDate;
      this.filterEndDate = toDate;
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    // Create export file name based on date and action
    exportFileNameByDate(value) {
      let date = new Date();
      date =
        date.toISOString().slice(0, 10) +
        '_' +
        date.toString().split(':').join('-').split(' ')[4];
      let fileName;
      if (value === 'download') {
        fileName = this.$t('pageAuditLogs.downloadFilePrefix');
      } else if (value === 'export') {
        fileName = this.$t('pageAuditLogs.exportFilePrefix');
      } else {
        fileName = this.$t('pageAuditLogs.allExportFilePrefix');
      }
      return fileName + date;
    },
  },
};
</script>
<style lang="scss" scoped>
.form-group-wrapper {
  @include media-breakpoint-down(md) {
    align-self: end;
  }
}
.table-pagination-container {
  @include media-breakpoint-down(sm) {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
