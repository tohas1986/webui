<template>
  <b-container fluid>
    <page-title />
    <b-row class="align-items-end">
      <b-col class="d-sm-flex align-items-end">
        <search
          :placeholder="$t('pageSessions.table.searchSessions')"
          data-test-id="sessions-input-searchSessions"
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
        <div class="ml-4-desktop">
          <table-cell-count
            :filtered-items-count="filteredRows"
            :total-number-of-cells="allConnections.length"
          ></table-cell-count>
        </div>
      </b-col>
      <b-col class="btn-secondary-container">
        <b-button variant="secondary" @click="initModalSessionSettings()">
          {{ $t('pageSessions.modal.sessionSettingsTitle') }}
          <icon-add />
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div class="table-container">
          <b-table
            id="table-session-logs"
            ref="table"
            responsive="md"
            selectable
            no-select-on-click
            hover
            show-empty
            sticky-header
            sort-by="sessionID"
            :busy="isBusy"
            :fields="fields"
            :items="allConnections"
            :filter="searchFilter"
            :empty-text="$t('global.table.emptyMessage')"
            :per-page="perPage"
            :current-page="currentPage"
            @filtered="onFiltered"
            @row-selected="onRowSelected($event, allConnections.length)"
          >
            <!-- Checkbox column -->
            <template #head(checkbox)>
              <b-form-checkbox
                v-model="tableHeaderCheckboxModel"
                data-test-id="sessions-checkbox-selectAll"
                :indeterminate="tableHeaderCheckboxIndeterminate"
                @change="onChangeHeaderCheckbox($refs.table)"
              >
                <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
              </b-form-checkbox>
            </template>
            <template #cell(checkbox)="row">
              <b-form-checkbox
                v-model="row.rowSelected"
                :data-test-id="`sessions-checkbox-selectRow-${row.index}`"
                @change="toggleSelectRow($refs.table, row.index)"
              >
                <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
              </b-form-checkbox>
            </template>

            <!-- Actions column -->
            <template #cell(actions)="row">
              <table-row-action
                v-for="(action, index) in row.item.actions"
                :key="index"
                :value="action.value"
                :title="action.title"
                :row-data="row.item"
                :btn-icon-only="false"
                class="span-sessions"
                :data-test-id="`sessions-button-disconnect-${row.index}`"
                @click-table-action="onTableRowAction($event, row.item)"
              ></table-row-action>
            </template>
          </b-table>
        </div>
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          :actions="batchActions"
          @clear-selected="clearSelectedRows($refs.table)"
          @batch-action="onBatchAction"
        >
        </table-toolbar>
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
          aria-controls="table-session-logs"
        />
      </b-col>
    </b-row>

    <modal-session-settings />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import Search from '@/components/Global/Search';
import TableCellCount from '@/components/Global/TableCellCount';
import TableRowAction from '@/components/Global/TableRowAction';
import TableToolbar from '@/components/Global/TableToolbar';
import IconAdd from '@/components/icons/IconAdd';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import ModalSessionSettings from './ModalSessionSettings';
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
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';

