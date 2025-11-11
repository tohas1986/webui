<template>
  <page-section :section-title="$t('pageInventory.processors')">
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
          :total-number-of-cells="processors.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <div class="table-container">
      <b-table
        no-sort-reset
        hover
        responsive
        show-empty
        :items="processors"
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
            data-test-id="hardwareStatus-button-expandProcessors"
            :title="expandRowLabel"
            class="btn-icon-only"
            @click="toggleRowDetails(row)"
          >
            <icon-chevron />
            <span class="sr-only">{{ expandRowLabel }}</span>
          </b-button>
        </template>
        <!-- Health -->
        <template #cell(health)="{ value }">
          <status-color :status="statusIcon(value)" />
          <span class="text-status"> {{ value }}</span>
        </template>
        <!-- StatusState -->
        <template #cell(statusState)="{ value }">
          <status-color :status="statusStateIcon(value)" />
          <span class="text-status"> {{ value }}</span>
        </template>

        <template #cell(minSpeedMHz)="{ item }">
          {{ extractCpuFrequency(item.model) }} {{ $t('unit.MHz') }}
        </template>

        <template #cell(maxSpeedMHz)="{ value }">
          {{ formatCpu(value) }} {{ $t('unit.MHz') }}
        </template>

        <template #row-details="{ item }">
          <b-container fluid>
            <b-row>
              <b-col class="mt-2" sm="6" xl="6">
                <dl>
                  <!-- Name -->
                  <dt>{{ $t('pageInventory.table.name') }}:</dt>
                  <dd>{{ dataFormatter(item.name) }}</dd>
                  <!-- Part Number -->
                  <dt>{{ $t('pageInventory.table.partNumber') }}:</dt>
                  <dd>{{ dataFormatter(item.partNumber) }}</dd>
                  <!-- Serial Number -->
                  <dt>{{ $t('pageInventory.table.serialNumber') }}:</dt>
                  <dd>{{ dataFormatter(item.serialNumber) }}</dd>
                  <!-- Spare Part Number -->
                  <dt>{{ $t('pageInventory.table.sparePartNumber') }}:</dt>
                  <dd>{{ dataFormatter(item.sparePartNumber) }}</dd>
                  <!-- Model -->
                  <dt>{{ $t('pageInventory.table.model') }}:</dt>
                  <dd>{{ dataFormatter(item.model) }}</dd>
                  <!-- Asset Tag -->
                  <dt>{{ $t('pageInventory.table.assetTag') }}:</dt>
                  <dd>{{ dataFormatter(item.assetTag) }}</dd>
                </dl>
              </b-col>
              <b-col class="mt-2" sm="6" xl="6">
                <dl>
                  <!-- Status state -->
                  <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                  <dd>{{ dataFormatter(item.statusState) }}</dd>
                  <!-- Health Rollup -->
                  <dt>{{ $t('pageInventory.table.healthRollup') }}:</dt>
                  <dd>{{ dataFormatter(item.health) }}</dd>
                </dl>
              </b-col>
            </b-row>
            <div class="section-divider mb-3 mt-3"></div>
            <b-row>
              <b-col class="mt-1" sm="6" xl="6">
                <dl>
                  <!-- Manufacturer -->
                  <dt>{{ $t('pageInventory.table.manufacturer') }}:</dt>
                  <dd>{{ dataFormatter(item.manufacturer) }}</dd>
                  <!-- Processor Type -->
                  <dt>{{ $t('pageInventory.table.processorType') }}:</dt>
                  <dd>{{ dataFormatter(item.processorType) }}</dd>
                  <!-- Processor Architecture -->
                  <dt>
                    {{ $t('pageInventory.table.processorArchitecture') }}:
                  </dt>
                  <dd>{{ dataFormatter(item.processorArchitecture) }}</dd>
                  <!-- Instruction Set -->
                  <dt>{{ $t('pageInventory.table.instructionSet') }}:</dt>
                  <dd>{{ dataFormatter(item.instructionSet) }}</dd>
                  <!-- Version -->
                  <dt>{{ $t('pageInventory.table.version') }}:</dt>
                  <dd>{{ dataFormatter(item.version) }}</dd>
                </dl>
              </b-col>
              <b-col class="mt-1" sm="6" xl="6">
                <dl>
                  <!-- Min Speed MHz -->
                  <dt>{{ $t('pageInventory.table.minSpeedMHz') }}:</dt>
                  <dd>
                    {{ extractCpuFrequency(item.model) }}
                    {{ $t('unit.MHz') }}
                  </dd>
                  <!-- Max Speed MHz -->
                  <dt>{{ $t('pageInventory.table.maxSpeedMHz') }}:</dt>
                  <dd>
                    {{ formatCpu(item.maxSpeedMHz) }}
                    {{ $t('unit.MHz') }}
                  </dd>
                  <!-- Total Cores -->
                  <dt>{{ $t('pageInventory.table.totalCores') }}:</dt>
                  <dd>{{ dataFormatter(item.totalCores) }}</dd>
                  <!-- Total Threads -->
                  <dt>{{ $t('pageInventory.table.totalThreads') }}:</dt>
                  <dd>{{ dataFormatter(item.totalThreads) }}</dd>
                  <!-- PPIN-->
                  <dt>{{ $t('pageInventory.table.ppin') }}:</dt>
                  <dd>{{ dataFormatter(item.ppin) }}</dd>
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
import StatusColor from '@/components/Global/StatusColor';
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
  components: { IconChevron, PageSection, StatusColor, Search, TableCellCount },
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
          tdClass: 'text-nowrap',
        },
        {
          key: 'model',
          label: this.$t('pageInventory.table.model'),
          formatter: this.dataFormatter,
          class: 'text-nowrap',
        },
        {
          key: 'minSpeedMHz',
          label: this.$t('pageInventory.table.minSpeedMHz'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
          thClass: 'text-nowrap',
        },
        {
          key: 'maxSpeedMHz',
          label: this.$t('pageInventory.table.maxSpeedMHz'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'statusState',
          label: this.$t('pageInventory.table.presenceState'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: this.$t('pageInventory.table.locationNumber'),
          formatter: this.dataFormatter,
          sortable: true,
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
        : this.processors.length;
    },
    processors() {
      return this.$store.getters['processors/processors'];
    },
  },
  created() {
    this.$store.dispatch('processors/getProcessorsInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-processors-complete');
      this.isBusy = false;
    });
  },
  methods: {
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    statusStateIcon(status) {
      switch (status) {
        case 'Enabled':
          return 'success';
        case 'Absent':
          return 'warning';
        default:
          return '';
      }
    },
  },
};
</script>
