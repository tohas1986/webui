<template>
  <b-container id="ThermalControl" fluid="xl">
    <b-card
      no-body
      bg-variant="white"
      border-variant="light"
      @click="hideecharsinfo"
    >
      <template v-if="COMPANY_NAME === 'egs'">
        <b-tabs
          :value="activeTab"
          content-class="mt-4"
          nav-wrapper-class="custom-tabs"
          @input="saveCurrentTab"
        >
          <!-- Summary -->
          <b-tab
            class="card-edit-pad"
            :title="$t('pageThermalControl.temperature.title')"
          >
            <temperature />
          </b-tab>
          <b-tab
            class="card-edit-pad"
            :title="$t('pageThermalControl.fans.title')"
          >
            <fans-information />
          </b-tab>
        </b-tabs>
      </template>
      <template v-else>
        <b-card bg-variant="white" border-variant="light">
          <fans-information />
        </b-card>
      </template>
    </b-card>
  </b-container>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

import Temperature from './Temperature.vue';
import FansInformation from './FansInformation.vue';

const THERMAL_TAB_KEY = 'thermal';
const thermalTabs = {
  fanSettings: 0,
  fanInfo: 1,
};
export default {
  name: 'Power',
  components: {
    Temperature,
    FansInformation,
  },
  mixins: [BVToastMixin, DataFormatterMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    sessionStorage.removeItem(THERMAL_TAB_KEY);
    this.hideLoader();
    next();
  },
  data() {
    return {};
  },
  computed: {
    activeTab() {
      const thermal = sessionStorage.getItem(THERMAL_TAB_KEY);
      return thermalTabs[thermal] || 0;
    },
    COMPANY_NAME() {
      return process.env.VUE_APP_COMPANY_NAME;
    },
  },
  watch: {},
  created() {
    this.startLoader();
    const tempPromise = new Promise((resolve) => {
      this.$root.$on('thermal-temperature-complete', () => resolve());
    });
    const fanPromise = new Promise((resolve) => {
      this.$root.$on('thermal-fan-complete', () => resolve());
    });
    let setloaderlist = [fanPromise];
    if (this.COMPANY_NAME === 'egs') {
      setloaderlist.push(tempPromise);
    }
    Promise.all(setloaderlist).finally(() => {
      this.endLoader();
    });
  },
  methods: {
    saveCurrentTab(tabIndex) {
      const thermal = Object.keys(thermalTabs)[tabIndex];
      sessionStorage.setItem(THERMAL_TAB_KEY, thermal);
    },
    hideecharsinfo() {
      this.$root.$emit('hideinfo');
    },
  },
};
</script>
<style lang="scss">
#ThermalControl {
  .form-inline {
    .form-group {
      height: 50px;
    }
    display: block;
    .d-block {
      &::after {
        content: ' :';
      }
      margin-right: 20px;
    }
    .Fixed-width-3 {
      width: 120px;
    }
    .Fixed-width-4 {
      width: 140px;
    }
    .Fixed-width-6 {
      width: 160px;
    }
  }
  .card-edit-pad {
    padding: 0px 1.25rem 1.25rem 1.25rem;
  }
}
</style>
