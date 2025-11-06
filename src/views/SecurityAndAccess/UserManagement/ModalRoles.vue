<template>
  <b-modal id="modal-role" ref="modal" size="lg" centered @hidden="resetForm">
    <template #modal-title>
      {{ $t('pageUserManagement.addRole') }}
    </template>
    <b-form
      id="form-user"
      class="form-user"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <b-row class="mb-3">
        <b-col sm="5">
          <label for="roleId">
            {{ $t('pageUserManagement.modal.roleId') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-input
              id="roleId"
              v-model="form.roleId"
              type="text"
              aria-describedby="username-help-block"
              :state="getValidationState($v.form.roleId)"
              @input="$v.form.roleId.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <template v-if="!$v.form.roleId.required">
                {{ $t('global.form.fieldRequired') }}
              </template>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col sm="5">
          <label for="ipmi">
            {{ $t('pageUserManagement.modal.ipmi') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-select
              id="ipmi"
              v-model="form.ipmi"
              :options="ipmiTypes"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3 checkbox-container">
        <b-col sm="5">
          <label for="kvm-access">
            {{ $t('pageUserManagement.modal.kvmAccess') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-checkbox
              id="kvm-access"
              v-model="form.kvmAccess"
              value="KVMAccess"
              unchecked-value=""
            >
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3 checkbox-container">
        <b-col sm="5">
          <label for="network-protocol-read">
            {{ $t('pageUserManagement.modal.networkProtocolRead') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-checkbox
              id="network-protocol-read"
              v-model="form.networkProtocolRead"
              value="NetworkProtocolRead"
              unchecked-value=""
            >
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3 checkbox-container">
        <b-col sm="5">
          <label for="network-protocol-modify ">
            {{ $t('pageUserManagement.modal.networkProtocolModify') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-checkbox
              id="network-protocol-modify "
              v-model="form.networkProtocolModify"
              value="NetworkProtocolModify"
              unchecked-value=""
            >
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3 checkbox-container">
        <b-col sm="5">
          <label for="virtual-media-read">
            {{ $t('pageUserManagement.modal.virtualMediaRead') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-checkbox
              id="virtual-media-read "
              v-model="form.virtualMediaRead"
              value="VirtualMediaRead"
              unchecked-value=""
            >
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-3 checkbox-container">
        <b-col sm="5">
          <label for="virtual-media-modify ">
            {{ $t('pageUserManagement.modal.virtualMediaModify') }}
          </label>
        </b-col>
        <b-col sm="7">
          <b-form-group>
            <b-form-checkbox
              id="virtual-media-modify "
              v-model="form.virtualMediaModify"
              value="VirtualMediaModify"
              unchecked-value=""
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
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
export default {
  mixins: [VuelidateMixin],
  data() {
    return {
      form: {
        roleId: '',
        ipmi: '',
        login: 'Login',
        kvmAccess: '',
        networkProtocolRead: '',
        networkProtocolModify: '',
        virtualMediaRead: '',
        virtualMediaModify: '',
      },
      ipmiTypes: [
        { value: '', text: this.$t('pageUserManagement.modal.noIpmi') },
        { value: 'ipmi-admin', text: 'ipmi-admin' },
        { value: 'ipmi-user', text: 'ipmi-user' },
      ],
    };
  },
  validations() {
    return {
      form: {
        roleId: {
          required,
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      let privilege = [];
      let rolesData = {};

      privilege.push(
        this.form.login,
        this.form.ipmi,
        this.form.kvmAccess,
        this.form.networkProtocolRead,
        this.form.networkProtocolModify,
        this.form.virtualMediaRead,
        this.form.virtualMediaModify
      );

      rolesData.RoleId = this.form.roleId;
      rolesData.AssignedPrivileges = privilege.filter((n) => n);

      this.$emit('ok', { rolesData });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.roleId = '';
      this.form.ipmi = '';
      this.form.kvmAccess = '';
      this.form.networkProtocolRead = '';
      this.form.networkProtocolModify = '';
      this.form.virtualMediaRead = '';
      this.form.virtualMediaModify = '';
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
</style>
