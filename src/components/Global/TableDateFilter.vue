<template>
  <b-row>
    <b-col class="d-flex form-group-fields justify-content-end mb-3 mb-md-0">
      <b-form-group class="form-group-date">
        <label for="input-from-date" class="invisible d-none">
          {{ $t('global.table.fromDate') }}
        </label>
        <b-input-group>
          <b-form-input
            id="input-from-date"
            v-model="fromDate"
            :placeholder="$t('global.table.fromDate')"
            :state="getValidationState($v.fromDate)"
            class="form-control-with-button input-date from-date"
            @blur="$v.fromDate.$touch()"
          />
          <b-form-invalid-feedback role="alert">
            <template v-if="!$v.fromDate.pattern">
              {{ $t('global.form.invalidFormat') }}
            </template>
            <template v-if="!$v.fromDate.maxDate">
              {{ $t('global.form.dateMustBeBefore', { date: toDate }) }}
            </template>
          </b-form-invalid-feedback>
          <b-form-datepicker
            v-model="fromDate"
            class="btn-datepicker btn-icon-only"
            button-only
            right
            :max="toDate"
            :hide-header="true"
            :locale="locale"
            :label-help="
              $t('global.calendar.useCursorKeysToNavigateCalendarDates')
            "
            :title="$t('global.calendar.selectDate')"
            button-variant="link"
            aria-controls="input-from-date"
          >
            <template #button-content>
              <icon-calendar />
              <span class="sr-only">
                {{ $t('global.calendar.selectDate') }}
              </span>
            </template>
          </b-form-datepicker>
        </b-input-group>
      </b-form-group>
      <b-form-group class="form-group-date">
        <label for="input-to-date" class="invisible d-none">
          {{ $t('global.table.toDate') }}
        </label>
        <b-input-group>
          <b-form-input
            id="input-to-date"
            v-model="toDate"
            :placeholder="$t('global.table.toDate')"
            :state="getValidationState($v.toDate)"
            class="form-control-with-button input-date to-date"
            @blur="$v.toDate.$touch()"
          />
          <b-form-invalid-feedback role="alert">
            <template v-if="!$v.toDate.pattern">
              {{ $t('global.form.invalidFormat') }}
            </template>
            <template v-if="!$v.toDate.minDate">
              {{ $t('global.form.dateMustBeAfter', { date: fromDate }) }}
            </template>
          </b-form-invalid-feedback>
          <b-form-datepicker
            v-model="toDate"
            class="btn-datepicker btn-icon-only"
            button-only
            right
            :min="fromDate"
            :hide-header="true"
            :locale="locale"
            :label-help="
              $t('global.calendar.useCursorKeysToNavigateCalendarDates')
            "
            :title="$t('global.calendar.selectDate')"
            button-variant="link"
            aria-controls="input-to-date"
          >
            <template #button-content>
              <icon-calendar />
              <span class="sr-only">
                {{ $t('global.calendar.selectDate') }}
              </span>
            </template>
          </b-form-datepicker>
        </b-input-group>
      </b-form-group>
    </b-col>
  </b-row>
</template>

<script>
import IconCalendar from '@/components/icons/IconCalendar';
import { helpers } from 'vuelidate/lib/validators';

import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

const isoDateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;

export default {
  components: { IconCalendar },
  mixins: [VuelidateMixin],
  data() {
    return {
      fromDate: '',
      toDate: '',
      offsetToDate: '',
      locale: this.$store.getters['global/languagePreference'],
    };
  },
  validations() {
    return {
      fromDate: {
        pattern: helpers.regex('pattern', isoDateRegex),
        maxDate: (value) => {
          if (!this.toDate) return true;
          const date = new Date(value);
          const maxDate = new Date(this.toDate);
          if (date.getTime() > maxDate.getTime()) return false;
          return true;
        },
      },
      toDate: {
        pattern: helpers.regex('pattern', isoDateRegex),
        minDate: (value) => {
          if (!this.fromDate) return true;
          const date = new Date(value);
          const minDate = new Date(this.fromDate);
          if (date.getTime() < minDate.getTime()) return false;
          return true;
        },
      },
    };
  },
  watch: {
    fromDate() {
      this.emitChange();
    },
    toDate(newVal) {
      // Offset the end date to end of day to make sure all
      // entries from selected end date are included in filter
      this.offsetToDate = new Date(newVal).setUTCHours(23, 59, 59, 999);
      this.emitChange();
    },
  },
  methods: {
    emitChange() {
      if (this.$v.$invalid) return;
      this.$v.$reset(); //reset to re-validate on blur
      this.$emit('change', {
        fromDate: this.fromDate ? new Date(this.fromDate) : null,
        toDate: this.toDate ? new Date(this.offsetToDate) : null,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.input-date {
  padding-left: 1.5625rem;
  padding-right: 1.5625rem;
  padding-top: 0.9375rem;
  padding-bottom: 0.9375rem;
  min-width: clamp(11.563rem, 0.045rem + 14.29vw, 17.188rem);
}

.input-date.from-date {
  border-radius: 15px 0 0 15px;
  @include media-breakpoint-down(xs) {
    border-radius: 15px;
  }
}

.input-date.to-date {
  border-radius: 0 15px 15px 0;
  @include media-breakpoint-down(xs) {
    border-radius: 15px;
  }
}

.btn-datepicker {
  top: 0;
  bottom: 0;
}

.btn-link {
  color: $main-color;
}

.form-group-date {
  @include media-breakpoint-down(sm) {
    width: 50%;
    margin-bottom: 0;
  }
  @include media-breakpoint-down(xs) {
    width: 100%;
  }
}

.form-group-fields {
  flex-direction: row;
  @include media-breakpoint-only(xs) {
    flex-direction: column;
    gap: 1rem;
  }
}

::v-deep .b-form-datepicker .dropdown-menu {
  @include media-breakpoint-down(sm) {
    top: 100% !important;
    left: auto !important;
    right: 0;
    transform: none !important;
  }
}
</style>
