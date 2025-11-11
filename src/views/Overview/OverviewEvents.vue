<template>
  <b-card>
    <div class="card-text">
      <h3 class="mb-0">{{ $t('pageOverview.alarmStatistics') }}</h3>
      <b-link class="card-link" :to="eventsLink"
        >{{ $t('pageOverview.information') }}
        <icon-chevron />
      </b-link>
    </div>
    <div>
      <div class="events">
        <div
          :class="['events-container', isHeightCritical, backgroundCritical]"
        >
          <p class="h2 events-text">
            {{ dataFormatter(criticalEvents.length) }}
            <status-color :status="criticalColor" />
          </p>
          <p class="h6 events-status-text">
            {{ $t('pageOverview.criticalEvents') }}
          </p>
        </div>
        <div :class="['events-container', isHeightWarning, backgroundWarning]">
          <p class="h2 events-text">
            {{ dataFormatter(warningEvents.length) }}
            <status-color :status="warningColor" />
          </p>
          <p class="h6 events-status-text">
            {{ $t('pageOverview.warningEvents') }}
          </p>
        </div>
      </div>
      <b-button
        class="events-button"
        :disabled="eventLogData.length === 0"
        :href="href"
        :download="exportFileNameByDate()"
      >
        <span class="events-button-text">{{
          $t('global.action.exportAll')
        }}</span>
        <span class="icon-box"><icon-download /></span
      ></b-button>
    </div>
  </b-card>
</template>

<script>
import StatusColor from '@/components/Global/StatusColor';
import IconDownload from '@/components/icons/IconDownload';
import IconChevron from '@carbon/icons-vue/es/chevron--right/16';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'Events',
  components: { StatusColor, IconDownload, IconChevron },
  mixins: [DataFormatterMixin],
  data() {
    return {
      criticalColor: 'danger',
      warningColor: 'warning',
      eventsLink: '/logs/event-logs',
    };
  },
  computed: {
    eventLogData() {
      return this.$store.getters['eventLog/allEvents'];
    },
    criticalEvents() {
      return this.eventLogData
        .filter(
          (log) =>
            log.severity === 'Critical' && log.filterByStatus === 'Unresolved',
        )
        .map((log) => {
          return log;
        });
    },
    warningEvents() {
      return this.eventLogData
        .filter(
          (log) =>
            log.severity === 'Warning' && log.filterByStatus === 'Unresolved',
        )
        .map((log) => {
          return log;
        });
    },
    backgroundWarning() {
      if (this.warningEvents.length > 0) {
        return 'background-warning';
      }
      return '';
    },
    backgroundCritical() {
      if (this.criticalEvents.length > 0) {
        return 'background-critical';
      }
      return '';
    },
    isHeightCritical() {
      if (this.criticalEvents.length > 0) {
        return 'max-height';
      }
      return '';
    },
    isHeightWarning() {
      if (this.warningEvents.length > 0) {
        return 'max-height';
      }
      return '';
    },
    dataForExport() {
      return JSON.stringify(this.eventLogData);
    },
    href() {
      return `data:text/json;charset=utf-8,${this.dataForExport}`;
    },
  },
  created() {
    this.$store.dispatch('eventLog/getEventLogData').finally(() => {
      this.$root.$emit('overview-events-complete');
    });
  },
  methods: {
    exportFileNameByDate(value) {
      let date = new Date();
      date =
        date.toISOString().slice(0, 10) +
        '_' +
        date.toString().split(':').join('-').split(' ')[4];
      let fileName;
      if (value === 'export') {
        fileName = 'event_log_';
      } else {
        fileName = 'all_event_logs_';
      }
      return fileName + date;
    },
  },
};
</script>

<style lang="scss" scoped>
.status-icon {
  vertical-align: text-top;
}

.card {
  min-height: clamp(15.063rem, -0.1651rem + 18.8876vw, 22.5rem);
  border-radius: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);

  @media (max-width: 1100px) {
    min-height: unset;
    height: auto;
  }

  @include media-breakpoint-down(md) {
    min-height: clamp(15.063rem, -0.1651rem + 18.8876vw, 22.5rem);
  }

  @include media-breakpoint-down(sm) {
    min-height: unset;
    height: auto;
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: clamp(1.625rem, -0.1667rem + 2.2222vw, 2.5rem);
  padding-left: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  padding-right: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  padding-bottom: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
}

.events {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 0.3125rem;

  @media (min-width: 1930px) {
    grid-gap: 1.25rem;
  }

  .background-critical {
    background-color: rgba($error-color, 0.2);
  }

  .background-warning {
    background-color: rgba($warning-color, 0.2);
  }
}

.events-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-self: flex-end;
  padding-top: clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem);
  padding-left: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  padding-right: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  padding-bottom: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  border: solid 1px $gray-border;
  border-radius: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  background-color: transparent;

  .events-text {
    display: flex;
  }

  .events-status-text {
    word-break: break-all;
  }

  .status-color {
    margin-left: auto;
    margin-top: 3px;
  }
}

.events-button {
  justify-content: space-between;
  margin-top: clamp(0.375rem, -0.1369rem + 0.6349vw, 0.625rem);
  width: 100%;
  font-size: clamp(0.625rem, 0.1131rem + 0.6349vw, 0.875rem);
  background-color: $gray-light;
  color: $main-color;
  border-color: transparent;
  border-radius: 20px;
  padding: clamp(0.188rem, -0.068rem + 0.3175vw, 0.313rem)
    clamp(0.188rem, -0.068rem + 0.3175vw, 0.313rem)
    clamp(0.188rem, -0.068rem + 0.3175vw, 0.313rem)
    clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);

  svg {
    margin-right: 0;
  }

  &:hover {
    background-color: $main-color;
    color: $white;
  }

  &:disabled {
    pointer-events: none;
  }
}

.btn.disabled,
.btn:disabled {
  opacity: 0.4;
}

.max-height {
  min-height: clamp(6.563rem, -0.0918rem + 8.254vw, 9.813rem);
}

.card-text {
  padding-left: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  padding-right: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
}

.events-button-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.card-link {
  word-break: break-all;
  white-space: wrap;
}
</style>
