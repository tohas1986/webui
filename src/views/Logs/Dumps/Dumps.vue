<template>
  <b-container fluid>
    <page-title />
    <b-row class="align-items-start">
      <b-col class="d-sm-flex align-items-end">
        <search
          :placeholder="$t('pageDumps.table.searchDumps')"
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
        <div class="ml-sm-4">
          <table-cell-count
            :filtered-items-count="filteredRows"
            :total-number-of-cells="allDumps.length"
          ></table-cell-count>
        </div>
      </b-col>
      <b-col class="form-group-wrapper">
        <table-date-filter @change="onChangeDateTimeFilter" />
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div class="table-container">
          <b-table
            ref="table"
            responsive="md"
            class="dump-table"
            show-empty
            hover
            no-sort-reset
            sort-desc
            selectable
            sticky-header
            no-select-on-click
            sort-by="dateTime"
            :fields="fields"
            :items="filteredDumps"
            :empty-text="$t('global.table.emptyMessage')"
            :empty-filtered-text="$t('global.table.emptySearchMessage')"
            :filter="searchFilter"
            :busy="isBusy"
            @filtered="onFiltered"
            @row-selected="onRowSelected($event, filteredDumps.length)"
          >
            <!-- Checkbox column -->
            <template #head(checkbox)>
              <b-form-checkbox
                v-model="tableHeaderCheckboxModel"
                :indeterminate="tableHeaderCheckboxIndeterminate"
                @change="onChangeHeaderCheckbox($refs.table)"
              >
                <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
              </b-form-checkbox>
            </template>
            <template #cell(checkbox)="row">
              <b-form-checkbox
                v-model="row.rowSelected"
                @change="toggleSelectRow($refs.table, row.index)"
              >
                <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
              </b-form-checkbox>
            </template>

            <!-- Date and Time column -->
            <template #cell(dateTime)="{ value }">
              <p class="mb-0">
                {{ value | formatDate }} {{ value | formatTime }}
              </p>
              <p class="mb-0">({{ timezone }})</p>
            </template>

            <!-- Size column -->
            <template #cell(size)="{ value }">
              {{ convertBytesToMegabytes(value) }} MB
            </template>

            <!-- Actions column -->
            <template #cell(actions)="row">
              <table-row-action
                v-for="(action, index) in row.item.actions"
                :key="index"
                :value="action.value"
                :title="action.title"
                :download-location="row.item.data"
                :export-name="exportFileName(row)"
                @click-table-action="onTableRowAction($event, row.item)"
              >
                <template #icon>
                  <icon-export v-if="action.value === 'download'" />
                  <icon-trashcan v-if="action.value === 'delete'" />
                </template>
              </table-row-action>
            </template>
          </b-table>
        </div>
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          :actions="batchActions"
          @clear-selected="clearSelectedRows($refs.table)"
          @batch-action="onTableBatchAction"
        />
        <b-row class="justify-content-center">
          <div class="btn-container">
            <b-button variant="link" class="btn-table" @click="initiateDump">
              <icon-replace /> {{ $t('pageDumps.form.initiateDump') }}
            </b-button>
            <b-button
              variant="link"
              class="btn-table"
              :disabled="allDumps.length === 0"
              @click="deleteAllDumps"
            >
              <span class="d-inline-block d-sm-none">
                <icon-trashcan /> {{ $t('global.action.deleteAllMobile') }}
              </span>
              <span class="d-none d-sm-inline-block">
                <icon-trashcan /> {{ $t('global.action.deleteAll') }}
              </span>
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
          :total-rows="getTotalRowCount()"
          aria-controls="table-dump-entries"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import IconTrashcan from '@/components/icons/IconTrashcan';
