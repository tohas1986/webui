<template>
  <div class="search-global" :class="{ 'nav-search': isNavSearch }">
    <b-form-group>
      <label class="invisible d-none" :for="`searchInput-${_uid}`">
        {{ $t('global.form.search') }}
      </label>
      <b-input-group size="md" class="align-items-center">
        <icon-search class="search-icon" />

        <b-form-input
          :id="`searchInput-${_uid}`"
          ref="searchInput"
          v-model="filter"
          class="search-input"
          type="text"
          :aria-label="$t('global.form.search')"
          :placeholder="placeholder"
          @input="onChangeInput"
        >
        </b-form-input>
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script>
import IconSearch from '@carbon/icons-vue/es/search/24';

export default {
  name: 'Search',
  components: { IconSearch },
  props: {
    placeholder: {
      type: String,
      default: function () {
        return this.$t('global.form.search');
      },
    },
    isNavSearch: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      filter: null,
    };
  },
  methods: {
    onChangeInput() {
      this.$emit('change-search', this.filter);
    },
  },
};
</script>

<style lang="scss" scoped>
.search-input {
  padding-left: 1.5625rem;
  padding-right: 1.5625rem;
  padding-top: 0.9375rem;
  padding-bottom: 0.9375rem;
  min-width: clamp(13.75rem, -0.327rem + 17.46vw, 20.625rem);
}
.search-icon {
  position: absolute;
  right: 25px;
  top: 15px;
  z-index: 4;
  fill: $main-color;

  @include media-breakpoint-down(lg) {
    width: 18px;
    height: 18px;
  }
}

.input-action-btn {
  top: auto;
  right: 0;
}

.close-icon {
  top: 15px;
}

.nav-search .form-group {
  margin-bottom: 0 !important;
}

.nav-search .search-input {
  min-width: unset;
  padding: 8px 1.5625rem;
  border-color: rgba(255, 255, 255, 0.329) !important;
  background-color: transparent;
  margin: 0 clamp(0.5rem, -0.5238rem + 1.2698vw, 1rem) 0;
  color: $white !important;
}

.nav-search .search-icon {
  top: 9px;
  fill: #c8c9ca90;
}

.nav-search .close-icon {
  background-color: transparent;
  padding-right: 5px !important;
  fill: #c8c9ca90 !important;
}

.nav-search .input-action-btn {
  top: -2px;
}

.header-search .search-input:hover {
  border-color: $white !important;
}
</style>
