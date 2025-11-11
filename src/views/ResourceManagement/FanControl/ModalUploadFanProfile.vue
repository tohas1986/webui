<template>
  <b-modal
    id="upload-fan-profile"
    ref="modal"
    :title="$t('pageFanControl.modal.title')"
    size="lg"
    centered
    @ok="onOk"
    @hidden="resetForm"
  >
    <b-form>
      <b-form-group :label="$t('pageFanControl.modal.fanProfileFile')">
        <form-file
          v-model="form.file"
          :state="getValidationState($v.form.file)"
        >
          <template #invalid>
            <b-form-invalid-feedback role="alert">
              {{ $t('global.form.required') }}
            </b-form-invalid-feedback>
          </template>
        </form-file></b-form-group
      ></b-form
    >
    <template #modal-ok>
      {{ $t('global.action.import') }}
    </template>
    <template #modal-cancel>
      {{ $t('global.action.cancel') }}
    </template>
  </b-modal>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import FormFile from '@/components/Global/FormFile';

export default {
  components: { FormFile },
  mixins: [VuelidateMixin],
  data() {
    return {
      form: {
        file: null,
      },
    };
  },
  validations() {
    return {
      form: {
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
      });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
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
