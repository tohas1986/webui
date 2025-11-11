<template>
  <b-modal
    id="modal-reset"
    ref="modal"
    size="xl"
    centered
    :title="$t(`pageConfiguration.modal.${resetType}Title`)"
    title-tag="h2"
    @hidden="resetConfirm"
  >
    <p class="mb-2">
      <strong>{{ $t(`pageConfiguration.modal.${resetType}Header`) }}</strong>
    </p>
    <ul class="pl-3 mb-4">
      <li
        v-for="(item, index) in $t(
          `pageConfiguration.modal.${resetType}SettingsList`,
        )"
        :key="index"
        class="mt-1 mb-1"
      >
        {{ $t(item) }}
      </li>
    </ul>

    <!-- Warning message -->
    <template v-if="!isServerOff">
      <p class="d-flex align-items-center mb-2">
        <status-color status="danger" />
        <span id="reset-to-default-warning" class="ml-1">
          {{ $t(`pageConfiguration.modal.resetWarningMessage`) }}
        </span>
      </p>
      <b-form-checkbox
        v-model="confirm"
        aria-describedby="reset-to-default-warning"
        @input="$v.confirm.$touch()"
      >
        {{ $t(`pageConfiguration.modal.resetWarningCheckLabel`) }}
      </b-form-checkbox>
      <b-form-invalid-feedback
        role="alert"
        :state="getValidationState($v.confirm)"
      >
        {{ $t('global.form.fieldRequired') }}
      </b-form-invalid-feedback>
    </template>

    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="factoryReset-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        type="sumbit"
        variant="primary"
        data-test-id="factoryReset-button-confirm"
        @click="handleConfirm"
      >
        {{ $t(`pageConfiguration.modal.${resetType}SubmitText`) }}
      </b-button>
    </template>
  </b-modal>
</template>
<script>
import StatusColor from '@/components/Global/StatusColor';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';

export default {
  components: { StatusColor },
  mixins: [VuelidateMixin],
  props: {
    resetType: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      confirm: false,
    };
  },
  computed: {
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    isServerOff() {
      return this.serverStatus === 'off' ? true : false;
    },
  },
  validations: {
    confirm: {
      mustBeTrue: function (value) {
        return this.isServerOff || value === true;
      },
    },
  },
  methods: {
    handleConfirm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$emit('okConfirm');
      this.$nextTick(() => this.$refs.modal.hide());
      this.resetConfirm();
    },
    resetConfirm() {
      this.confirm = false;
      this.$v.$reset();
    },
  },
};
</script>
