<template>
  <b-modal
    id="modal-update-firmware"
    :title="$t('pageFirmwareUpdate.updateFirmware.sectionTitleUpdateFirmware')"
    :ok-title="$t('pageFirmwareUpdate.updateFirmware.form.startUpdate')"
    :cancel-title="$t('global.action.cancel')"
    @ok="$emit('ok')"
  >
    <template v-if="isSingleFileUploadEnabled">
      <p>
        {{ $t('pageFirmwareUpdate.updateFirmware.modal.updateFirmwareInfo') }}
      </p>
      <p>
        {{
          $t('pageFirmwareUpdate.updateFirmware.modal.updateFirmwareInfo2', {
            running: runningBmcVersion,
          })
        }}
      </p>
      <p class="m-0">
        {{ $t('pageFirmwareUpdate.updateFirmware.modal.updateFirmwareInfo3') }}
      </p>
    </template>
    <template v-else>
      {{
        $t('pageFirmwareUpdate.updateFirmware.modal.updateFirmwareInfoDefault')
      }}
    </template>
  </b-modal>
</template>

<script>
export default {
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
};
</script>
