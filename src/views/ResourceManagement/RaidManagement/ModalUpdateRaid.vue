<template>
  <b-modal
    id="update-raid"
    ref="modal"
    size="xl"
    centered
    @ok="onOk"
    @hidden="resetForm"
  >
    <template #modal-title>
      {{ $t('pageRaidManagement.modal.updateTitle') }}
    </template>
    <b-form>
      <b-row class="mb-3">
        <b-col sm="5">
          <label for="firmware-type">
            {{ $t('pageRaidManagement.modal.firmwareType') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-select
              id="firmware-type"
              v-model="form.firmwareType"
              :options="firmwareOptions"
              :state="getValidationState($v.form.firmwareType)"
              @input="$v.form.firmwareType.$touch()"
            >
              <template #first>
                <b-form-select-option :value="null" disabled>
                  {{ $t('global.form.selectAnOption') }}
                </b-form-select-option>
              </template>
            </b-select>
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.firmwareType.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="5">
          <label>
            {{ $t('pageRaidManagement.modal.firmwareFile') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <form-file
              id="firmware-file"
              v-model="form.file"
              :state="getValidationState($v.form.file)"
            >
              <template #invalid>
                <b-form-invalid-feedback role="alert">
                  {{ $t('global.form.required') }}
                </b-form-invalid-feedback>
              </template></form-file
            >
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
  </b-modal>
</template>

<script>
import FormFile from '@/components/Global/FormFile';
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  components: { FormFile },
  mixins: [VuelidateMixin],
  props: {
    update: {
      type: Object,
      default: null,
      validator: (prop) => {
        console.log(prop);
        return true;
      },
    },
  },
  data() {
    return {
      form: {
        firmwareType: null,
        file: null,
      },
      firmwareOptions: [
        { value: 'FLASH', text: 'FLASH' },
        { value: 'BIOS', text: 'BIOS' },
        { value: 'FCODE', text: 'FCODE' },
        { value: 'UEFI', text: 'UEFI' },
      ],
    };
  },
  validations() {
    return {
      form: {
        firmwareType: {
          required,
        },
        file: {
          required,
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$emit('ok', {
        file: this.form.file,
        type: this.form.firmwareType,
        id: this.update.id,
      });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.firmwareType = null;
      this.form.file = null;
      this.$v.$reset();
    },
    onOk(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
