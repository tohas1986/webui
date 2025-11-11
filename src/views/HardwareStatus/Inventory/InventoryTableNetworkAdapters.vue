<template>
  <page-section :section-title="$t('pageInventory.networkAdapters')">
    <!-- Search -->
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
          :total-number-of-cells="networkAdapters.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <div class="table-container">
      <b-table
        no-sort-reset
        hover
        responsive
        show-empty
        :items="networkAdapters"
        :fields="fields"
        :sort-desc="true"
        :filter="searchFilter"
        :empty-text="$t('global.table.emptyMessage')"
        :empty-filtered-text="$t('global.table.emptySearchMessage')"
        :busy="isBusy"
        @filtered="onFiltered"
      >
        <!-- Expand button -->
        <template #cell(expandRow)="row">
          <b-button
            variant="link"
            data-test-id="hardwareStatus-button-expandNetworkAdapters"
            :title="expandRowLabel"
            class="btn-icon-only"
            @click="toggleRowDetails(row)"
          >
            <icon-chevron />
            <span class="sr-only">{{ expandRowLabel }}</span>
          </b-button>
        </template>

        <template #row-details="{ item }">
          <b-container fluid>
            <b-row>
              <b-col class="mt-2" sm="6" xl="6">
                <dl>
                  <!-- MAC Addresses -->
                  <div v-for="(mac, index) in item.macAddresses" :key="index">
                    <dt>
                      {{ $tc('pageInventory.table.macForPort', index) }}
                      {{ $tc('pageInventory.table.macForAddress') }} :
                    </dt>
                    <dd>{{ dataFormatter(mac) }}</dd>
                  </div>
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
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import Search from '@/components/Global/Search';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';

export default {
  components: { IconChevron, PageSection, Search, TableCellCount },
  mixins: [
    BVToastMixin,
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
          key: 'manufacturer',
          label: this.$t('pageInventory.table.manufacturer'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'model',
          label: this.$t('pageInventory.table.model'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'firmwarePackageVersion',
          label: this.$t('pageInventory.table.firmwareVersion'),
          formatter: this.dataFormatter,
          sortable: true,
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
        : this.networkAdapters.length;
    },
    networkAdapters() {
      return this.$store.getters['network/adapters'];
    },
  },
  created() {
    this.$store.dispatch('network/getNetworkAdaptersInfo').finally(() => {
      this.$root.$emit('hardware-status-network-adapters-complete');
      this.isBusy = false;
    });
  },
  methods: {
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
  },
};
</script>
