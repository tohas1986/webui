<template>
  <b-container fluid>
    <page-title />
    <!-- <overview-quick-links class="mb-4" /> -->
    <div class="overview-container">
      <div class="d-flex flex-column">
        <overview-server class="overview-server" />
        <div class="overview-second-container">
          <overview-events />
          <overview-console />
        </div>
      </div>

      <div class="overview-parameters-container">
        <h3>{{ $t('pageOverview.parameters') }}</h3>
        <overview-firmware />
        <overview-network />
        <overview-power />
        <overview-inventory />
      </div>
    </div>
  </b-container>
</template>

<script>
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
// import OverviewDumps from './OverviewDumps.vue';
import OverviewEvents from './OverviewEvents.vue';
import OverviewFirmware from './OverviewFirmware.vue';
import OverviewInventory from './OverviewInventory.vue';
import OverviewNetwork from './OverviewNetwork';
import OverviewPower from './OverviewPower';
import OverviewConsole from './OverviewConsole';
import OverviewServer from './OverviewServer';
import PageTitle from '@/components/Global/PageTitle';

export default {
  name: 'Overview',
  components: {
    // OverviewDumps,
    OverviewEvents,
    OverviewFirmware,
    OverviewInventory,
    OverviewNetwork,
    OverviewPower,
    OverviewConsole,
    OverviewServer,
    PageTitle,
  },
  mixins: [LoadingBarMixin],
  data() {
    return {
      showDumps: process.env.VUE_APP_ENV_NAME === 'ibm',
    };
  },
  created() {
    this.startLoader();
    const dumpsPromise = new Promise((resolve) => {
      this.$root.$on('overview-dumps-complete', () => resolve());
    });
    const eventsPromise = new Promise((resolve) => {
      this.$root.$on('overview-events-complete', () => resolve());
    });
    const firmwarePromise = new Promise((resolve) => {
      this.$root.$on('overview-firmware-complete', () => resolve());
    });
    const inventoryPromise = new Promise((resolve) => {
      this.$root.$on('overview-inventory-complete', () => resolve());
    });
    const networkPromise = new Promise((resolve) => {
      this.$root.$on('overview-network-complete', () => resolve());
    });
    const powerPromise = new Promise((resolve) => {
      this.$root.$on('overview-power-complete', () => resolve());
    });
    const serverPromise = new Promise((resolve) => {
      this.$root.$on('overview-server-complete', () => resolve());
    });

    const promises = [
      eventsPromise,
      firmwarePromise,
      inventoryPromise,
      networkPromise,
      powerPromise,
      serverPromise,
    ];
    if (this.showDumps) promises.push(dumpsPromise);
    Promise.all(promises).finally(() => this.endLoader());
  },
};
</script>

<style lang="scss" scoped>
.overview-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);

  @include media-breakpoint-down(md) {
    grid-template-columns: auto;
  }
}

.overview-server {
  margin-bottom: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  flex: 1 1 auto;
}

.overview-second-container {
  display: grid;
  grid-template-columns: 1fr 1.64fr;
  grid-gap: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);

  @include media-breakpoint-down('xl') {
    grid-template-columns: 1fr 1.5fr;
  }

  @media (min-width: 1930px) {
    grid-template-columns: 1fr 1.5fr;
  }

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }

  @include media-breakpoint-down(md) {
    grid-template-columns: 1fr 1.5fr;
  }

  @include media-breakpoint-down(sm) {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    grid-template-rows: auto;
  }
}

.overview-parameters-container {
  min-height: clamp(33.563rem, -0.3497rem + 42.0622vw, 50.125rem);
  padding: clamp(1.625rem, -0.1667rem + 2.2222vw, 2.5rem);
  border: 1px solid $gray-border;
  border-radius: 20px;

  h3 {
    margin-bottom: clamp(1.625rem, -0.1667rem + 2.2222vw, 2.5rem);
  }
}
</style>
