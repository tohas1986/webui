<template>
  <page-section :section-title="$t('pageInventory.fans')">
    <b-row class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
      </b-col>
      <b-col sm="6" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="fans.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <div class="table-container">
      <b-table
        no-sort-reset
        hover
        responsive
        sort-by="health"
        show-empty
        :items="fans"
        :fields="fields"
        :sort-desc="true"
        :sort-compare="sortCompare"
        :filter="searchFilter"
        :empty-text="$t('global.table.emptyMessage')"
        :empty-filtered-text="$t('global.table.emptySearchMessage')"
        :busy="isBusy"
        @filtered="onFiltered"
      >
        <!-- Expand chevron icon -->
        <template #cell(expandRow)="row">
          <b-button
            variant="link"
            data-test-id="hardwareStatus-button-expandFans"
            :title="expandRowLabel"
            class="btn-icon-only"
            @click="toggleRowDetails(row)"
          >
            <icon-chevron />
            <span class="sr-only">{{ expandRowLabel }}</span>
          </b-button>
        </template>

        <template #cell(speed)="{ value }">
          {{ value }} {{ $t('unit.RPM') }}
        </template>

        <!-- Health -->
        <template #cell(health)="{ value }">
          <status-color :status="statusIcon(value)" />
          <span class="text-status">{{ value }}</span>
        </template>

        <template #row-details="{ item }">
          <b-container fluid>
            <b-row>
              <b-col sm="6" xl="4">
                <dl>
                  <!-- ID -->
                  <dt>{{ $t('pageInventory.table.id') }}:</dt>
                  <dd>{{ dataFormatter(item.id) }}</dd>
                </dl>
                <dl>
                  <!-- Fan speed -->
                  <dt>{{ $t('pageInventory.table.fanSpeed') }}:</dt>
                  <dd>
                    {{ dataFormatter(item.speed) }}
                    {{ $t('unit.RPM') }}
                  </dd>
                </dl>
              </b-col>
              <b-col sm="6" xl="4">
                <dl>
                  <!-- Status state -->
                  <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                  <dd>{{ dataFormatter(item.statusState) }}</dd>
                </dl>
                <dl>
                  <!-- Health Rollup state -->
                  <dt>{{ $t('pageInventory.table.healthRollup') }}:</dt>
                  <dd>{{ dataFormatter(item.health) }}</dd>
                </dl>
              </b-col>
            </b-row>
          </b-container>
        </template>
      </b-table>
    </div>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';
import TableCellCount from '@/components/Global/TableCellCount';

import StatusColor from '@/components/Global/StatusColor';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import Search from '@/components/Global/Search';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';

export default {
  components: { IconChevron, PageSection, StatusColor, Search, TableCellCount },
  mixins: [
    TableRowExpandMixin,
    DataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
  ],
  data() {
    return {
      isBusy: true,
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
          sortable: false,
        },
        {
          key: 'id',
          label: this.$t('pageInventory.table.id'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'speed',
          label: this.$t('pageInventory.table.speed'),
          formatter: this.dataFormatter,
        },
        {
          key: 'health',
          label: this.$t('pageInventory.table.health'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
      ],
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.fans.length;
    },
    fans() {
      return this.$store.getters['fan/fans'];
    },
  },
  created() {
    this.$store.dispatch('fan/getFanInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-fans-complete');
      this.isBusy = false;
    });
  },
  methods: {
    sortCompare(a, b, key) {
      if (key === 'health') {
        return this.sortStatus(a, b, key);
      }
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
  },
};
</script>
