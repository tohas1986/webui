<template>
  <div class="table-filter d-inline-block">
    <b-dropdown
      variant="link btn-table"
      no-caret
      right
      dropup
      data-test-id="tableFilter-dropdown-options"
      @hide="dropdownVisible = false"
      @show="dropdownVisible = true"
    >
      <template #button-content>
        <icon-filter />
        {{ filterLength }} {{ $t('global.action.filter') }}
      </template>
      <b-dropdown-form class="form-container">
        <b-form-group
          v-for="(filter, index) of filters"
          :key="index"
          :label="filter.label"
        >
          <b-form-checkbox-group v-model="tags">
            <b-form-checkbox
              v-for="value in filter.values"
              :id="value"
              :key="value"
              :value="value"
              :data-test-id="`tableFilter-checkbox-${value}`"
            >
              <label :for="value">{{ value }}</label>
            </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
      </b-dropdown-form>
      <b-dropdown-item-button
        variant="primary"
        data-test-id="tableFilter-button-clearAll"
        @click="clearAllTags"
      >
        {{ $t('global.action.clearAll') }}
      </b-dropdown-item-button>
    </b-dropdown>
  </div>
</template>

<script>
import IconFilter from '@carbon/icons-vue/es/settings--adjust/24';

export default {
  name: 'TableFilter',
  components: { IconFilter },
  props: {
    filters: {
      type: Array,
      default: () => [],
      validator: (prop) => {
        return prop.every(
          (filter) =>
            'label' in filter && 'values' in filter && 'key' in filter,
        );
      },
    },
  },
  data() {
    return {
      dropdownVisible: false,
      tags: [],
    };
  },
  computed: {
    filterLength() {
      if (this.tags.length > 0) {
        return this.tags.length;
      }
      return '';
    },
  },
  watch: {
    tags: {
      handler() {
        this.emitChange();
      },
      deep: true,
    },
  },
  methods: {
    clearAllTags() {
      this.tags = [];
    },
    emitChange() {
      const activeFilters = this.filters.map(({ key, values }) => {
        const activeValues = values.filter(
          (value) => this.tags.indexOf(value) !== -1,
        );
        return {
          key,
          values: activeValues,
        };
      });
      this.$emit('filter-change', { activeFilters });
    },
  },
};
</script>

<style lang="scss" scoped>
label {
  margin-bottom: 0;
  font-size: clamp(0.75rem, -0.0179rem + 0.9524vw, 1.125rem);
  color: $main-color;
}

.form-container {
  @include media-breakpoint-down(sm) {
    max-height: 30vh;
    overflow-y: scroll;
    max-width: 80vw;
    white-space: wrap;
    word-break: break-all;
  }
}

.b-dropdown-form {
  padding: 0;
}
</style>