export default {
  components: {
    PageTitle,
    Search,
    TableCellCount,
    TableRowAction,
    TableToolbar,
    ModalSessionSettings,
    IconAdd,
  },
  mixins: [
    BVPaginationMixin,
    BVTableSelectableMixin,
    BVToastMixin,
    LoadingBarMixin,
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
          class: 'text-center',
        },
        {
          key: 'sessionID',
          label: this.$t('pageSessions.table.sessionID'),
          class: 'text-center',
        },
        {
          key: 'context',
          label: this.$t('pageSessions.table.context'),
          class: 'text-center',
        },
        {
          key: 'username',
          label: this.$t('pageSessions.table.username'),
          class: 'text-center',
        },
        {
          key: 'ipAddress',
          label: this.$t('pageSessions.table.ipAddress'),
          class: 'text-center',
        },
        {
          key: 'sessionType',
          label: this.$t('pageSessions.table.sessionType'),
          class: 'text-center',
        },
        {
          key: 'actions',
          label: this.$t('global.action.actions'),
          class: 'text-center',
        },
      ],
      batchActions: [
        {
          value: 'disconnect',
          label: this.$t('pageSessions.action.disconnect'),
        },
      ],
      currentPage: currentPage,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      selectedRows: selectedRows,
      searchTotalFilteredRows: 0,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
      searchFilter: searchFilter,
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.allConnections.length;
    },
    allConnections() {
      return this.$store.getters['sessions/allConnections'].map((session) => {
        return {
          ...session,
          actions: [
            {
              value: 'disconnect',
              title: this.$t('pageSessions.action.disconnect'),
            },
          ],
        };
      });
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('sessions/getSessionsData').finally(() => {
      this.endLoader();
      this.isBusy = false;
    });
  },
  methods: {
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    onChangeSearchInput(event) {
      this.searchFilter = event;
    },
    disconnectSessions(uris) {
      this.$store
        .dispatch('sessions/disconnectSessions', uris)
        .then((messages) => {
          messages.forEach(({ type, message }) => {
            if (type === 'success') {
              this.successToast(message);
            } else if (type === 'error') {
              this.errorToast(message);
            }
          });
        });
    },
    onTableRowAction(action, { uri }) {
      if (action === 'disconnect') {
        this.$bvModal
          .msgBoxConfirm(this.$tc('pageSessions.modal.disconnectMessage'), {
            title: this.$tc('pageSessions.modal.disconnectTitle'),
            okTitle: this.$t('pageSessions.action.disconnect'),
            cancelTitle: this.$t('global.action.cancel'),
            size: 'lg',
            centered: true,
          })
          .then((deleteConfirmed) => {
            if (deleteConfirmed) this.disconnectSessions([uri]);
          });
      }
    },
    onBatchAction(action) {
      if (action === 'disconnect') {
        const uris = this.selectedRows.map((row) => row.uri);
        this.$bvModal
          .msgBoxConfirm(
            this.$tc(
              'pageSessions.modal.disconnectMessage',
              this.selectedRows.length,
            ),
            {
              title: this.$tc(
                'pageSessions.modal.disconnectTitle',
                this.selectedRows.length,
              ),
              okTitle: this.$t('pageSessions.action.disconnect'),
              cancelTitle: this.$t('global.action.cancel'),
            },
          )
          .then((deleteConfirmed) => {
            if (deleteConfirmed) {
              this.disconnectSessions(uris);
            }
          });
      }
    },
    initModalSessionSettings() {
      this.$bvModal.show('session-settings');
    },
  },
};
</script>
<style lang="scss" scoped>
.ml-4-desktop {
  margin-left: 1.5rem;
  @include media-breakpoint-down(sm) {
    margin-left: 0;
    margin-bottom: 8px;
  }

  @media (min-width: 456px) {
    margin-left: 1rem;
  }
}

.table-pagination-container {
  @include media-breakpoint-down(md) {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
.btn-secondary {
  margin-bottom: 20px;
  padding: clamp(0.625rem, 0.1131rem + 0.6349vw, 0.875rem)
    clamp(1rem, -0.0238rem + 1.2698vw, 1.5rem);

  @media (max-width: 1100px) {
    font-size: 0.7rem;
    padding: 0.6rem;
  }

  svg {
    margin-left: 1.25rem;
    margin-right: 0;

    @media (max-width: 1110px) {
      margin-left: 1rem;
    }
  }
}

.btn-secondary-container {
  flex-wrap: wrap;
  @include media-breakpoint-down(lg) {
    gap: 0.5rem;
    justify-content: flex-end;
    margin-bottom: 1rem;

    .btn-secondary {
      margin-bottom: 0 !important;
    }
  }

  @include media-breakpoint-down(md) {
    justify-content: flex-end;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
  }

  @include media-breakpoint-down(sm) {
    justify-content: flex-start;
  }
}
</style>
