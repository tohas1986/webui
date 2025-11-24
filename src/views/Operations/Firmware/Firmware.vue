<template>
  <b-container fluid="xl" class="d-flex flex-column">
    <b-card
      bg-variant="white"
      border-variant="light"
      class="mb-3"
      :title="$t('pageFirmwareUpdate.firmwareInformation.title')"
    >
      <!-- Firmware cards -->
      <b-row>
        <b-col>
          <!-- BMC Firmware -->
          <bmc-cards :is-page-disabled="isPageDisabled" />
        </b-col>
      </b-row>
    </b-card>
    <alerts-server-power
      v-if="isServerPowerOffRequired"
      :is-server-off="isServerOff"
    />

    <b-card
      class="update-card"
      bg-variant="white"
      border-variant="light"
      :title="$t('pageFirmwareUpdate.updateFirmware.title')"
    >
      <div class="c-alert">
        <div class="icon Major-warn mr-2"><icon-warning /></div>
        <div class="msgIn">
          {{ $t('pageFirmwareUpdate.updateFirmware.alertTip') }}
        </div>
      </div>

      <firmware-update-step
        :stepNamber="StepNamber"
        v-if="setStep"
        class="mt-3 mb-2"
      />
      <!-- Update firmware-->
      <b-row>
        <b-col v-if="StepNamber == '1'" class="mt-3 mb-5">
          <!-- Update form -->
          <form-update
            :is-server-off="isServerOff"
            :is-page-disabled="isPageDisabled"
          />
          <!-- <firmware-istrue-info /> -->
          <!-- <firmware-updated /> -->
        </b-col>

        <b-col v-else-if="StepNamber == '2'">
          <firmware-istrue-info />
        </b-col>
        <b-col v-else-if="StepNamber == '3'">
          <firmware-updated />
        </b-col>
      </b-row>
    </b-card>
  </b-container>
</template>

<script>
import AlertsServerPower from './FirmwareAlertServerPower';
import BmcCards from './FirmwareCardsBmc';
import FormUpdate from './FirmwareFormUpdate';
//import HostCards from './FirmwareCardsHost';
//import PageSection from '@/components/Global/PageSection';
//import PageTitle from '@/components/Global/PageTitle';
import FirmwareUpdateStep from './FirmwareUpdateStep.vue';
import FirmwareIstrueInfo from './FirmwareIstrueInfo.vue';
import FirmwareUpdated from './FirmwareUpdated.vue';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'FirmwareSingleImage',
  components: {
    AlertsServerPower,
    BmcCards,
    FormUpdate,
    FirmwareUpdateStep,
    FirmwareIstrueInfo,
    FirmwareUpdated,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      loading,
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
      setStep: false,
      StepNamber: 0,
    };
  },
  computed: {
    StepNamber1() {
      //this.StepNamber = this.$store.getters['firmware/getUploadstep'];
      return this.$store.getters['global/getUploadstep'];
    },
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    isServerOff() {
      return this.serverStatus === 'off' ? true : false;
    },
    isSingleFileUploadEnabled() {
      return this.$store.getters['firmware/isSingleFileUploadEnabled'];
    },
    isPageDisabled() {
      if (this.isServerPowerOffRequired) {
        return !this.isServerOff || this.loading || this.isOperationInProgress;
      }
      return this.loading || this.isOperationInProgress;
    },
  },
  watch: {
    StepNamber1() {
      this.setStep = false;
      setTimeout(() => {
        this.setStep = true;
      }, 500);
    },
  },
  created() {
    this.startLoader();
    setTimeout(() => {
      this.setStep = true;
    }, 300);

    Promise.all([
      this.$store.dispatch('firmware/getFirmwareInformation'),
      this.$store.dispatch('firmware/getpowerinfo'),
    ])
      .then(() => {})
      .finally(() => {
        this.endLoader();
      });
  },
  beforeDestroy() {
    this.$store.commit('firmware/setUploadstep', 1);
    this.$store.commit('firmware/setprogressnum', 0);
  },
};
</script>
