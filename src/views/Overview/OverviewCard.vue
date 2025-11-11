<template>
  <b-card>
    <div class="card-text">
      <h3 class="mb-0">{{ title }}</h3>

      <b-link class="card-link" :to="to"
        >{{ $t('pageOverview.moreInfo') }}
        <icon-chevron />
      </b-link>
    </div>

    <slot></slot>
  </b-card>
</template>

<script>
import IconChevron from '@carbon/icons-vue/es/chevron--right/16';

export default {
  name: 'OverviewCard',
  components: { IconChevron },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: true,
    },
    downloadButton: {
      type: Boolean,
      default: false,
    },
    exportButton: {
      type: Boolean,
      default: false,
    },

    fileName: {
      type: String,
      default: 'data',
    },
    title: {
      type: String,
      default: '',
    },
    to: {
      type: String,
      default: '/',
    },
  },
  computed: {
    dataForExport() {
      return JSON.stringify(this.data);
    },
    download() {
      return `${this.fileName}.json`;
    },
    href() {
      return `data:text/json;charset=utf-8,${this.dataForExport}`;
    },
  },
};
</script>

<style lang="scss" scoped>
a {
  vertical-align: middle;
}

.card {
  background-color: transparent;
}

.card-body {
  display: flex;
  padding: clamp(1.625rem, -0.1667rem + 2.2222vw, 2.5rem) 0;
  border-top: 1px solid $gray-border;

  @include media-breakpoint-down(sm) {
    flex-wrap: wrap;
  }
}

.card-info {
  @include media-breakpoint-down(sm) {
    margin-left: 0 !important;
    margin-top: 10px;
  }
}

.card-text {
  @include media-breakpoint-down(sm) {
    flex: 0 0 100% !important;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.card-link {
  @include media-breakpoint-down(sm) {
    margin-right: -5px;
  }
}

dl {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

dl dt {
  @include media-breakpoint-down(sm) {
    max-width: 50%;
  }
}

dl dd {
  text-align: right;
  word-break: break-all;
}

.card-text {
  flex: 0 0 20%;
}

.card-info {
  flex: 0 1 100%;
  margin-left: 40px;
}
</style>
