<template>
  <b-container fluid>
    <page-title />
    <b-row>
      <b-col sm="12">
        <page-section
          :section-title="$t('pageServerPowerOperations.currentStatus')"
        >
          <div class="section-container">
            <b-row>
              <b-col sm="6">
                <dl class="server-status-dl">
                  <dt>{{ $t('pageServerPowerOperations.serverStatus') }}</dt>
                  <dd
                    v-if="serverStatus === 'on'"
                    data-test-id="powerServerOps-text-hostStatus"
                  >
                    <status-color status="success" />
                    <span class="text-status">
                      {{ $t('global.status.on') }}
                    </span>
                  </dd>
                  <dd
                    v-else-if="serverStatus === 'off'"
                    data-test-id="powerServerOps-text-hostStatus"
                  >
                    <status-color status="danger" />
                    <span class="text-status">
                      {{ $t('global.status.off') }}
                    </span>
                  </dd>
                  <dd
                    v-else-if="serverStatus === 'diagnosticMode'"
                    data-test-id="powerServerOps-text-hostStatus"
                  >
                    <status-color status="warning" />
                    <span class="text-status">
                      {{ $t('global.status.diagnosticMode') }}
                    </span>
                  </dd>
                  <dd v-else>
                    <status-color status="secondary" />
                    <span class="text-status">
                      {{ $t('global.status.notAvailable') }}
                    </span>
                  </dd>
                </dl>
              </b-col>

              <b-col sm="6">
                <dl>
                  <dt>
                    {{ $t('pageServerPowerOperations.lastPowerOperation') }}
                  </dt>
                  <dd
                    v-if="lastPowerOperationTime"
                    data-test-id="powerServerOps-text-lastPowerOp"
                  >
                    {{ lastPowerOperationTime | formatDate }}
                    {{ lastPowerOperationTime | formatTime }} ({{ timezone }})
                  </dd>
                  <dd v-else>--</dd>
                </dl>
              </b-col>
            </b-row>
          </div>
        </page-section>
      </b-col>
    </b-row>
    <div class="server-power-container">
      <div
        v-if="hasBootSourceOptions"
        class="section-container boot-settings-container"
      >
        <page-section
          class="server-power-section"
          :section-title="$t('pageServerPowerOperations.serverBootSettings')"
        />
        <boot-settings />
      </div>
      <div class="section-container boot-settings-container">
        <page-section
          class="server-power-section"
          :section-title="$t('pageServerPowerOperations.operations')"
        />
        <b-row>
          <alert :show="oneTimeBootEnabled" variant="warning">
            {{ $t('pageServerPowerOperations.oneTimeBootWarning') }}
          </alert>
          <template v-if="isOperationInProgress">
            <b-col sm="12">
              <alert variant="info">
                {{ $t('pageServerPowerOperations.operationInProgress') }}
              </alert>
            </b-col>
          </template>
          <template v-else-if="serverStatus === 'off'">
            <b-col sm="12">
              <b-button
                variant="primary"
                class="btn-block"
                data-test-id="serverPowerOperations-button-powerOn"
                @click="powerOn"
              >
                {{ $t('pageServerPowerOperations.powerOn') }}
              </b-button>
            </b-col>
          </template>
          <template v-else>
            <!-- Reboot server options -->
            <b-col sm="12" class="mb-4">
              <b-form novalidate @submit.prevent="rebootServer">
                <b-form-group
                  :label="$t('pageServerPowerOperations.rebootServer')"
                >
                  <b-form-radio
                    v-model="form.rebootOption"
                    class="mb-2"
                    name="reboot-option"
                    data-test-id="serverPowerOperations-radio-rebootOrderly"
                    value="orderly"
                  >
                    {{ $t('pageServerPowerOperations.orderlyReboot') }}
                  </b-form-radio>
                  <b-form-radio
                    v-model="form.rebootOption"
                    name="reboot-option"
                    data-test-id="serverPowerOperations-radio-rebootImmediate"
                    value="immediate"
                  >
                    {{ $t('pageServerPowerOperations.immediateReboot') }}
                  </b-form-radio>
                </b-form-group>

                <b-button
                  variant="primary"
                  class="btn-block"
                  type="submit"
                  data-test-id="serverPowerOperations-button-reboot"
                >
                  {{ $t('pageServerPowerOperations.reboot') }}
                </b-button>
              </b-form>
            </b-col>
            <!-- Shutdown server options -->
            <b-col sm="12">
              <b-form novalidate @submit.prevent="shutdownServer">
                <b-form-group
                  :label="$t('pageServerPowerOperations.shutdownServer')"
                >
                  <b-form-radio
                    v-model="form.shutdownOption"
                    class="mb-2"
                    name="shutdown-option"
                    data-test-id="serverPowerOperations-radio-shutdownOrderly"
                    value="orderly"
                  >
                    {{ $t('pageServerPowerOperations.orderlyShutdown') }}
                  </b-form-radio>
                  <b-form-radio
                    v-model="form.shutdownOption"
                    name="shutdown-option"
                    data-test-id="serverPowerOperations-radio-shutdownImmediate"
                    value="immediate"
                  >
                    {{ $t('pageServerPowerOperations.immediateShutdown') }}
                  </b-form-radio>
                </b-form-group>
                <b-button
                  variant="primary"
                  class="btn-block"
                  type="submit"
                  data-test-id="serverPowerOperations-button-shutDown"
                >
                  {{ $t('pageServerPowerOperations.shutDown') }}
                </b-button>
              </b-form>
            </b-col>
          </template>
        </b-row>
      </div>
    </div>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import BootSettings from './BootSettings';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import Alert from '@/components/Global/Alert';
