<template>
  <b-modal
    id="modal-switch-to-running"
    :ok-title="$t('pageFirmwareUpdate.updateFirmware.modal.switchImages')"
    :cancel-title="$t('global.action.cancel')"
    :title="$t('pageFirmwareUpdate.updateFirmware.modal.switchRunningImage')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmwareUpdate.updateFirmware.modal.switchRunningImageInfo') }}
    </p>
    <!-- <p class="m-0">
      {{
        $t('pageFirmwareUpdate.updateFirmware.modal.switchRunningImageInfo2', {
          backup,
        })
      }}
    </p> -->
  </b-modal>
</template>

<script>
export default {
  props: {
    backup: {
      type: String,
      required: true,
    },
  },
};
</script>
