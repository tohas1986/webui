<template>
  <overview-card
    class="overview-inventory"
    :title="$t('pageOverview.inventory')"
    :to="`/hardware-status/inventory`"
  >
    <div class="card-info">
      <dl>
        <dt>{{ $t('pageOverview.memory') }}</dt>
        <dd>
          {{ dataFormatter(memoryCount) }}
          <span v-if="memoryCount">{{ $t('unit.GiB') }}</span>
        </dd>
      </dl>
      <dl>
        <dt>{{ $t('pageOverview.cpu') }}</dt>
        <dd>{{ dataFormatter(processorsCount) }}</dd>
      </dl>
      <dl>
        <dt>{{ $t('pageOverview.systemIdentifyLed') }}</dt>
        <dd class="switch-field">
          <b-form-checkbox
            id="identifyLedSwitch"
            v-model="systems.locationIndicatorActive"
            data-test-id="overviewInventory-checkbox-identifyLed"
            switch
            @change="toggleIdentifyLedSwitch"
          >
            <span v-if="systems.locationIndicatorActive">
              {{ $t('global.status.on') }}
            </span>
            <span v-else>{{ $t('global.status.off') }}</span>
          </b-form-checkbox>
        </dd>
      </dl>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'Inventory',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  computed: {
    systems() {
      let systemData = this.$store.getters['system/systems'][0];
      return systemData ? systemData : {};
    },
    processorsCount() {
      return this.systems.processorSummaryCount;
    },
    memoryCount() {
      return this.systems.totalSystemMemoryGiB;
    },
  },
  created() {
    this.$store.dispatch('system/getSystem').finally(() => {
      this.$root.$emit('overview-inventory-complete');
    });
  },
  methods: {
    toggleIdentifyLedSwitch(state) {
      this.$store
        .dispatch('system/changeIdentifyLedState', state)
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>

<style lans="scss" scoped>
.overview-inventory {
  .card-text {
    white-space: break-spaces;
  }
}
.switch-field {
  word-break: normal;
  margin-left: 2px;
}
</style>
