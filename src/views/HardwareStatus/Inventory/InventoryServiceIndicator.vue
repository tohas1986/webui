<template>
  <page-section>
    <div class="section-container">
      <b-row>
        <b-col sm="12" md="4" class="service-text">
          <h3>{{ $t('pageInventory.systemIndicator.sectionTitle') }}</h3>
        </b-col>
        <b-col sm="12" md="8">
          <b-row>
            <b-col sm="6">
              <dl>
                <dt>{{ $t('pageInventory.systemIndicator.powerStatus') }}</dt>
                <dd>
                  <status-color :status="serverStatusIcon" />
                  <span class="text-status">{{ $t(powerStatus) }}</span>
                </dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <dt>
                  {{ $t('pageInventory.systemIndicator.identifyLed') }}
                </dt>
                <dd>
                  <b-form-checkbox
                    id="identifyLedSwitchService"
                    v-model="systems.locationIndicatorActive"
                    data-test-id="inventoryService-toggle-identifyLed"
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
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </div>
  </page-section>
</template>
<script>
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import StatusColor from '@/components/Global/StatusColor';

export default {
  components: { PageSection, StatusColor },
  mixins: [BVToastMixin],
  computed: {
    systems() {
      let systemData = this.$store.getters['system/systems'][0];
      return systemData ? systemData : {};
    },
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    powerStatus() {
      if (this.serverStatus === 'unreachable') {
        return `global.status.off`;
      }
      return `global.status.${this.serverStatus}`;
    },
    serverStatusIcon() {
      switch (this.serverStatus) {
        case 'on':
          return 'success';
        case 'off':
          return 'danger';
        case 'diagnosticMode':
          return 'warning';
        default:
          return 'secondary';
      }
    },
  },
  created() {
    this.$store.dispatch('system/getSystem').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-service-complete');
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
<style lang="scss" scoped>
.service-text {
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

dt {
  color: $main-color;
}

dd {
  margin-top: 10px;
}
</style>
