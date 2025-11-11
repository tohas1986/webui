<template>
  <b-modal id="session-settings" ref="modal" size="lg" centered @ok="onOk">
    <template #modal-title>
      {{ $t('pageSessions.modal.sessionSettingsTitle') }}
    </template>
    <b-form>
      <b-row v-if="isKvmTotalSessionsVisible" class="mb-2">
        <b-col sm="5">
          <label>
            {{ $t('pageSessions.maxKvmTotalSessions') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-checkbox
              v-model="kvmTotalSessionsUnlimitedLocal"
              class="mb-2"
              switch
            >
              {{ $t('global.status.unlimited') }}
            </b-form-checkbox>
            <b-form-input
              v-model.number="form.maxKvmTotalSessionsLocal"
              type="number"
              :disabled="kvmTotalSessionsUnlimitedLocal"
              :state="getValidationState($v.form.maxKvmTotalSessionsLocal)"
              @input="$v.form.maxKvmTotalSessionsLocal.$touch()"
            />
            <b-form-invalid-feedback
              v-if="
                $v.form.maxKvmTotalSessionsLocal.$dirty &&
                $v.form.maxKvmTotalSessionsLocal.$invalid
              "
              role="alert"
            >
              <template v-if="!$v.form.maxKvmTotalSessionsLocal.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-else-if="!$v.form.maxKvmTotalSessionsLocal.minValue">
                {{ $t('pageSessions.form.minValue', { min: 1 }) }}
              </template>
              <template v-else-if="!$v.form.maxKvmTotalSessionsLocal.maxValue">
                {{ $t('pageSessions.form.maxValue', { max: 99 }) }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row v-if="isKvmControlSessionsVisible" class="mb-2">
        <b-col sm="5" class="policies-item">
          <dl class="w-100">
            <label>
              {{ $t('pageSessions.maxKvmControlSessions') }}
            </label>
          </dl>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-checkbox
              v-model="kvmControlSessionsUnlimitedLocal"
              class="mb-2"
              switch
            >
              {{ $t('global.status.unlimited') }}
            </b-form-checkbox>
            <b-form-input
              v-model.number="form.maxKvmControlSessionsLocal"
              type="number"
              :disabled="kvmControlSessionsUnlimitedLocal"
              :state="getValidationState($v.form.maxKvmControlSessionsLocal)"
              @input="$v.form.maxKvmControlSessionsLocal.$touch()"
            />
            <b-form-invalid-feedback
              v-if="
                $v.form.maxKvmControlSessionsLocal.$dirty &&
                $v.form.maxKvmControlSessionsLocal.$invalid
              "
              role="alert"
            >
              <template v-if="!$v.form.maxKvmControlSessionsLocal.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template
                v-else-if="!$v.form.maxKvmControlSessionsLocal.minValue"
              >
                {{ $t('pageSessions.form.minValue', { min: 1 }) }}
              </template>
              <template
                v-else-if="!$v.form.maxKvmControlSessionsLocal.maxValue"
              >
                {{
                  $t('pageSessions.form.maxValue', {
                    max:
                      form.maxKvmTotalSessionsLocal > 99
                        ? 99
                        : form.maxKvmTotalSessionsLocal,
                  })
                }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="5" class="d-flex justify-content-between">
          <dl class="w-100">
            <label>
              {{ $t('pageSessions.webSessionTimeOut') }}
            </label>
          </dl>
        </b-col>
        <b-col sm="7">
          <b-form-select
            id="session-timeout-options"
            v-model="sessionTimeoutStateLocal"
            class="w-50"
            :options="sessionTimeOutOptions"
          >
            <template #first>
              <b-form-select-option :value="null" disabled>
                {{ $t('global.form.selectAnOption') }}
              </b-form-select-option>
            </template>
          </b-form-select>
        </b-col>
      </b-row>
    </b-form>
    <template #modal-ok>
      {{ $t('global.action.save') }}
    </template>
    <template #modal-cancel>
      {{ $t('global.action.cancel') }}
    </template>
  </b-modal>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { maxValue, minValue } from 'vuelidate/lib/validators';

export default {
  mixins: [VuelidateMixin, BVToastMixin],
  data() {
    return {
      form: {
        maxKvmTotalSessionsLocal: 0,
        maxKvmControlSessionsLocal: 0,
      },
      kvmTotalSessionsUnlimitedLocal: false,
      kvmControlSessionsUnlimitedLocal: false,
      sessionTimeOutOptions: [
        { value: 1800, text: this.$t('pageSessions.options.30minutes') },
        { value: 3600, text: this.$t('pageSessions.options.1hour') },
        { value: 7200, text: this.$t('pageSessions.options.2hours') },
        { value: 14400, text: this.$t('pageSessions.options.4hours') },
        { value: 28800, text: this.$t('pageSessions.options.8hours') },
        { value: 86400, text: this.$t('pageSessions.options.1day') },
      ],
      sessionTimeoutStateLocal: null,
    };
  },
  computed: {
    maxKvmTotalSessions() {
      return this.$store.getters['sessions/maxKvmTotalSessions'];
    },
    maxKvmControlSessions() {
      return this.$store.getters['sessions/maxKvmControlSessions'];
    },
    isKvmControlSessionsVisible() {
      return typeof this.maxKvmControlSessions === 'number';
    },
    isKvmTotalSessionsVisible() {
      return typeof this.maxKvmTotalSessions === 'number';
    },
  },
  watch: {
    maxKvmTotalSessions: {
      immediate: true,
      handler(val) {
        this.kvmTotalSessionsUnlimitedLocal = val === 0;
        this.form.maxKvmTotalSessionsLocal = val > 0 ? val : 0;
      },
    },
    maxKvmControlSessions: {
      immediate: true,
      handler(val) {
        this.kvmControlSessionsUnlimitedLocal = val === 0;
        this.form.maxKvmControlSessionsLocal = val > 0 ? val : 0;
      },
    },
  },
  validations() {
    return {
      form: {
        maxKvmTotalSessionsLocal: {
          required,
          minValue: this.kvmTotalSessionsUnlimitedLocal
            ? minValue(0)
            : minValue(1),
          maxValue: maxValue(99),
        },
        maxKvmControlSessionsLocal: {
          required,
          minValue:
            this.kvmControlSessionsUnlimitedLocal ||
            this.kvmTotalSessionsUnlimitedLocal
              ? minValue(0)
              : minValue(1),
          maxValue: this.kvmTotalSessionsUnlimitedLocal
            ? maxValue(99)
            : maxValue(Math.min(this.form.maxKvmTotalSessionsLocal, 99)),
        },
      },
    };
  },
  created() {
    Promise.all([
      this.$store.dispatch('sessions/getSessionService'),
      this.$store.dispatch('sessions/getSessionTimeout'),
    ]).then(() => {
      this.sessionTimeoutStateLocal =
        this.$store.getters['sessions/getSessionTimeoutValue'];
    });
  },
  methods: {
    async handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;

      const totalSessionsChanged =
        this.maxKvmTotalSessions !==
        (this.kvmTotalSessionsUnlimitedLocal
          ? 0
          : Number(this.form.maxKvmTotalSessionsLocal));
      const controlSessionsChanged =
        this.maxKvmControlSessions !==
        (this.kvmControlSessionsUnlimitedLocal
          ? 0
          : Number(this.form.maxKvmControlSessionsLocal));
      const sessionTimeoutChanged =
        this.sessionTimeoutStateLocal !==
        this.$store.getters['sessions/getSessionTimeoutValue'];

      const promises = [];

      if (totalSessionsChanged) {
        promises.push(this.saveKvmTotalSessions());
      }

      if (controlSessionsChanged) {
        promises.push(this.saveKvmControlSessions());
      }

      if (sessionTimeoutChanged) {
        promises.push(
          this.saveSessionTimeoutValue(this.sessionTimeoutStateLocal),
        );
      }

      try {
        await Promise.all(promises);
        if (
          totalSessionsChanged ||
          controlSessionsChanged ||
          sessionTimeoutChanged
        ) {
          this.successToast(this.$t('pageSessions.toast.successUpdate'));
        }
        this.closeModal();
      } catch (error) {
        this.errorToast(error.message || error);
      }
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    onOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
    getValidationState(validation) {
      return validation.$dirty ? !validation.$invalid : null;
    },
    async saveKvmTotalSessions() {
      this.$v.form.maxKvmTotalSessionsLocal.$touch();
      if (this.$v.form.maxKvmTotalSessionsLocal.$invalid) return;
      const value = this.kvmTotalSessionsUnlimitedLocal
        ? 0
        : Number(this.form.maxKvmTotalSessionsLocal);
      this.$store
        .dispatch('sessions/saveMaxKvmTotalSessions', value)
        .catch((error) => this.errorToast(error.message || error));
    },
    async saveKvmControlSessions() {
      this.$v.form.maxKvmControlSessionsLocal.$touch();
      if (this.$v.form.maxKvmControlSessionsLocal.$invalid) return;
      const value = this.kvmControlSessionsUnlimitedLocal
        ? 0
        : Number(this.form.maxKvmControlSessionsLocal);
      this.$store
        .dispatch('sessions/saveMaxKvmControlSessions', value)
        .catch((error) => this.errorToast(error.message || error));
    },
    async saveSessionTimeoutValue(val) {
      this.$store
        .dispatch('sessions/saveSessionTimeoutValue', Number(val))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
<style lang="scss" scoped>
.mb-3 {
  @include media-breakpoint-down(sm) {
    margin-bottom: 0 !important;
  }
}
.checkbox-container {
  @include media-breakpoint-down(xs) {
    flex-wrap: nowrap;
  }

  .col-sm-7 {
    @include media-breakpoint-down(xs) {
      width: max-content;
    }
  }
}
</style>
