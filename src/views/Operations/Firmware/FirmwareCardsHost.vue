<template>
  <page-section :section-title="$t('pageFirmware.sectionTitleHostCards')">
    <b-row>
      <!-- Running image -->
      <b-col sm="12" md="6" class="mb-4">
        <div class="section-container">
          <b-row>
            <b-col sm="4" class="firmware-host-text">
              <h3>{{ $t('pageFirmware.cardTitleRunning') }}</h3>
            </b-col>
            <b-col sm="8">
              <dl>
                <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
                <dd>{{ runningVersion }}</dd>
              </dl>
            </b-col>
          </b-row>
        </div>
      </b-col>
      <!-- Backup image -->
      <b-col sm="12" md="6">
        <div class="section-container">
          <b-row>
            <b-col sm="4" class="firmware-host-text">
              <h3>{{ $t('pageFirmware.cardTitleBackup') }}</h3>
            </b-col>
            <b-col sm="8">
              <dl>
                <dt>{{ $t('pageFirmware.cardTitleBackup') }}</dt>
                <dd></dd>
                <dd>
                  <status-color v-if="showBackupImageStatus" status="danger" />
                  <span v-if="showBackupImageStatus" class="sr-only">
                    {{ backupStatus }}
                  </span>
                  {{ backupVersion }}
                </dd>
              </dl>
            </b-col>
          </b-row>
        </div>
      </b-col>
    </b-row>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import StatusColor from '@/components/Global/StatusColor';

export default {
  components: { PageSection, StatusColor },
  computed: {
    running() {
      return this.$store.getters['firmware/activeHostFirmware'];
    },
    backup() {
      return this.$store.getters['firmware/backupHostFirmware'];
    },
    runningVersion() {
      return this.running?.version || '--';
    },
    backupVersion() {
      return this.backup?.version || '--';
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
};
</script>

<style lang="scss" scoped>
.firmware-host-text {
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

    @include media-breakpoint-down(md) {
      right: 5%;
    }
  }
}
</style>
