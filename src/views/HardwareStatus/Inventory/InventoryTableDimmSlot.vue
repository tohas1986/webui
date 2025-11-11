<template>
  <page-section :section-title="$t('pageInventory.dimmSlot')">
    <b-row class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
      </b-col>
      <b-col sm="auto">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="dimms.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <div class="table-container">
      <b-table
        no-sort-reset
        hover
        sort-by="health"
        responsive
        show-empty
        :items="dimms"
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
            data-test-id="hardwareStatus-button-expandDimms"
            :title="expandRowLabel"
            class="btn-icon-only"
            @click="toggleRowDetails(row)"
          >
            <icon-chevron />
            <span class="sr-only">{{ expandRowLabel }}</span>
          </b-button>
        </template>

        <template #cell(capacityMiB)="{ value }">
          {{ mbToGb(value) }}
        </template>

        <!-- Health -->
        <template #cell(health)="{ value }">
          <status-color :status="statusIcon(value)" />
          <span class="text-status">{{ value }}</span>
        </template>

        <!-- StatusState -->
        <template #cell(statusState)="{ value }">
          <status-color :status="statusStateIcon(value)" />
          <span class="text-status">{{ value }}</span>
        </template>
        <template #row-details="{ item }">
          <b-container fluid>
            <b-row>
              <b-col sm="6" xl="6">
                <dl>
                  <!-- Manufacturer -->
                  <dt>{{ $t('pageInventory.table.manufacturer') }}:</dt>
                  <dd>{{ dataFormatter(item.manufacturer) }}</dd>
                </dl>
                <dl>
                  <!-- Part Number -->
                  <dt>{{ $t('pageInventory.table.partNumber') }}:</dt>
                  <dd>{{ dataFormatter(item.partNumber) }}</dd>
                </dl>
                <dl>
                  <!-- Serial Number -->
                  <dt>{{ $t('pageInventory.table.serialNumber') }}:</dt>
                  <dd>{{ dataFormatter(item.serialNumber) }}</dd>
                </dl>
                <dl>
                  <!-- Spare Part Number -->
                  <dt>{{ $t('pageInventory.table.sparePartNumber') }}:</dt>
                  <dd>{{ dataFormatter(item.sparePartNumber) }}</dd>
                </dl>
                <dl>
                  <!-- Model -->
                  <dt>{{ $t('pageInventory.table.model') }}:</dt>
                  <dd>{{ dataFormatter(item.model) }}</dd>
                </dl>
              </b-col>
              <b-col sm="6" xl="6">
                <dl>
                  <!-- Capacity MiB -->
                  <dt>{{ $t('pageInventory.table.capacityMiB') }}:</dt>
                  <dd>
                    {{ mbToGb(item.capacityMiB) }}
                  </dd>
                </dl>
                <dl>
                  <!-- Rank Count -->
                  <dt>{{ $t('pageInventory.table.rankCount') }}:</dt>
                  <dd>{{ dataFormatter(item.rankCount) }}</dd>
                </dl>
                <dl>
                  <!-- Status-->
                  <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                  <dd>{{ dataFormatter(item.statusState) }}</dd>
                </dl>
                <dl>
                  <!-- Enabled-->
                  <dt>{{ $t('pageInventory.table.enabled') }}:</dt>
                  <dd>{{ dataFormatter(item.enabled) }}</dd>
                </dl>
              </b-col>
            </b-row>
            <div class="section-divider mb-3 mt-3"></div>
            <b-row>
              <b-col sm="6" xl="6">
                <dl>
                  <!-- Description -->
                  <dt>{{ $t('pageInventory.table.description') }}:</dt>
                  <dd>{{ dataFormatter(item.description) }}</dd>
                </dl>
                <dl>
                  <!-- Memory Type -->
                  <dt>{{ $t('pageInventory.table.memoryType') }}:</dt>
                  <dd>{{ dataFormatter(item.memoryType) }}</dd>
                </dl>
                <dl>
                  <!-- Base Module Type -->
                  <dt>{{ $t('pageInventory.table.baseModuleType') }}:</dt>
                  <dd>{{ dataFormatter(item.baseModuleType) }}</dd>
                </dl>
              </b-col>
              <b-col sm="6" xl="6">
                <dl>
                  <!-- Bus Width Bits -->
                  <dt>{{ $t('pageInventory.table.busWidthBits') }}:</dt>
                  <dd>
                    {{ dataFormatter(item.busWidthBits) }}
                    {{ $t('unit.bit') }}
                  </dd>
                </dl>
                <dl>
                  <!-- Data Width Bits -->
                  <dt>{{ $t('pageInventory.table.dataWidthBits') }}:</dt>
                  <dd>
                    {{ dataFormatter(item.dataWidthBits) }}
                    {{ $t('unit.bit') }}
                  </dd>
                </dl>
                <dl>
                  <!-- Operating Speed Mhz -->
                  <dt>{{ $t('pageInventory.table.operatingSpeedMhz') }}:</dt>
                  <dd>
                    {{ dataFormatter(item.operatingSpeedMhz) }}
                    {{ $t('unit.MHz') }}
                  </dd>
                </dl>
                <dl>
                  <!-- Max Speed -->
                  <dt>{{ $t('pageInventory.table.maxSpeedMHz') }}:</dt>
                  <dd v-if="item.maxSpeed">
                    {{ dataFormatter(item.maxSpeed) }}
                    {{ $t('unit.MHz') }}
                  </dd>
                  <dd v-else-if="item.extSpeed">
                    {{ dataFormatter(item.extSpeed) }}
                    {{ $t('unit.MHz') }}
                  </dd>
                  <dd v-else>
                    {{ '3200 ' + $t('unit.MHz') }}
                  </dd>
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
          key: 'partNumber',
          label: this.$t('pageInventory.table.partNumber'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'serialNumber',
          label: this.$t('pageInventory.table.serialNumber'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'capacityMiB',
          label: this.$t('pageInventory.table.capacityMiB'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'operatingSpeedMhz',
          label: this.$t('pageInventory.table.speed'),
          formatter: this.dataFormatter,
        },
        {
          key: 'statusState',
          label: this.$t('pageInventory.table.presenceState'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: this.$t('pageInventory.table.locationNumber'),
          formatter: (value) => this.formatDimmSlot(value),
          tdClass: 'text-nowrap',
        },
        {
          key: 'health',
          label: this.$t('pageInventory.table.health'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
        },
      ],
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      expandRowLabel: expandRowLabel,
      currentFilteredDimms: [],
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.dimms.length;
    },
    filteredEnabledRows() {
      const filteredItems = this.searchFilter
        ? this.currentFilteredDimms
        : this.dimms;
      return filteredItems.filter((dimm) => dimm.statusState === 'Enabled')
        .length;
    },
    dimms() {
      return this.$store.getters['memory/dimms'].filter(
        (dimm) => dimm.statusState === 'Enabled',
      );
    },
  },
  created() {
    this.$store.dispatch('memory/getDimms').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-dimm-slot-complete');
      this.isBusy = false;
    });
  },
  methods: {
    sortCompare(a, b, key) {
      if (key === 'health') {
        return this.sortStatus(a, b, key);
      } else if (key === 'statusState') {
        return this.sortStatusState(a, b, key);
      }
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
      this.currentFilteredDimms = filteredItems;
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
    sortStatusState(a, b, key) {
      const statusState = ['Enabled', 'Absent'];
      return statusState.indexOf(a[key]) - statusState.indexOf(b[key]);
    },
    formatDimmSlot(value) {
      if (!value) return value;
      const formattedValue = this.dataFormatter(value);
      return formattedValue.replace(
        /(DIMM_)([A-Z])(\d+)/g,
        (match, prefix, letter, number) =>
          `${prefix}${letter}${Number(number) - 1}`,
      );
    },
  },
};
</script>
