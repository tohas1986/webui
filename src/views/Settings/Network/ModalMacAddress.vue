<template>
  <b-modal
    id="modal-mac-address"
    ref="modal"
    size="lg"
    centered
    :title="$t('pageNetwork.modal.editMacAddressTitle')"
    @hidden="resetForm"
  >
    <b-form id="mac-settings" @submit.prevent="handleSubmit">
      <b-row>
        <b-col sm="4" class="align-content-center">
          <label for="macAddress">{{ $t('pageNetwork.macAddress') }}</label>
        </b-col>
        <b-col sm="8">
          <b-form-group>
            <b-form-input
              id="mac-address"
              v-model.trim="form.macAddress"
              data-test-id="network-input-macAddress"
              type="text"
              :state="getValidationState($v.form.macAddress)"
              @change="$v.form.macAddress.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <div v-if="!$v.form.macAddress.required">
                {{ $t('global.form.fieldRequired') }}
              </div>
              <div v-if="!$v.form.macAddress.macAddress">
                {{ $t('global.form.invalidFormat') }}
              </div>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        form="mac-settings"
        type="submit"
        variant="primary"
        @click="onOk"
      >
        {{ $t('global.action.add') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { macAddress, required } from 'vuelidate/lib/validators';

export default {
  mixins: [VuelidateMixin],
  props: {
    macAddress: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      form: {
        macAddress: '',
      },
    };
  },
  watch: {
    macAddress() {
      this.form.macAddress = this.macAddress;
    },
  },
  validations() {
    return {
      form: {
        macAddress: {
          required,
          macAddress: macAddress(),
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$emit('ok', { MACAddress: this.form.macAddress });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.macAddress = this.macAddress;
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
