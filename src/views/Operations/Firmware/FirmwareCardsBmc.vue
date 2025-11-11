<template>
  <div>
    <page-section :section-title="sectionTitle">
      <b-row>
        <!-- Running image -->
        <b-col sm="12" md="6" class="mb-4">
          <div class="section-container">
            <b-row>
              <b-col sm="12" md="5" class="text-divider">
                <h3>{{ $t('pageFirmware.cardTitleRunning') }}</h3>
              </b-col>
              <b-col sm="12" md="7" class="text-value">
                <dl>
                  <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
                  <dd>{{ runningVersion }}</dd>
                </dl>
              </b-col>
            </b-row>
          </div>
        </b-col>

        <!-- Backup image Bmc -->
        <b-col sm="12" md="6" class="mb-4">
          <div class="section-container firmware-bmc-backup-container">
            <b-row>
              <b-col sm="12" md="5" class="text-divider">
                <h3>{{ $t('pageFirmware.cardTitleBackupBmc') }}</h3>
              </b-col>
              <b-col sm="12" md="7" class="text-value">
                <dl>
                  <dt>{{ $t('pageFirmware.cardTitleBackup') }}</dt>
                  <dd></dd>
                  <dd>
                    <status-color
                      v-if="showBackupImageStatus"
                      status="danger"
                    />
                    <span v-if="showBackupImageStatus" class="sr-only">
                      {{ backupStatus }}
                    </span>
                    {{ backupBmcVersion }}
                  </dd>
                </dl>
              </b-col>
            </b-row>
            <b-btn
              v-if="!switchToBackupImageDisabled"
              v-b-modal.modal-switch-to-running
              data-test-id="firmware-button-switchToRunning"
              variant="link"
              class="firmware-bmc-btn"
              :disabled="isPageDisabled || !backupBmc || !isServerOff"
            >
              <span class="icon-box">
                <icon-switch class="d-inline-block" animation="cylon" />
              </span>
              <span class="firmware-bmc-btn-text">
                {{ $t('pageFirmware.cardActionSwitchToRunning') }}
              </span>
            </b-btn>
          </div>
        </b-col>

        <!-- Bios image -->
        <b-col sm="12" md="6" class="mb-4">
          <div class="section-container">
            <b-row>
              <b-col sm="12" md="5" class="text-divider">
                <h3>{{ $t('pageFirmware.cardTitleBios') }}</h3>
              </b-col>
              <b-col sm="12" md="7" class="text-value">
                <dl>
                  <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
                  <dd>{{ biosVersion }}</dd>
                </dl>
              </b-col>
            </b-row>
          </div>
        </b-col>

        <!-- Backup image BIOS -->
        <b-col sm="12" md="6" class="mb-4">
          <div class="section-container firmware-bmc-backup-container">
            <b-row>
              <b-col sm="12" md="5" class="text-divider">
                <h3>{{ $t('pageFirmware.cardTitleBackupBios') }}</h3>
              </b-col>
              <b-col sm="12" md="7" class="text-value">
                <dl>
                  <dt>{{ $t('pageFirmware.cardTitleBackup') }}</dt>
                  <dd></dd>
                  <dd>
                    <status-color
                      v-if="showBackupImageStatus"
                      status="danger"
                    />
                    <span v-if="showBackupImageStatus" class="sr-only">
                      {{ backupStatus }}
                    </span>
                    {{ backupBiosVersion }}
                  </dd>
                </dl>
              </b-col>
            </b-row>
          </div>
        </b-col>
      </b-row>
    </page-section>

    <page-section v-if="showCpld" :section-title="cpldImage">
      <b-row>
        <!-- CLPD image -->
        <b-col v-for="cpldItem in cpld" :key="cpldItem.id" sm="12" md="6">
          <div class="section-container">
            <b-row>
              <b-col sm="12" md="5" class="text-divider">
                <h3>{{ cpldItem.id }}</h3>
              </b-col>
              <b-col sm="12" md="7" class="text-value">
                <dl>
                  <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
                  <dd>{{ cpldItem.version }}</dd>
                </dl>
              </b-col>
            </b-row>
          </div>
        </b-col>
      </b-row>
    </page-section>

    <page-section v-if="showMe" :section-title="meImage">
      <b-row>
        <!-- ME image -->
        <b-col v-for="meItem in me" :key="meItem.id" sm="12" md="6">
          <div class="section-container">
            <b-row>
              <b-col sm="12" md="5" class="text-divider">
                <h3>{{ meItem.id }}</h3>
              </b-col>
              <b-col sm="12" md="7" class="text-value">
                <dl>
                  <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
                  <dd>{{ meItem.version }}</dd>
                </dl>
              </b-col>
            </b-row>
          </div>
        </b-col>
      </b-row>
    </page-section>

    <page-section v-if="showPsu" :section-title="psuImage">
      <b-row>
        <!-- PSU image -->
        <b-col
          v-for="psuItem in psu"
          :key="psuItem.id"
          sm="12"
          md="6"
          class="mb-4"
        >
          <div class="section-container">
            <b-row>
              <b-col sm="12" md="5" class="text-divider">
                <h3>{{ titleFormating(psuItem.id) }}</h3>
              </b-col>
              <b-col sm="12" md="7" class="text-value">
                <dl>
                  <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
                  <dd>{{ psuItem.version }}</dd>
                </dl>
              </b-col>
            </b-row>
          </div>
        </b-col>
      </b-row>
    </page-section>

    <page-section v-if="showPldm" :section-title="pldmImage">
      <b-row>
        <!-- PLDM image -->
        <b-col
          v-for="pldmItem in pldm"
          :key="pldmItem.id"
          sm="12"
          md="6"
          class="mb-4"
        >
          <div class="section-container table-card-information">
            <b-row>
              <b-col sm="12" md="5" class="text-divider">
                <h3 class="text-break">
                  {{ titleFormating(pldmItem.id) }}
                </h3>
              </b-col>
              <b-col sm="12" md="7" class="text-value">
                <b-row>
                  <b-col sm="12" md="4">
                    <dl>
                      <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
                      <dd>{{ pldmItem.version }}</dd>
                    </dl>
                  </b-col>
                  <b-col sm="12" md="4">
                    <dl v-if="pldmItem.activation">
                      <dt>{{ $t('pageFirmware.cardBodyActivation') }}</dt>
                      <dd>{{ pldmItem.activation }}</dd>
                    </dl>
                  </b-col>
                  <b-col sm="12" md="4">
                    <dl v-if="pldmItem.progress">
                      <dt>{{ $t('pageFirmware.cardBodyProgress') }}</dt>
                      <dd>{{ pldmItem.progress }}</dd>
                    </dl>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
          </div>
        </b-col>
      </b-row>
    </page-section>

    <modal-switch-to-running :backup="backupBmcVersion" @ok="switchToRunning" />
  </div>
