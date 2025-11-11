<template>
  <span :class="['status-icon', status]">
    <icon-success v-if="status === 'success' || status === 'info'" />
    <icon-warning v-else />
  </span>
</template>

<script>
import IconCheckmark from '@/components/icons/IconSuccess';
import IconWarning from '@/components/icons/IconWarning';

export default {
  name: 'StatusIcon',
  components: {
    iconSuccess: IconCheckmark,
    iconWarning: IconWarning,
  },
  props: {
    status: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.status-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: clamp(2.5rem, -0.0595rem + 3.1746vw, 3.75rem);
  height: clamp(2.5rem, -0.0595rem + 3.1746vw, 3.75rem);
  border-radius: 15px;
  color: $white;

  @include media-breakpoint-down(md) {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 8px;
  }

  &.info {
    background-color: $current-bg;
  }
  &.success {
    background-color: $current-bg;
  }
  &.danger {
    background-color: $error-bg;
  }
  &.secondary {
    background-color: $error-bg;
  }
  &.warning {
    background-color: $error-bg;
  }

  svg {
    fill: currentColor;
  }
}
</style>
