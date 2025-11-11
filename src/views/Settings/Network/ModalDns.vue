<template>
  <b-modal
    id="modal-dns"
    ref="modal"
    size="lg"
    centered
    :title="modalTitle"
    @shown="onShown"
    @hidden="resetForm"
    @ok="onOk"
  >
    <b-form id="form-dns" @submit.prevent="handleSubmit">
      <b-row>
        <b-col sm="4" class="align-content-center">
          <label for="staticDns">{{ $t('pageNetwork.modal.staticDns') }}</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input
              id="staticDns"
              v-model="form.staticDns"
              type="text"
              :state="getValidationState($v.form.staticDns)"
              @input="$v.form.staticDns.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.staticDns.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
              <template v-if="!$v.form.staticDns.ipAddress">
                {{ $t('global.form.invalidFormat') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button form="form-dns" type="submit" variant="primary" @click="onOk">
        {{ isEdit ? $t('global.action.save') : $t('global.action.add') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { ipAddress, required } from 'vuelidate/lib/validators';

export default {
  mixins: [VuelidateMixin],
  props: {
    isEdit: { type: Boolean, default: false },
    initialValue: { type: String, default: '' },
  },
  data() {
    return {
      form: {
        staticDns: null,
      },
    };
  },
  computed: {
    modalTitle() {
      return this.isEdit
        ? this.$t('pageNetwork.table.editDnsAddress')
        : this.$t('pageNetwork.table.addDnsAddress');
    },
  },
  watch: {
    initialValue(val) {
      this.form.staticDns = val;
    },
  },
  validations() {
    return {
      form: {
        staticDns: {
          required,
          ipAddress,
        },
      },
    };
  },
  methods: {
    onShown() {
      if (this.initialValue) {
        this.form.staticDns = this.initialValue;
      }
    },
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$emit('ok', [this.form.staticDns]);
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.staticDns = null;
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
