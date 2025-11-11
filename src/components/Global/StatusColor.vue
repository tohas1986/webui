<template>
  <span :class="['status-color', status]"></span>
</template>

<script>
export default {
  name: 'StatusColor',
  props: {
    status: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.status-color {
  display: inline-block;
  width: clamp(0.375rem, -0.1369rem + 0.6349vw, 0.625rem);
  height: clamp(0.375rem, -0.1369rem + 0.6349vw, 0.625rem);
  border-radius: 50%;

  &.success {
    background-color: $success-color;
  }
  &.danger {
    background-color: $error-color;
  }
  &.secondary {
    background-color: $secondary-color;
  }
  &.warning {
    background-color: $warning-color;
  }
}
</style>
