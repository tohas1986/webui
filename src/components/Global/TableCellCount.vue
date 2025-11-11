<template>
  <div class="cell-wrapper">
    <template v-if="!isEnabledItems">
      <p v-if="!filterActive">
        {{ $t('global.table.items', { count: totalNumberOfCells }) }}
      </p>
      <p v-else>
        {{
          $t('global.table.selectedItems', {
            count: totalNumberOfCells,
            filterCount: filteredItemsCount,
          })
        }}
      </p>
    </template>
    <template v-else>
      <p>
        {{ $t('global.table.enabledItems', { count: totalNumberOfCells }) }}
      </p>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    filteredItemsCount: {
      type: Number,
      required: true,
    },
    totalNumberOfCells: {
      type: Number,
      required: true,
    },
    isEnabledItems: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    filterActive() {
      return this.filteredItemsCount !== this.totalNumberOfCells;
    },
  },
};
</script>

<style lang="scss" scoped>
p {
  margin-bottom: clamp(1.6rem, 0.781rem + 1.016vw, 2rem);
  font-size: clamp(0.875rem, 0.3631rem + 0.6349vw, 1.125rem);
  color: rgba($main-color, 0.7);
}
.cell-wrapper {
  margin-top: 0.5rem;
  @include media-breakpoint-down(sm) {
    margin-top: 0;
  }
}
.cell-wrapper p {
  @include media-breakpoint-down(sm) {
    margin-bottom: 1rem;
  }
}
</style>
