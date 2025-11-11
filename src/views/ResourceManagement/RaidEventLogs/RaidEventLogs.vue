<template>
  <b-container fluid>
    <page-title />
    <b-row class="align-items-start">
      <b-col class="d-sm-flex align-items-end">
        <search
          :placeholder="$t('pageEventLogs.table.searchLogs')"
          data-test-id="eventLogs-input-searchLogs"
          @change-search="onChangeSearchInput"
        />
        <div class="ml-sm-4">
          <table-cell-count
            :filtered-items-count="filteredRows"
            :total-number-of-cells="allLogs.length"
          ></table-cell-count>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div class="table-container">
          <b-table
            id="table-event-logs"
            ref="table"
            class="event-table"
            responsive="md"
            selectable
            no-select-on-click
            hover
            no-sort-reset
            sort-desc
            sticky-header
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
          >
            <!-- Checkbox column -->
            <template #head(checkbox)>
              <b-form-checkbox
                v-model="tableHeaderCheckboxModel"
                data-test-id="eventLogs-checkbox-selectAll"
                :indeterminate="tableHeaderCheckboxIndeterminate"
                @change="onChangeHeaderCheckbox($refs.table)"
              >
                <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
              </b-form-checkbox>
            </template>
            <template #cell(controller)="row">
              {{ row.item.id }} ({{ row.item.model }})
            </template>
          </b-table>
        </div>

        <b-row class="justify-content-center">
          <div class="btn-container">
            <table-filter
              :filters="tableFilters"
              @filter-change="onFilterChange"
            />
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
          </div>
        </b-row>
      </b-col>
    </b-row>

    <!-- Table pagination -->
    <b-row class="table-pagination-container">
      <b-col sm="4">
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
      <b-col sm="4" class="event-support">
        <b-link class="card-link" @click.prevent="initSupportModal()"
          >{{ $t('pageEventLogs.supportLink') }}
        </b-link>
      </b-col>
      <b-col sm="4">
        <b-pagination
          v-model="currentPage"
          first-number
          last-number
          :per-page="perPage"
          :total-rows="getTotalRowCount(filteredRows)"
          aria-controls="table-event-logs"
        />
      </b-col>
    </b-row>

    <modal-support />
  </b-container>
</template>

<script>
import IconTrashcan from '@/components/icons/IconTrashcan';
import PageTitle from '@/components/Global/PageTitle';
import ModalSupport from '@/views/Logs/EventLogs/ModalSupport';
import Search from '@/components/Global/Search';
import TableCellCount from '@/components/Global/TableCellCount';
import TableFilter from '@/components/Global/TableFilter';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import TableFilterMixin from '@/components/Mixins/TableFilterMixin';
import BVPaginationMixin, {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import TableRowExpandMixin from '@/components/Mixins/TableRowExpandMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import LocalTimezoneLabelMixin from '@/components/Mixins/LocalTimezoneLabelMixin';

export default {
  components: {
    IconTrashcan,
    PageTitle,
    Search,
    TableCellCount,
    TableFilter,
    ModalSupport,
  },
  mixins: [
    BVPaginationMixin,
    BVToastMixin,
    LoadingBarMixin,
    TableFilterMixin,
    DataFormatterMixin,
    TableSortMixin,
    TableRowExpandMixin,
    SearchFilterMixin,
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
          key: 'controller',
          label: this.$t('pageRaidEventLogs.table.controller'),
          sortable: false,
        },
        {
          key: 'seqNum',
          label: this.$t('pageRaidEventLogs.table.recordId'),
          sortable: true,
          thClass: 'text-nowrap',
        },
        {
          key: 'timestamp',
          label: this.$t('pageRaidEventLogs.table.timestamp'),
          formatter: (value) => this.formatTimestamp(value),
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'eventType',
          label: this.$t('pageRaidEventLogs.table.eventType'),
          sortable: true,
        },
        {
          key: 'verbosity',
          label: this.$t('pageRaidEventLogs.table.eventVerbosity'),
          sortable: true,
          thClass: 'text-nowrap',
        },
        {
          key: 'description',
          label: this.$t('pageRaidEventLogs.table.description'),
          sortable: false,
          tdClass: 'text-break',
        },
      ],
      tableFilters: [
        {
          key: 'eventType',
          label: this.$t('pageRaidEventLogs.table.eventType'),
          values: [
            'Physical Drive Events',
            'Enclosure Events',
            'BBU Events',
            'SAS Events',
            'Controller Events',
            'Configuration Events',
            'Cluster Events',
          ],
        },
        {
          key: 'verbosity',
          label: this.$t('pageRaidEventLogs.table.eventVerbosity'),
          values: [
            'DEBUG',
            'PROGRESS',
            'INFO',
            'WARNING',
            'CRITICAL',
            'FATAL',
            'DEAD',
          ],
        },
      ],
      activeFilters: [],
      currentPage: currentPage,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      allLogs: [],
    };
  },
  computed: {
    controllerId() {
      return this.$route.params.controllerId;
    },
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.filteredLogs.length;
    },
    filteredLogs() {
      return this.getFilteredTableData(this.allLogs, this.activeFilters);
    },
    isUtcDisplay() {
      return this.$store.getters['global/isUtcDisplay'];
    },
    timezone() {
      return this.localOffset(this.isUtcDisplay);
    },
  },
  async created() {
    this.startLoader();
    await this.$store.dispatch('raid/getData');
    this.fetchLogs();
    this.endLoader();
    this.isBusy = false;
  },
  methods: {
    async fetchLogs() {
      this.isBusy = true;
      const { model, name } = await this.$store.dispatch(
        'raid/getRaidInformation',
        this.controllerId,
      );
      this.allLogs = await this.$store.dispatch('raid/getRaidEventLogs', {
        controllerId: this.controllerId,
        model,
        name,
      });
      this.isBusy = false;
    },
    deleteAllLogs() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageEventLogs.modal.deleteAllMessage'), {
          title: this.$t('pageEventLogs.modal.deleteAllTitle'),
          okTitle: this.$t('global.action.delete'),
          okVariant: 'danger',
          cancelTitle: this.$t('global.action.cancel'),
          size: 'lg',
          centered: true,
        })
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.$store
              .dispatch('raid/clearRaidEventLogs', this.controllerId)
              .then((message) => this.successToast(message))
              .catch(({ message }) => this.errorToast(message));
          }
        });
    },
    onFilterChange({ activeFilters }) {
      this.activeFilters = activeFilters;
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    initSupportModal() {
      this.$bvModal.show('modal-support');
    },
    parseTimestamp(ts) {
      const highBits = (ts >> 24) & 0xff;
      const lowBits = ts & 0xffffff;

      if (highBits === 0xff) {
        return {
          type: 'uptime',
          value: lowBits,
        };
      } else {
        return {
          type: 'absolute',
          value: ts,
        };
      }
    },
    formatTimestamp(ts) {
      const parsed = this.parseTimestamp(ts);
      if (parsed.type === 'uptime') {
        const hours = Math.floor(parsed.value / 3600);
        const minutes = Math.floor((parsed.value % 3600) / 60);
        const seconds = parsed.value % 60;
        return this.$t('pageRaidEventLogs.table.uptimeFormat', {
          hours,
          minutes,
          seconds,
        });
      } else {
        const baseDate = new Date(Date.UTC(2000, 0, 1, 0, 0, 0));
        const date = new Date(baseDate.getTime() + parsed.value * 1000);
        return date.toLocaleString();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.event-support {
  align-content: flex-end;
  text-align: center;
}

.btn-secondary {
  padding: clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem);
}

.table-pagination-container {
  @include media-breakpoint-down(md) {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
