<template>
  <b-modal
    id="modal-password"
    ref="modal"
    size="lg"
    centered
    @hidden="resetForm"
  >
    <template #modal-title>
      {{ $t('pageUserManagement.modal.passwordSettingsTitle') }}
    </template>
    <b-form
      id="form-password"
      class="form-user"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <b-row class="mb-3">
        <b-col sm="5">
          <label for="min-password-length">
            {{ $t('pageUserManagement.modal.minPasswordLength') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-input
              id="min-password-length"
              v-model="form.minPasswordLength"
              type="number"
              :state="getValidationState($v.form.minPasswordLength)"
            />
            <b-form-invalid-feedback
              v-if="!$v.form.minPasswordLength.minLessOrEqualMax"
            >
              {{ $t('pageUserManagement.modal.minPasswordLengthError') }}
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col sm="5">
          <label for="max-password-length">
            {{ $t('pageUserManagement.modal.maxPasswordLength') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-input
              id="max-password-length"
              v-model="form.maxPasswordLength"
              type="number"
              :state="getValidationState($v.form.maxPasswordLength)"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3 checkbox-container">
        <b-col sm="5">
          <label for="digits">
            {{ $t('pageUserManagement.modal.isDigitsRequired') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-checkbox id="digits" v-model="form.minimumDigits">
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3 checkbox-container">
        <b-col sm="5">
          <label for="upper-case-chars">
            {{ $t('pageUserManagement.modal.isUpperCaseCharsRequired') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-checkbox
              id="upper-case-chars"
              v-model="form.minimumUpperCaseCharacters"
            >
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3 checkbox-container">
        <b-col sm="5">
          <label for="special-chars">
            {{ $t('pageUserManagement.modal.isSpecialCharsRequired') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-checkbox
              id="special-chars"
              v-model="form.minimumSpecialCharacters"
            >
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="userManagement-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button form="form-user" type="submit" variant="primary" @click="onOk">
        {{ $t('global.action.save') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import { minValue, maxValue } from 'vuelidate/lib/validators';

export default {
  mixins: [VuelidateMixin],
  props: {
    passwordSettings: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: {
        minPasswordLength: '',
        maxPasswordLength: '',
        minimumDigits: false,
        minimumSpecialCharacters: false,
        minimumUpperCaseCharacters: false,
      },
    };
  },
  validations() {
    return {
      form: {
        minPasswordLength: {
          minValue: minValue(8),
          maxValue: maxValue(40),
          minLessOrEqualMax(value, vm) {
            const min = Number(vm.minPasswordLength);
            const max = Number(vm.maxPasswordLength);
            if (isNaN(min) || isNaN(max)) return true;
            return min <= max;
          },
        },
        maxPasswordLength: {
          minValue: minValue(8),
          maxValue: maxValue(40),
        },
      },
    };
  },
  computed: {
    passwordRequirements() {
      return this.$store.getters['userManagement/accountPasswordRequirements'];
    },
  },
  watch: {
    passwordSettings: {
      immediate: true,
      handler(newSettings) {
        this.applyPasswordSettings(newSettings);
      },
    },
  },
  methods: {
    applyPasswordSettings(settings) {
      if (!settings) return;
      const {
        minLength,
        maxLength,
        minimumDigits,
        minimumSpecialCharacters,
        minimumUpperCaseCharacters,
      } = settings;

      this.form.minPasswordLength = minLength;
      this.form.maxPasswordLength = maxLength;
      this.form.minimumDigits = minimumDigits === 1;
      this.form.minimumSpecialCharacters = minimumSpecialCharacters === 1;
      this.form.minimumUpperCaseCharacters = minimumUpperCaseCharacters === 1;
    },
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      let minPasswordLength = Number(this.form.minPasswordLength);
      let maxPasswordLength = Number(this.form.maxPasswordLength);
      let minimumDigits = this.form.minimumDigits;
      let minimumSpecialCharacters = this.form.minimumSpecialCharacters;
      let minimumUpperCaseCharacters = this.form.minimumUpperCaseCharacters;
      this.$emit('ok', {
        minPasswordLength,
        maxPasswordLength,
        minimumDigits,
        minimumSpecialCharacters,
        minimumUpperCaseCharacters,
      });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.applyPasswordSettings(this.passwordSettings);
      this.$v.$reset();
      this.$emit('hidden');
    },
    onOk(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
<style lang="scss" scoped>
.checkbox-container {
  flex-wrap: nowrap;

  .col-sm-7 {
    @include media-breakpoint-down(xs) {
      width: max-content;
    }
  }
}

.mb-3,
.mb-3 .form-group {
  @include media-breakpoint-down(sm) {
    margin-bottom: 0 !important;
  }
}

.form-user {
  @include media-breakpoint-down(sm) {
    margin-top: 0;
  }
}

.form-group {
  position: relative;

  .invalid-feedback {
    position: absolute;
    bottom: -1rem;
    left: 0;
  }

  &:last-child {
    margin-bottom: 0.5rem;
  }
}
</style>
