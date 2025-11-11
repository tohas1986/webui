<template>
  <transition name="slide">
    <div v-if="isToolbarActive" class="toolbar-container">
      <div class="toolbar-content">
        <p class="toolbar-selected">
          {{ selectedItemsCount }} {{ $t('global.action.selected') }}
        </p>
        <div class="toolbar-actions d-flex">
          <slot name="toolbar-buttons"></slot>
          <b-button
            v-for="(action, index) in actions"
            :key="index"
            :data-test-id="`table-button-${action.value}Selected`"
            variant="link"
            class="btn-table"
            @click="$emit('batch-action', action.value)"
          >
            {{ action.label }}
          </b-button>
          <b-button
            variant="link"
            class="btn-table"
            @click="$emit('clear-selected')"
          >
            {{ $t('global.action.cancel') }}
          </b-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'TableToolbar',
  props: {
    selectedItemsCount: {
      type: Number,
      required: true,
    },
    actions: {
      type: Array,
      default: () => [],
      validator: (prop) => {
        return prop.every((action) => {
          return (
            Object.prototype.hasOwnProperty.call(action, 'value') &&
            Object.prototype.hasOwnProperty.call(action, 'label')
          );
        });
      },
    },
  },
  data() {
    return {
      isToolbarActive: false,
    };
  },
  watch: {
    selectedItemsCount: function (selectedItemsCount) {
      if (selectedItemsCount > 0) {
        this.isToolbarActive = true;
      } else {
        this.isToolbarActive = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$toolbar-height: 68px;
$toolbar-height-min: 48px;

.toolbar-container {
  width: 100%;
  position: relative;
  z-index: $zindex-dropdown + 1;
}

.toolbar-content {
  height: $toolbar-height;
  background-color: $white;
  color: $main-color;
  position: absolute;
  left: 0;
  right: 0;
  top: -34px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 15px;
  font-size: clamp(0.875rem, 0.3631rem + 0.6349vw, 1.125rem);

  @include media-breakpoint-down('xl') {
    height: $toolbar-height-min;
    top: -24px;
  }
}

.toolbar-selected {
  line-height: $toolbar-height;
  margin: 0;
  padding: 0 $spacer;

  @include media-breakpoint-down('xl') {
    line-height: $toolbar-height-min;
  }
}

.toolbar-actions {
  gap: 5px;
  padding: 5px;
}

// Using v-deep to style export slot child-element
// depricated and vue-js 3
.toolbar-actions ::v-deep .btn {
  position: relative;
  &:after {
    content: '';
    position: absolute;
    left: 0;
    height: 1.5rem;
    width: 1px;
    background: rgba($white, 0.6);
  }
  &:last-child,
  &:first-child {
    &:after {
      width: 0;
    }
  }
}

.slide-enter-active {
  transition: transform $duration--moderate-02 $entrance-easing--productive;
}
.slide-leave-active {
  transition: transform $duration--moderate-02 $exit-easing--productive;
}
.slide-enter, // Remove this vue2 based only class when switching to vue3
.slide-enter-from, // This is vue3 based only class modified from 'slide-enter'
.slide-leave-to {
  transform: translateY($toolbar-height);
}
</style>
