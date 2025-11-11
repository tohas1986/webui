<template>
  <main id="main-content" class="page-container">
    <slot />
  </main>
</template>

<script>
import JumpLinkMixin from '@/components/Mixins/JumpLinkMixin';
export default {
  name: 'PageContainer',
  mixins: [JumpLinkMixin],
  created() {
    this.$root.$on('skip-navigation', () => {
      this.setFocus(this.$el);
    });
  },
};
</script>
<style lang="scss" scoped>
main {
  width: 100%;
  height: 100%;
  padding: clamp(1rem, -0.0238rem + 1.2698vw, 1.5rem)
    clamp(1.2rem, -1.4619rem + 3.3016vw, 2.5rem)
    clamp(1.375rem, 0.0952rem + 1.5873vw, 2rem)
    clamp(1.2rem, -1.4619rem + 3.3016vw, 2.5rem);

  &:focus-visible {
    box-shadow: inset 0 0 0 2px theme-color('primary');
    outline: none;
  }
}
</style>