import StatusColor from '@/components/Global/StatusColor';
import LocalTimezoneLabelMixin from '@/components/Mixins/LocalTimezoneLabelMixin';

export default {
  name: 'ServerPowerOperations',
  components: { PageTitle, PageSection, BootSettings, Alert, StatusColor },
  mixins: [BVToastMixin, LoadingBarMixin, LocalTimezoneLabelMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      form: {
        rebootOption: 'orderly',
        shutdownOption: 'orderly',
      },
    };
  },
  computed: {
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    isOperationInProgress() {
      return this.$store.getters['controls/isOperationInProgress'];
    },
    lastPowerOperationTime() {
      return this.$store.getters['controls/lastPowerOperationTime'];
    },
    oneTimeBootEnabled() {
      return this.$store.getters['serverBootSettings/overrideEnabled'];
    },
    hasBootSourceOptions() {
      let bootOptions =
        this.$store.getters['serverBootSettings/bootSourceOptions'];
      return bootOptions.length !== 0;
    },
    isUtcDisplay() {
      return this.$store.getters['global/isUtcDisplay'];
    },
    timezone() {
      return this.localOffset(this.isUtcDisplay);
    },
  },
  created() {
    this.startLoader();
    const bootSettingsPromise = new Promise((resolve) => {
      this.$root.$on('server-power-operations-boot-settings-complete', () =>
        resolve(),
      );
    });
    Promise.all([
      this.$store.dispatch('serverBootSettings/getBootSettings'),
      this.$store.dispatch('controls/getLastPowerOperationTime'),
      bootSettingsPromise,
    ]).finally(() => this.endLoader());
  },
  methods: {
    powerOn() {
      this.$store.dispatch('controls/serverPowerOn');
    },
    rebootServer() {
      const modalMessage = this.$t(
        'pageServerPowerOperations.modal.confirmRebootMessage',
      );
      const modalOptions = {
        title: this.$t('pageServerPowerOperations.modal.confirmRebootTitle'),
        okTitle: this.$t('global.action.confirm'),
        cancelTitle: this.$t('global.action.cancel'),
        centered: true,
      };

      if (this.form.rebootOption === 'orderly') {
        this.$bvModal
          .msgBoxConfirm(modalMessage, modalOptions)
          .then((confirmed) => {
            if (confirmed) this.$store.dispatch('controls/serverSoftReboot');
          });
      } else if (this.form.rebootOption === 'immediate') {
        this.$bvModal
          .msgBoxConfirm(modalMessage, modalOptions)
          .then((confirmed) => {
            if (confirmed) this.$store.dispatch('controls/serverHardReboot');
          });
      }
    },
    shutdownServer() {
      const modalMessage = this.$t(
        'pageServerPowerOperations.modal.confirmShutdownMessage',
      );
      const modalOptions = {
        title: this.$t('pageServerPowerOperations.modal.confirmShutdownTitle'),
        okTitle: this.$t('global.action.confirm'),
        cancelTitle: this.$t('global.action.cancel'),
        centered: true,
      };

      if (this.form.shutdownOption === 'orderly') {
        this.$bvModal
          .msgBoxConfirm(modalMessage, modalOptions)
          .then((confirmed) => {
            if (confirmed) this.$store.dispatch('controls/serverSoftPowerOff');
          });
      }
      if (this.form.shutdownOption === 'immediate') {
        this.$bvModal
          .msgBoxConfirm(modalMessage, modalOptions)
          .then((confirmed) => {
            if (confirmed) this.$store.dispatch('controls/serverHardPowerOff');
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.server-status-dl {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    display: block;
    right: 25%;
    top: 0;
    width: 1px;
    height: 100%;
    background-color: $gray-border;

    @include media-breakpoint-only(xs) {
      content: none;
    }
  }
}

dd {
  margin-top: 12px;
}

.server-power-section {
  margin-bottom: 0.5rem;
}

.server-power-container {
  display: grid;
  grid-template-columns: 1fr 1.8fr;
  grid-gap: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);

  @include media-breakpoint-down(md) {
    grid-template-columns: 1fr;
  }
}

.boot-settings-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