import IconExport from '@/components/icons/IconExport';
import PageTitle from '@/components/Global/PageTitle';
import Search from '@/components/Global/Search';
import TableCellCount from '@/components/Global/TableCellCount';
import TableDateFilter from '@/components/Global/TableDateFilter';
import TableRowAction from '@/components/Global/TableRowAction';
import TableToolbar from '@/components/Global/TableToolbar';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import BVPaginationMixin, {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import TableFilterMixin from '@/components/Mixins/TableFilterMixin';
import IconReplace from '@carbon/icons-vue/es/renew/20';
import LocalTimezoneLabelMixin from '@/components/Mixins/LocalTimezoneLabelMixin';

export default {
  components: {
    IconTrashcan,
    IconExport,
    PageTitle,
    Search,
    TableCellCount,
    TableDateFilter,
    TableRowAction,
    TableToolbar,
    IconReplace,
  },
  mixins: [
    BVTableSelectableMixin,
    BVToastMixin,
    BVPaginationMixin,
    LoadingBarMixin,
    SearchFilterMixin,
    TableFilterMixin,
    LocalTimezoneLabelMixin,
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
          key: 'id',
          label: this.$t('pageDumps.table.id'),
          sortable: true,
        },
        {
          key: 'dateTime',
          label: this.$t('pageDumps.table.dateAndTime'),
          sortable: true,
        },
        {
          key: 'dumpType',
          label: this.$t('pageDumps.table.dumpType'),
        },
        {
          key: 'size',
          label: this.$t('pageDumps.table.size'),
        },
        {
          key: 'actions',
          sortable: false,
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      batchActions: [
        {
          value: 'delete',
          label: this.$t('global.action.delete'),
        },
      ],
      tableFilters: [
        {
          key: 'dumpType',
          label: this.$t('pageDumps.table.dumpType'),
          values: [
            'BMC Dump Entry',
            'Hostboot Dump Entry',
            'Resource Dump Entry',
            'System Dump Entry',
          ],
        },
      ],
      activeFilters: [],
      currentPage: currentPage,
      filterEndDate: null,
      filterStartDate: null,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      searchFilter,
      searchTotalFilteredRows: 0,
      selectedRows,
      tableHeaderCheckboxIndeterminate,
      tableHeaderCheckboxModel,
    };
  },
  computed: {
    href() {
      return `data:text/json;charset=utf-8,${this.exportAllDumps()}`;
    },
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.filteredDumps.length;
    },
    allDumps() {
      return this.$store.getters['dumps/allDumps'].map((item) => {
        return {
          ...item,
          actions: [
            {
              value: 'download',
              title: this.$t('global.action.download'),
            },
            {
              value: 'delete',
              title: this.$t('global.action.delete'),
            },
          ],
        };
      });
    },
    filteredDumpsByDate() {
      return this.getFilteredTableDataByDate(
        this.allDumps,
        this.filterStartDate,
        this.filterEndDate,
        'dateTime',
      );
    },
    filteredDumps() {
      return this.getFilteredTableData(
        this.filteredDumpsByDate,
        this.activeFilters,
      );
    },
    isUtcDisplay() {
      return this.$store.getters['global/isUtcDisplay'];
    },
    timezone() {
      return this.localOffset(this.isUtcDisplay);
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('dumps/getAllDumps').finally(() => {
      this.endLoader();
      this.isBusy = false;
    });
  },
  methods: {
    convertBytesToMegabytes(bytes) {
      return parseFloat((bytes / 1000000).toFixed(3));
    },
    onFilterChange({ activeFilters }) {
      this.activeFilters = activeFilters;
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    onChangeDateTimeFilter({ fromDate, toDate }) {
      this.filterStartDate = fromDate;
      this.filterEndDate = toDate;
    },
    onTableRowAction(action, dump) {
      if (action === 'delete') {
        this.$bvModal
          .msgBoxConfirm(this.$tc('pageDumps.modal.deleteDumpConfirmation'), {
            title: this.$tc('pageDumps.modal.deleteDump'),
            okTitle: this.$tc('pageDumps.modal.deleteDump'),
            cancelTitle: this.$t('global.action.cancel'),
            autoFocusButton: 'ok',
            size: 'lg',
            centered: true,
          })
          .then((deleteConfrimed) => {
            if (deleteConfrimed) {
              this.$store
                .dispatch('dumps/deleteDumps', [dump])
                .then((messages) => {
                  messages.forEach(({ type, message }) => {
                    if (type === 'success') {
                      this.successToast(message);
                    } else if (type === 'error') {
                      this.errorToast(message);
                    }
                  });
                });
            }
          });
      }
    },
    onTableBatchAction(action) {
      if (action === 'delete') {
        this.$bvModal
          .msgBoxConfirm(
            this.$tc(
              'pageDumps.modal.deleteDumpConfirmation',
              this.selectedRows.length,
            ),
            {
              title: this.$tc(
                'pageDumps.modal.deleteDump',
                this.selectedRows.length,
              ),
              okTitle: this.$tc(
                'pageDumps.modal.deleteDump',
                this.selectedRows.length,
              ),
              cancelTitle: this.$t('global.action.cancel'),
              autoFocusButton: 'ok',
              centered: true,
            },
          )
          .then((deleteConfrimed) => {
            if (deleteConfrimed) {
              if (this.selectedRows.length === this.allDumps.length) {
                this.$store
                  .dispatch('dumps/deleteAllDumps')
                  .then((success) => this.successToast(success))
                  .catch(({ message }) => this.errorToast(message));
              } else {
                this.$store
                  .dispatch('dumps/deleteDumps', this.selectedRows)
                  .then((messages) => {
                    messages.forEach(({ type, message }) => {
                      if (type === 'success') {
                        this.successToast(message);
                      } else if (type === 'error') {
                        this.errorToast(message);
                      }
                    });
                  });
              }
            }
          });
      }
    },
    exportFileName(row) {
      let filename = row.item.dumpType + '_' + row.item.id + '.tar.xz';
      filename = filename.replace(RegExp(' ', 'g'), '_');
      return filename;
    },
    deleteAllDumps() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageDumps.modal.deleteAllMessage'), {
          title: this.$t('pageDumps.modal.deleteAllTitle'),
          okTitle: this.$t('global.action.delete'),
          okVariant: 'danger',
          cancelTitle: this.$t('global.action.cancel'),
          size: 'lg',
          centered: true,
        })
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.$store
              .dispatch('dumps/deleteAllDumps', this.allDumps)
              .then((message) => this.successToast(message))
              .catch(({ message }) => this.errorToast(message));
          }
        });
    },
    initiateDump() {
      this.$store
        .dispatch('dumps/createBmcDump')
        .then(() =>
          this.infoToast(this.$t('pageDumps.toast.successStartBmcDump'), {
            title: this.$t('pageDumps.toast.successStartBmcDumpTitle'),
            timestamp: true,
          }),
        )
        .catch(({ message }) => this.errorToast(message));
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
  @include media-breakpoint-down(md) {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
