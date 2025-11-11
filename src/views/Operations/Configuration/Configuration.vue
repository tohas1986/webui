<template>
  <b-container fluid>
    <page-title />
    <factory-reset></factory-reset>
    <backup-restore></backup-restore>
  </b-container>
</template>

<script>
import FactoryReset from './FactoryReset';
import BackupRestore from './BackupRestore';
import PageTitle from '@/components/Global/PageTitle';

export default {
  name: 'Configuration',
  components: { FactoryReset, PageTitle, BackupRestore },
  computed: {
    sectionTitle() {
      return this.$t('pageConfiguration.factoryReset');
    },
  },
};
</script>

<style lang="scss" scoped></style>
