<template>
  <b-container fluid>
    <page-title />
    <page-section class="mb-1">
      <div class="terminal-container">
        <kvm-console :is-full-window="false" />
      </div>
    </page-section>
    <page-section
      :section-title="$t('pageKvm.virtualMedia')"
      class="mt-5 virtual-media-container"
    >
      <virtual-media />
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import KvmConsole from './KvmConsole';
import VirtualMedia from './KvmVirtualMedia.vue';

export default {
  name: 'Kvm',
  components: { PageTitle, PageSection, KvmConsole, VirtualMedia },
};
</script>

<style lang="scss" scoped>
.terminal-container {
  width: 100%;
}

.virtual-media-container {
  .page-section-text {
    @include media-breakpoint-down(sm) {
      padding-top: 3rem;
    }
  }
}
</style>
