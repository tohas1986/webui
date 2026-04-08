<template>
  <b-modal
    id="modal-update-firmware"
    size="lg"
    centered
    :title="$t('pageFirmware.sectionTitleUpdateFirmware')"
    :ok-title="$t('pageFirmware.form.updateFirmware.startUpdate')"
    :cancel-title="$t('global.action.cancel')"
    @ok="handleOk"
  >
    <template v-if="isSingleFileUploadEnabled && isBmc">
      <p>
        {{ $t('pageFirmware.modal.updateFirmwareInfo') }}
      </p>
      <p>
        {{
          $t('pageFirmware.modal.updateFirmwareInfo2', {
            running: runningBmcVersion,
          })
        }}
      </p>
      <p class="m-0">
        {{ $t('pageFirmware.modal.updateFirmwareInfo3') }}
      </p>
    </template>
    <template v-else-if="isSingleFileUploadEnabled && !isBmc">
      {{ $t('pageFirmware.modal.updateFirmwareInfoPldm') }}
    </template>
    <template v-else>
      {{ $t('pageFirmware.modal.updateFirmwareInfoDefault') }}
    </template>
    <!-- Checkbox отображается всегда -->
    <hr class="my-3" />
    <b-form-group>
      <b-form-checkbox
        v-model="delayUpdate"
        name="delay-update-checkbox"
        :value="true"
        :unchecked-value="false"
      >
        {{ $t('pageFirmware.modal.delayUpdateLabel') }}
      </b-form-checkbox>
      <b-form-text v-if="delayUpdate" class="text-muted mt-1">
        {{ $t('pageFirmware.modal.delayUpdateHelpText') }}
      </b-form-text>
    </b-form-group>
  </b-modal>
</template>

<script>
export default {
  props: {
    isBmc: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      delayUpdate: false, // Значение по умолчанию false
    };
  },
  computed: {
    runningBmc() {
      return this.$store.getters['firmware/activeBmcFirmware'];
    },
    runningBmcVersion() {
      return this.runningBmc?.version || '--';
    },
    isSingleFileUploadEnabled() {
      return this.$store.getters['firmware/isSingleFileUploadEnabled'];
    },
  },
  methods: {
    handleOk() {
      this.$emit('ok', { delayUpdate: this.delayUpdate });
    },
  },
};
</script>
<style lang="scss" scoped>
.mb-3 {
  @include media-breakpoint-down(sm) {
    margin-bottom: 0 !important;
  }
}
</style>