</template>

<script>
import IconSwitch from '@carbon/icons-vue/es/arrows--horizontal/20';
import PageSection from '@/components/Global/PageSection';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import StatusColor from '@/components/Global/StatusColor';

import ModalSwitchToRunning from './FirmwareModalSwitchToRunning';

export default {
  components: { IconSwitch, ModalSwitchToRunning, PageSection, StatusColor },
  mixins: [BVToastMixin, LoadingBarMixin],
  props: {
    isPageDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
    isServerOff: {
      required: true,
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cpldImage: this.$t('pageFirmware.cpldImage'),
      psuImage: this.$t('pageFirmware.psuImage'),
      pldmImage: this.$t('pageFirmware.pldmImage'),
      meImage: this.$t('pageFirmware.meImage'),
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
        return this.$t('pageFirmware.sectionTitleBmcCardsCombined');
      }
      return this.$t('pageFirmware.sectionTitleBmcCards');
    },
    running() {
      return this.$store.getters['firmware/activeBmcFirmware'];
    },
    backupBmc() {
      return this.$store.getters['firmware/backupBmcFirmware'];
    },
    bios() {
      return this.$store.getters['firmware/activeHostFirmware'];
    },
    backupBios() {
      return this.$store.getters['firmware/backupBiosFirmware'];
    },
    cpld() {
      return this.$store.getters['firmware/clpdFirmware'];
    },
    psu() {
      return this.$store.getters['firmware/psuFirmware'];
    },
    pldm() {
      return this.$store.getters['firmware/pldmFirmware'];
    },
    me() {
      return this.$store.getters['firmware/meFirmware'];
    },
    runningVersion() {
      return this.running?.version || '--';
    },
    backupBmcVersion() {
      return this.backupBmc?.version || '--';
    },
    biosVersion() {
      return this.bios || '--';
    },
    backupBiosVersion() {
      return this.backupBios?.version || '--';
    },
    clpdVersion() {
      return this.cpld?.version || '--';
    },
    psuVersion() {
      return this.psu.map((item) => item?.version || '--');
    },
    meVersion() {
      return this.psu.map((item) => item?.version || '--');
    },
    psuTitle() {
      return this.psu.map((item) => item?.id.replace(/_/g, ' '));
    },
    pldmVersion() {
      return this.pldm.map((item) => item?.version || '--');
    },
    pldmTitle() {
      return this.pldm.map((item) => item?.id.replace(/_/g, ' '));
    },
    showCpld() {
      return this.cpld.length !== 0;
    },
    showPsu() {
      return this.psu.length !== 0;
    },
    showPldm() {
      return this.pldm.length !== 0;
    },
    showMe() {
      return this.me.length !== 0;
    },
    backupStatus() {
      return this.backupBmc?.status || null;
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
        this.infoToast(this.$t('pageFirmware.toast.verifySwitchMessage'), {
          title: this.$t('pageFirmware.toast.verifySwitch'),
          refreshAction: true,
        });
      }, 60000);

      this.$store
        .dispatch('firmware/switchBmcFirmwareAndReboot')
        .then(() =>
          this.infoToast(this.$t('pageFirmware.toast.rebootStartedMessage'), {
            title: this.$t('pageFirmware.toast.rebootStarted'),
          }),
        )
        .catch(({ message }) => {
          this.errorToast(message);
          clearTimeout(timerId);
          this.endLoader();
        });
    },
    titleFormating(text) {
      return text.replace(/_/g, ' ');
    },
  },
};
</script>

<style lang="scss" scoped>
.firmware-bmc-backup-container {
  position: relative;
  @include media-breakpoint-down(sm) {
    padding-top: 3rem;
  }
  @include media-breakpoint-down(xs) {
    padding-top: 3.5rem;
  }
}

.firmware-bmc-btn {
  position: absolute;
  top: -45%;
  right: 0;
  padding: clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem)
    clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem)
    clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem)
    clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem);
  font-size: clamp(0.875rem, 0.3631rem + 0.6349vw, 1.125rem);
  background-color: $btn-background;
  border-radius: 20px;

  @include media-breakpoint-down(sm) {
    top: 0;
  }

  &:hover {
    background-color: $main-color;
    color: $white;
  }

  &:active {
    color: $white !important;
  }
}

dd {
  margin-top: 10px;
}

.firmware-bmc-btn-text {
  margin-left: clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem);
}

.btn svg {
  margin-right: 0;
  fill: $main-color;
}

.page-section {
  margin-bottom: 1rem;
}

.text-break {
  width: 80%;
}

.text-value,
.text-divider {
  @include media-breakpoint-down(md) {
    width: 50% !important;
    flex: 0 0 50% !important;
  }
}
</style>
