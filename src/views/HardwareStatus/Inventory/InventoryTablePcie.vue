<template>
  <page-section :section-title="$t('pageInventory.pcie')">
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
          :total-number-of-cells="pcies.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <div class="table-container">
      <b-table
        no-sort-reset
        hover
        responsive
        show-empty
        :items="pcies"
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
            data-test-id="hardwareStatus-button-expandPcies"
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
          <status-icon :status="statusIcon(value)" />
          {{ value }}
        </template>

        <!-- Toggle identify LED -->
        <template #cell(identifyLed)="row">
          <b-form-checkbox
            v-if="hasIdentifyLed(row.item.identifyLed)"
            v-model="row.item.identifyLed"
            name="switch"
            switch
            @change="toggleIdentifyLedValue(row.item)"
          >
            <span v-if="row.item.identifyLed">
              {{ $t('global.status.on') }}
            </span>
            <span v-else> {{ $t('global.status.off') }} </span>
          </b-form-checkbox>
          <div v-else>--</div>
        </template>

        <!-- Link width -->
        <template #cell(linkWidth)="{ value }">
          {{ value !== '--' ? `x${value}` : `${value}` }}
        </template>

        <template #row-details="{ item }">
          <b-container fluid>
            <b-row>
              <b-col class="mt-2" sm="6" xl="6">
                <dl>
                  <!-- id -->
                  <dt>{{ $t('pageInventory.table.id') }}:</dt>
                  <dd>{{ dataFormatter(item.id) }}</dd>
                  <!-- Model -->
                  <dt>{{ $t('pageInventory.table.model') }}:</dt>
                  <dd>{{ dataFormatter(item.model) }}</dd>
                  <!-- Manufacturer -->
                  <dt>{{ $t('pageInventory.table.manufacturer') }}:</dt>
                  <dd>{{ dataFormatter(item.manufacturer) }}</dd>
                  <!-- Serial Number -->
                  <dt>{{ $t('pageInventory.table.serialNumber') }}:</dt>
                  <dd>{{ dataFormatter(item.serialNumber) }}</dd>
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
import StatusIcon from '@/components/Global/StatusIcon';
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
  components: { IconChevron, PageSection, StatusIcon, Search, TableCellCount },
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
          key: 'deviceType',
          label: this.$t('pageInventory.table.type'),
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
          key: 'linkWidth',
          label: this.$t('pageInventory.table.linkWidth'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'linkSpeed',
          label: this.$t('pageInventory.table.linkSpeed'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'location',
          label: this.$t('pageInventory.table.location'),
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
        : this.pcies.length;
    },
    pcies() {
      return this.$store.getters['pcies/pcies'];
    },
  },
  created() {
    this.$store.dispatch('pcies/getPciesInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-pcies-complete');
      this.isBusy = false;
    });
  },
  methods: {
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    toggleIdentifyLedValue(row) {
      this.$store
        .dispatch('pcies/updateIdentifyLedValue', {
          uri: row.uri,
          identifyLed: row.identifyLed,
        })
        .catch(({ message }) => this.errorToast(message));
    },
    // TO DO: remove hasIdentifyLed when the following is merged:
    // https://gerrit.openbmc-project.xyz/c/openbmc/bmcweb/+/37045
    hasIdentifyLed(identifyLed) {
      return typeof identifyLed === 'boolean';
    },
  },
};
</script>
