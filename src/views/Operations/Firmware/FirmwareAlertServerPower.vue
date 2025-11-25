<template>
  <b-row>
    <b-col xl="10">
      <!-- Operation in progress alert -->
      <alert v-if="isOperationInProgress" variant="info" class="mb-5">
        <p>
          {{
            $t('pageFirmwareUpdate.updateFirmware.alert.operationInProgress')
          }}
        </p>
      </alert>
      <!-- Power off server warning alert -->
      <alert v-else-if="!isServerOff" variant="warning" class="mb-5">
        <p class="mb-0">
          {{
            $t(
              'pageFirmwareUpdate.updateFirmware.alert.serverMustBePoweredOffTo'
            )
          }}
        </p>
        <ul class="m-0">
          <li>
            {{
              $t(
                'pageFirmwareUpdate.updateFirmware.alert.switchRunningAndBackupImages'
              )
            }}
          </li>
          <li>
            {{ $t('pageFirmwareUpdate.updateFirmware.alert.updateFirmware') }}
          </li>
        </ul>
        <template #action>
          <b-link to="/settings/power-supply">
            {{
              $t(
                'pageFirmwareUpdate.updateFirmware.alert.viewServerPowerOperations'
              )
            }}
          </b-link>
        </template>
      </alert>
    </b-col>
  </b-row>
</template>

<script>
import Alert from '@/components/Global/Alert';

export default {
  components: { Alert },
  props: {
    isServerOff: {
      required: true,
      type: Boolean,
    },
  },
  computed: {
    isOperationInProgress() {
      return this.$store.getters['controls/isOperationInProgress'];
    },
  },
};
</script>
