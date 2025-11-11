<template>
  <b-container fluid>
    <page-title />

    <!-- Service indicators -->
    <service-indicator />

    <!-- Quicklinks section -->
    <page-section>
      <div class="section-container">
        <b-row>
          <b-col sm="12" md="4" class="links-text">
            <h3>{{ $t('pageInventory.quicklinkTitle') }}</h3>
          </b-col>
          <b-col sm="12" md="8">
            <b-row>
              <b-col v-for="column in quicklinkColumns" :key="column.id" sm="4">
                <div v-for="item in column" :key="item.id">
                  <b-link
                    class="links-color"
                    :href="item.href"
                    :data-ref="item.dataRef"
                    @click.prevent="scrollToOffset"
                  >
                    {{ item.linkText }} <jump-link />
                  </b-link>
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </div>
    </page-section>

    <!-- System table -->
    <table-system ref="system" />

    <!-- BMC manager table -->
    <table-bmc-manager ref="bmc" />

    <!-- Chassis table -->
    <table-chassis ref="chassis" />

    <!-- DIMM slot table -->
    <table-dimm-slot ref="dimms" />

    <!-- Fans table -->
    <table-fans ref="fans" />

    <!-- Power supplies table -->
    <table-power-supplies ref="powerSupply" />

    <!-- Processors table -->
    <table-processors ref="processors" />

    <!-- Processors table -->
    <table-pcie ref="pcie" />

    <!-- Processors table -->
    <table-network-adapters ref="networkAdapters" />

    <!-- Storage table -->
    <table-storage ref="storage" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import ServiceIndicator from './InventoryServiceIndicator';
import TableSystem from './InventoryTableSystem';
import TablePowerSupplies from './InventoryTablePowerSupplies';
import TableDimmSlot from './InventoryTableDimmSlot';
import TableFans from './InventoryTableFans';
import TableBmcManager from './InventoryTableBmcManager';
import TableChassis from './InventoryTableChassis';
import TableProcessors from './InventoryTableProcessors';
import TablePcie from './InventoryTablePcie';
import TableNetworkAdapters from './InventoryTableNetworkAdapters';
import TableStorage from './InventoryTableStorage';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import PageSection from '@/components/Global/PageSection';
import JumpLink16 from '@carbon/icons-vue/es/jump-link/16';
import JumpLinkMixin from '@/components/Mixins/JumpLinkMixin';
import { chunk } from 'lodash';

export default {
  components: {
    PageTitle,
    ServiceIndicator,
    TableDimmSlot,
    TablePowerSupplies,
    TableSystem,
    TableFans,
    TableBmcManager,
    TableChassis,
    TableProcessors,
    TablePcie,
    TableStorage,
    PageSection,
    JumpLink: JumpLink16,
    TableNetworkAdapters,
  },
  mixins: [LoadingBarMixin, JumpLinkMixin],
  beforeRouteLeave(to, from, next) {
    // Hide loader if user navigates away from page
    // before requests complete
    this.hideLoader();
    next();
  },
  data() {
    return {
      links: [
        {
          id: 'system',
          dataRef: 'system',
          href: '#system',
          linkText: this.$t('pageInventory.system'),
        },
        {
          id: 'bmc',
          dataRef: 'bmc',
          href: '#bmc',
          linkText: this.$t('pageInventory.bmcManager'),
        },
        {
          id: 'chassis',
          dataRef: 'chassis',
          href: '#chassis',
          linkText: this.$t('pageInventory.chassis'),
        },
        {
          id: 'fans',
          dataRef: 'fans',
          href: '#fans',
          linkText: this.$t('pageInventory.fans'),
        },
        {
          id: 'powerSupply',
          dataRef: 'powerSupply',
          href: '#powerSupply',
          linkText: this.$t('pageInventory.powerSupplies'),
        },
        {
          id: 'processors',
          dataRef: 'processors',
          href: '#processors',
          linkText: this.$t('pageInventory.processors'),
        },
        {
          id: 'pcie',
          dataRef: 'pcie',
          href: '#pcie',
          linkText: this.$t('pageInventory.pcie'),
        },
        {
          id: 'networkAdapters',
          dataRef: 'networkAdapters',
          href: '#networkAdapters',
          linkText: this.$t('pageInventory.networkAdapters'),
        },
        {
          id: 'storage',
          dataRef: 'storage',
          href: '#storage',
          linkText: this.$t('pageInventory.storage'),
        },
        {
          id: 'dimms',
          dataRef: 'dimms',
          href: '#dimms',
          linkText: this.$t('pageInventory.dimmSlot'),
        },
      ],
    };
  },
  computed: {
    quicklinkColumns() {
      // Chunk links array to 3 array's to display 3 items per column
      return chunk(this.links, 3);
    },
  },
  created() {
    this.startLoader();
    const bmcManagerTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-bmc-manager-complete', () => resolve());
    });
    const chassisTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-chassis-complete', () => resolve());
    });
    const dimmSlotTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-dimm-slot-complete', () => resolve());
    });
    const fansTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-fans-complete', () => resolve());
    });
    const powerSuppliesTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-power-supplies-complete', () =>
        resolve(),
      );
    });
    const processorsTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-processors-complete', () => resolve());
    });
    const pciesTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-pcies-complete', () => resolve());
    });

    const serviceIndicatorPromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-service-complete', () => resolve());
    });
    const systemTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-system-complete', () => resolve());
    });
    const assemblyTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-assembly-complete', () => resolve());
    });
    const networkAdaptersTablePromise = new Promise((resolve) => {
      this.$root.$on('hardware-status-network-adapters-complete', () =>
        resolve(),
      );
    });
    // Combine all child component Promises to indicate
    // when page data load complete
    Promise.all([
      bmcManagerTablePromise,
      chassisTablePromise,
      dimmSlotTablePromise,
      fansTablePromise,
      powerSuppliesTablePromise,
      processorsTablePromise,
      pciesTablePromise,
      serviceIndicatorPromise,
      systemTablePromise,
      networkAdaptersTablePromise,
      assemblyTablePromise,
    ]).finally(() => this.endLoader());
  },
};
</script>

<style lang="scss" scoped>
.links-text {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    display: block;
    right: 15%;
    top: 0;
    width: 1px;
    height: 100%;
    background-color: $gray-border;

    @include media-breakpoint-down(lg) {
      right: 5%;
    }

    @include media-breakpoint-down(sm) {
      content: none;
    }
  }
}

.links-color {
  color: $purple;
  font-size: clamp(0.75rem, -0.0179rem + 0.9524vw, 1.125rem);
}

h3 {
  width: 80%;
}
</style>
