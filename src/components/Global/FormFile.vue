<template>
  <div class="custom-form-file-container">
    <label>
      <b-form-file
        :id="id"
        v-model="file"
        :accept="accept"
        :disabled="disabled"
        :state="state"
        plain
        @input="$emit('input', file)"
      >
      </b-form-file>
      <span
        class="add-file-btn btn"
        :class="{
          disabled,
          'btn-link': isSecondary,
          'btn-primary': !isSecondary,
        }"
      >
        <span class="icon-box">
          <icon-import />
        </span>
        {{ $t('global.fileUpload.browseText') }}
      </span>
      <slot name="invalid"></slot>
    </label>
    <div v-if="file" class="clear-selected-file px-3 py-2 mt-2">
      {{ file ? file.name : '' }}
      <b-button
        variant="light"
        class="px-2 ml-auto"
        :disabled="disabled"
        @click="file = null"
        ><icon-close :title="$t('global.fileUpload.clearSelectedFile')" /><span
          class="sr-only"
          >{{ $t('global.fileUpload.clearSelectedFile') }}</span
        >
      </b-button>
    </div>
  </div>
</template>

<script>
import { BFormFile } from 'bootstrap-vue';
import IconClose from '@carbon/icons-vue/es/close/20';
import IconImport from '../icons/IconImport.vue';

export default {
  name: 'FormFile',
  components: { BFormFile, IconClose, IconImport },
  props: {
    id: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    accept: {
      type: String,
      default: '',
    },
    state: {
      type: Boolean,
      default: true,
    },
    variant: {
      type: String,
      default: 'secondary',
    },
  },
  data() {
    return {
      file: null,
    };
  },
  computed: {
    isSecondary() {
      return this.variant === 'secondary';
    },
  },
};
</script>

<style lang="scss" scoped>
.form-control-file {
  opacity: 0;
  height: 0;
  &:focus + span {
    box-shadow:
      inset 0 0 0 3px theme-color('primary'),
      inset 0 0 0 5px $white;
  }
}

// Get mouse pointer on complete element
.add-file-btn {
  position: relative;
  padding: clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem)
    clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem)
    clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem)
    clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem);
  font-size: clamp(0.875rem, 0.3631rem + 0.6349vw, 1.125rem);
  background-color: $btn-background;
  border-radius: 20px;

  &:hover {
    background-color: $main-color;
    color: $white;
  }

  &.disabled {
    border-color: gray('400');
    background-color: gray('400');
    color: gray('600');
    box-shadow: none !important;
  }
}

.clear-selected-file {
  display: flex;
  align-items: center;
  background-color: theme-color('light');
  border-radius: 15px;
  font-size: clamp(0.875rem, 0.3631rem + 0.6349vw, 1.125rem);
  .btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;

    &:focus {
      box-shadow: inset 0 0 0 2px theme-color('primary');
    }
  }
}

.btn svg {
  margin-right: 0;
}

.icon-box {
  margin-right: clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem);
}
</style>
