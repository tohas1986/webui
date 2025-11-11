<template>
  <b-modal
    id="modal-fan-profile"
    ref="modal"
    size="lg"
    centered
    @hidden="resetForm"
  >
    <template #modal-title>
      <template v-if="newProfile">
        {{ $t('pageFanProfile.addFanProfile') }}
      </template>
      <template v-else>
        {{ $t('pageFanProfile.editFanProfile') }}
      </template>
    </template>
    <b-form
      id="form-fan-profile"
      class="form-fan-profile"
      @submit.prevent="handleSubmit"
    >
      <b-row class="mb-3">
        <b-col sm="5">
          <label for="name">
            {{ $t('pageFanProfile.fanProfileName') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-input
              id="name"
              v-model="form.profilename"
              type="text"
              :state="getValidationState($v.form.profilename)"
              @input="$v.form.profilename.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.profilename.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col sm="5">
          <label for="mode">
            {{ $t('pageFanProfile.fanMode') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-select
              id="mode"
              v-model="form.mode"
              :options="modeTypes"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col sm="5">
          <label for="duty">
            {{ $t('pageFanProfile.duty') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group :disabled="dutyDisabled">
            <b-form-select id="duty" v-model="form.duty" :options="dutyTypes">
              <template #first>
                <b-form-select-option :value="null" disabled>
                  {{ $t('global.form.selectAnOption') }}
                </b-form-select-option>
              </template></b-form-select
            >
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="5">
          <label for="sensor">
            {{ $t('pageFanProfile.sensor') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group :disabled="sensorDisabled">
            <b-form-select
              id="sensor"
              v-model="form.sensor"
              :options="sensorTypes"
            ></b-form-select>
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
      <b-button
        form="form-user"
        data-test-id="userManagement-button-submit"
        type="submit"
        variant="primary"
        @click="onOk"
      >
        {{ $t('global.action.save') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { required } from 'vuelidate/lib/validators';

export default {
  name: 'ModalFanProfile',
  mixins: [VuelidateMixin],
  props: {
    profilename: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      form: {
        profilename: '',
        mode: 'auto',
        duty: null,
        sensor: 'cpu0',
      },
      modeTypes: [
        { value: 'auto', text: 'Auto' },
        { value: 'manual', text: 'Manual' },
      ],
      dutyTypes: [
        { value: 10, text: '10%' },
        { value: 30, text: '30%' },
        { value: 50, text: '50%' },
        { value: 75, text: '75%' },
        { value: 100, text: '100%' },
      ],
      sensorTypes: [
        { value: 'cpu0', text: 'CPU0' },
        { value: 'cpu0/1', text: 'CPU0/1' },
        { value: 'inlet', text: 'Inlet' },
        { value: 'outlet', text: 'Outlet' },
      ],
    };
  },
  computed: {
    newProfile() {
      return this.profilename ? false : true;
    },
    dutyDisabled() {
      if (this.form.mode === 'manual') {
        return false;
      }
      return true;
    },
    sensorDisabled() {
      if (this.form.mode === 'manual') {
        return true;
      }
      return false;
    },
  },
  watch: {
    profilename() {
      this.form.profilename = this.profilename;
    },
  },
  validations() {
    return {
      form: {
        profilename: {
          required,
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$emit('ok');
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.mode = 'auto';
      this.form.duty = null;
      this.form.sensor = 'cpu0';
      this.$emit('hidden');
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
