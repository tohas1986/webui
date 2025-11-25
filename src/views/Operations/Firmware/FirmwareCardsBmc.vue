<template>
  <div>
    <b-row class="mt-3">
      <b-col class="inline-dt overview left">
        <dl>
          <dt>
            {{
              $t(
                'pageFirmwareUpdate.firmwareInformation.primaryPartitionImageVersion'
              )
            }}
            :
          </dt>
          <dd>{{ runningVersion }}/{{ runningVersionDate }}</dd>
          <dd class="ml-3">
            <b-btn
              v-b-modal.modal-switch-to-running
              data-test-id="firmware-button-switchToRunning"
              variant="link"
              size="sm"
              class="my-0 py-0"
            >
              <!-- <icon-switch class="d-none d-sm-inline-block" /> -->
              {{ $t('pageFirmwareUpdate.firmwareInformation.switchover') }}
            </b-btn>
          </dd>
        </dl>
        <dl>
          <dt>
            {{
              $t(
                'pageFirmwareUpdate.firmwareInformation.backupPartitionImageVersion'
              )
            }}
            :
          </dt>
          <dd>{{ backupVersion }}/{{ VersionBackUpDate }}</dd>
        </dl>
      </b-col>
      <b-col class="inline-dt overview">
        <dl>
          <dt>
            {{ $t('pageFirmwareUpdate.firmwareInformation.biosVersion') }} :
          </dt>
          <dd>
            {{ Biosrunning.version || '--' }}/{{
              Biosrunning.versionDate || '--'
            }}
          </dd>
        </dl>
        <dl>
          <dt>
            {{ $t('pageFirmwareUpdate.firmwareInformation.cpldVersion') }} :
          </dt>
          <dd>
            {{ cpldActiveFirmware || '--' }}/{{ cpldVersionDate || '--' }}
          </dd>
        </dl>
      </b-col>
      <!-- <b-col class="inline-dt overview">
        <dl>
          <dt>CPLD Version:</dt>
          <dd>{{ backupVersion }}</dd>
        </dl>
      </b-col> -->
    </b-row>
    <modal-switch-to-running :backup="backupVersion" @ok="switchToRunning" />
  </div>
</template>

<script>
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

import ModalSwitchToRunning from './FirmwareModalSwitchToRunning';

export default {
  components: { ModalSwitchToRunning },
  mixins: [BVToastMixin, LoadingBarMixin],
  props: {
    isPageDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      firmwareDisabled: !process.env.VUE_APP_FIRMWARE_DISABLED,
      loading,
      switchToBackupImageDisabled:
        process.env.VUE_APP_SWITCH_TO_BACKUP_IMAGE_DISABLED === 'true',
    };
  },
  computed: {
    isSingleFileUploadEnabled() {
      return this.$store.getters['firmware/isSingleFileUploadEnabled'];
    },
    sectionTitle() {
      if (this.isSingleFileUploadEnabled) {
        return this.$t(
          'pageFirmwareUpdate.updateFirmware.sectionTitleBmcCardsCombined'
        );
      }
      return this.$t('pageFirmwareUpdate.updateFirmware.sectionTitleBmcCards');
    },
    running() {
      return this.$store.getters['firmware/activeBmcFirmware'];
    },
    backup() {
      return this.$store.getters['firmware/backupBmcFirmware'];
    },
    Biosrunning() {
      return this.$store.getters['firmware/activeHostFirmware'];
    },
    cpldActiveFirmware() {
      return this.$store.getters['firmware/cpldActiveFirmware'];
    },
    cpldVersionDate() {
      return this.$store.getters['firmware/cpldVersionDate'];
    },
    runningVersion() {
      return this.running?.version || '--';
    },
    runningVersionDate() {
      return this.running?.versionDate || '--';
    },
    backupVersion() {
      return this.backup?.version || '--';
    },
    VersionBackUpDate() {
      return this.backup?.versionDate || '--';
    },
    backupStatus() {
      return this.backup?.status || null;
    },
    showBackupImageStatus() {
      return (
        this.backupStatus === 'Critical' || this.backupStatus === 'Warning'
      );
    },
  },
  methods: {
    switchToRunning() {
      this.startLoader();
      const timerId = setTimeout(() => {
        this.endLoader();
        this.infoToast(
          this.$t(
            'pageFirmwareUpdate.updateFirmware.toast.verifySwitchMessage'
          ),
          {
            title: this.$t(
              'pageFirmwareUpdate.updateFirmware.toast.verifySwitch'
            ),
            refreshAction: true,
            noAutoHide: true,
          }
        );
      }, 60000);

      this.$store
        .dispatch('firmware/switchBmcFirmwareAndReboot')
        .then(() =>
          this.infoToast(
            this.$t(
              'pageFirmwareUpdate.updateFirmware.toast.rebootStartedMessage'
            ),
            {
              title: this.$t(
                'pageFirmwareUpdate.updateFirmware.toast.rebootStarted'
              ),
              noAutoHide: true,
            }
          )
        )
        .catch(({ message }) => {
          this.errorToast(message);
          clearTimeout(timerId);
          this.endLoader();
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.inline-dt.overview.left {
  flex-grow: 1.5;
}
</style>
