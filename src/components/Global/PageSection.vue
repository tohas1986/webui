<template>
  <div class="page-section">
    <h2 v-if="sectionTitle" class="page-section-text">{{ sectionTitle }}</h2>

    <slot />
  </div>
</template>

<script>
export default {
  name: 'PageSection',
  props: {
    sectionTitle: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.page-section {
  margin-bottom: $spacer * 2.5;
  @include media-breakpoint-down(sm) {
    margin-bottom: $spacer * 1.25;
  }
}

.page-section-text {
  margin-bottom: $spacer * 1.25;
  @include media-breakpoint-down(sm) {
    margin-bottom: $spacer * 0.9;
  }
}
</style>
