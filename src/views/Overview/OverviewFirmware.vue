<template>
  <overview-card
    :title="$t('pageOverview.firmwareInformation')"
    :to="`/operations/firmware`"
  >
    <div class="card-info">
      <dl>
        <dt>{{ $t('pageOverview.runningVersion') }}</dt>
        <dd>{{ dataFormatter(runningVersion) }}</dd>
      </dl>
      <dl>
        <dt>{{ $t('pageOverview.backupVersion') }}</dt>
        <dd>{{ dataFormatter(backupVersion) }}</dd>
      </dl>
      <!-- <dl>
        <dt>{{ $t('pageOverview.firmwareVersion') }}</dt>
        <dd>{{ dataFormatter(firmwareVersion) }}</dd>
      </dl> -->
      <dl>
        <dt>{{ $t('pageOverview.biosVersion') }}</dt>
        <dd>{{ dataFormatter(bioVersion) }}</dd>
      </dl>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { mapState } from 'vuex';

export default {
  name: 'Firmware',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  computed: {
    ...mapState({
      server: (state) => state.system.systems[0],
      backupBmcFirmware() {
        return this.$store.getters['firmware/backupBmcFirmware'];
      },
      backupVersion() {
        return this.backupBmcFirmware?.version;
      },
      activeBmcFirmware() {
        return this.$store.getters[`firmware/activeBmcFirmware`];
      },
      firmwareVersion() {
        return this.server?.firmwareVersion;
      },
      runningVersion() {
        return this.activeBmcFirmware?.version;
      },
      activeHostFirmware() {
        return this.$store.getters['firmware/activeHostFirmware'];
      },
      bioVersion() {
        return this.activeHostFirmware;
      },
    }),
  },
  created() {
    this.$store.dispatch('firmware/getFirmwareInformation').finally(() => {
      this.$root.$emit('overview-firmware-complete');
    });
  },
};
</script>
