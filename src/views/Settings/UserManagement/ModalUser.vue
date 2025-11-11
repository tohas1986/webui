<template>
  <b-modal id="modal-user" ref="modal" size="lg" centered @hidden="resetForm">
    <template #modal-title>
      <template v-if="newUser">
        {{ $t('pageUserManagement.addUser') }}
      </template>
      <template v-else>
        {{ $t('pageUserManagement.editUser') }}
      </template>
    </template>
    <b-form
      id="form-user"
      class="form-user"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <b-container>
        <b-row
          v-if="!newUser && manualUnlockPolicy && user.Locked && showFullForm"
        >
          <b-col sm="9">
            <alert :show="true" variant="warning" small>
              <template v-if="!$v.form.manualUnlock.$dirty">
                {{ $t('pageUserManagement.modal.accountLocked') }}
              </template>
              <template v-else>
                {{ $t('pageUserManagement.modal.clickSaveToUnlockAccount') }}
              </template>
            </alert>
          </b-col>
          <b-col sm="3">
            <input
              v-model="form.manualUnlock"
              data-test-id="userManagement-input-manualUnlock"
              type="hidden"
              value="false"
            />
            <b-button
              variant="primary"
              :disabled="$v.form.manualUnlock.$dirty"
              data-test-id="userManagement-button-manualUnlock"
              @click="$v.form.manualUnlock.$touch()"
            >
              {{ $t('pageUserManagement.modal.unlock') }}
            </b-button>
          </b-col>
        </b-row>

        <b-row class="mb-3">
          <b-col sm="5">
            <label class="mt-0">
              {{ $t('pageUserManagement.modal.accountStatus') }}
            </label>
          </b-col>
          <b-col sm="7">
            <b-form-group class="mt-0">
              <div class="d-flex justify-content-start gap">
                <b-form-radio
                  v-model="form.status"
                  name="user-status"
                  :value="true"
                  data-test-id="userManagement-radioButton-statusEnabled"
                  @input="$v.form.status.$touch()"
                >
                  {{ $t('global.status.enabled') }}
                </b-form-radio>
                <b-form-radio
                  v-model="form.status"
                  name="user-status"
                  data-test-id="userManagement-radioButton-statusDisabled"
                  :value="false"
                  :disabled="isOwnAccount"
                  @input="$v.form.status.$touch()"
                >
                  {{ $t('global.status.disabled') }}
                </b-form-radio>
              </div>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row v-if="showFullForm" class="mb-3">
          <b-col sm="5">
            <label for="username">
              {{ $t('pageUserManagement.modal.username') }}
            </label>
          </b-col>
          <b-col sm="7">
            <b-form-group>
              <b-form-input
                id="username"
                v-model="form.username"
                type="text"
                aria-describedby="username-help-block"
                data-test-id="userManagement-input-username"
                :state="getValidationState($v.form.username)"
                :readonly="lockUsername"
                :disabled="isOwnAccount || lockUsername"
                @input="$v.form.username.$touch()"
              />
              <b-form-text id="username-help-block">
                {{ $t('pageUserManagement.modal.cannotStartWithANumber') }}
                <br />
                {{
                  $t(
                    'pageUserManagement.modal.noSpecialCharactersExceptUnderscore',
                  )
                }}
              </b-form-text>
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.username.required">
                  {{ $t('global.form.fieldRequired') }}
                </template>
                <template v-else-if="!$v.form.username.maxLength">
                  {{
                    $t('global.form.lengthMustBeBetween', { min: 1, max: 32 })
                  }}
                </template>
                <template v-else-if="!$v.form.username.pattern">
                  {{ $t('global.form.invalidFormat') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <!-- Password -->
        <b-row v-if="showFullForm" class="mb-3">
          <b-col sm="5">
            <label for="password">
              {{ $t('pageUserManagement.modal.userPassword') }}
            </label>
          </b-col>
          <b-col sm="7">
            <b-form-group>
              <input-password-toggle>
                <b-form-input
                  id="password"
                  v-model="form.password"
                  type="password"
                  data-test-id="userManagement-input-password"
                  aria-describedby="password-help-block"
                  :state="getValidationState($v.form.password)"
                  class="form-control-with-button"
                  @input="$v.form.password.$touch()"
                />
                <b-form-text id="password-help-block">
                  {{
                    $t('pageUserManagement.modal.passwordMustBeBetween', {
                      min: passwordRequirements.minLength,
                      max: passwordRequirements.maxLength,
                    })
                  }}
                </b-form-text>
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.password.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template
                    v-if="
                      !$v.form.password.minLength || !$v.form.password.maxLength
                    "
                  >
                    {{
                      $t('pageUserManagement.modal.passwordMustBeBetween', {
                        min: passwordRequirements.minLength,
                        max: passwordRequirements.maxLength,
                      })
                    }}
                  </template>
                </b-form-invalid-feedback>
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.password.isDigitsRequired">
                    {{ $t('pageProfileSettings.isDigitsRequired') }}
                  </template>
                </b-form-invalid-feedback>
                <b-form-invalid-feedback role="alert">
                  <template
                    v-if="!$v.form.password.isSpecialCharactersRequired"
                  >
                    {{ $t('pageProfileSettings.isSpecialCharsRequired') }}
                  </template>
                </b-form-invalid-feedback>
                <b-form-invalid-feedback role="alert">
                  <template
                    v-if="!$v.form.password.isUpperCaseCharactersRequired"
                  >
                    {{ $t('pageProfileSettings.isUpperCaseCharsRequired') }}
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
          </b-col>
        </b-row>

        <!-- Confirm Password -->
        <b-row v-if="showFullForm" class="mb-3">
          <b-col sm="5">
            <label for="password-confirmation">
              {{ $t('pageUserManagement.modal.confirmUserPassword') }}
            </label>
          </b-col>
          <b-col sm="7">
            <b-form-group>
              <input-password-toggle>
                <b-form-input
                  id="password-confirmation"
                  v-model="form.passwordConfirmation"
                  data-test-id="userManagement-input-passwordConfirmation"
                  type="password"
                  :state="getValidationState($v.form.passwordConfirmation)"
                  class="form-control-with-button"
                  @input="$v.form.passwordConfirmation.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.passwordConfirmation.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template
                    v-else-if="!$v.form.passwordConfirmation.sameAsPassword"
                  >
                    {{ $t('pageUserManagement.modal.passwordsDoNotMatch') }}
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
          </b-col>
        </b-row>

        <!-- Privilege -->
        <b-row v-if="showFullForm">
          <b-col sm="5">
            <label for="privilege">
              {{ $t('pageUserManagement.modal.privilege') }}
            </label>
          </b-col>
          <b-col sm="7">
            <b-form-group>
              <b-form-select
                id="privilege"
                v-model="form.privilege"
                :options="privilegeTypes"
                data-test-id="userManagement-select-privilege"
                :state="getValidationState($v.form.privilege)"
                @input="$v.form.privilege.$touch()"
              >
                <template #first>
                  <b-form-select-option :value="null" disabled>
                    {{ $t('global.form.selectAnOption') }}
                  </b-form-select-option>
                </template>
                <b-form-select-option value="NoAccess">
                  {{ $t('pageUserManagement.modal.noAccess') }}
                </b-form-select-option>
              </b-form-select>
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.privilege.required">
                  {{ $t('global.form.fieldRequired') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
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
        <template v-if="newUser">
          {{ $t('pageUserManagement.addUser') }}
        </template>
        <template v-else>
          {{ $t('global.action.save') }}
        </template>
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import {
  required,
  maxLength,
  minLength,
  sameAs,
  helpers,
  requiredIf,
} from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import PasswordValidation from '@/components/Mixins/PasswordValidation.js';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import Alert from '@/components/Global/Alert';

export default {
  components: { Alert, InputPasswordToggle },
  mixins: [VuelidateMixin, PasswordValidation],
  props: {
    user: {
      type: Object,
      default: null,
    },
    passwordRequirements: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      originalUsername: '',
      form: {
        status: true,
        username: '',
        privilege: null,
        password: '',
        passwordConfirmation: '',
        manualUnlock: false,
      },
      disabled: this.$store.getters['global/username'],
    };
  },
  computed: {
    newUser() {
      return this.user ? false : true;
    },
    accountSettings() {
      return this.$store.getters['userManagement/accountSettings'];
    },
    manualUnlockPolicy() {
      return !this.accountSettings.accountLockoutDuration;
    },
    allPrivilege() {
      return this.$store.getters['userManagement/allAccountRoles'];
    },
    privilegeTypes() {
      return this.allPrivilege.map((p) => p.RoleId);
    },
    isOwnAccount() {
      return (
        !this.newUser &&
        this.originalUsername === this.$store.getters['global/username']
      );
    },
    isTargetRoot() {
      return !this.newUser && this.originalUsername === 'root';
    },
    isCurrentUserRoot() {
      return this.$store.getters['global/username'] === 'root';
    },
    showFullForm() {
      return this.newUser || !this.isTargetRoot || this.isCurrentUserRoot;
    },
    lockUsername() {
      return this.isTargetRoot;
    },
  },
  watch: {
    user(value) {
      if (value === null) return;
      this.originalUsername = value.username;
      this.form.username = value.username;
      this.form.status = value.Enabled;
      this.form.privilege = value.privilege ?? 'NoAccess';
    },
  },
  validations() {
    return {
      form: {
        status: { required },
        username: {
          required,
          maxLength: maxLength(32),
          pattern: helpers.regex('pattern', /^([a-zA-Z_][a-zA-Z0-9_]*)/),
        },
        privilege: { required },
        password: {
          required: requiredIf(function () {
            return this.requirePassword();
          }),
          minLength: minLength(this.passwordRequirements.minLength),
          maxLength: maxLength(this.passwordRequirements.maxLength),
          isDigitsRequired: this.minDigits(
            this.passwordRequirements.minimumDigits,
          ),
          isSpecialCharactersRequired: this.minSpecialCharacters(
            this.passwordRequirements.minimumSpecialCharacters,
          ),
          isUpperCaseCharactersRequired: this.minUpperCaseCharacters(
            this.passwordRequirements.minimumUpperCaseCharacters,
          ),
        },
        passwordConfirmation: {
          required: requiredIf(function () {
            return this.requirePassword();
          }),
          sameAsPassword: sameAs('password'),
        },
        manualUnlock: {},
      },
    };
  },
  methods: {
    handleSubmit() {
      let userData = {};

      if (this.newUser) {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        userData.username = this.form.username;
        userData.status = this.form.status;
        if (this.form.privilege !== 'NoAccess') {
          userData.privilege = this.form.privilege;
        }
        userData.password = this.form.password;
      } else {
        if (this.$v.$invalid) return;
        userData.originalUsername = this.originalUsername;

        if (this.isTargetRoot && !this.isCurrentUserRoot) {
          if (this.$v.form.status.$dirty) userData.status = this.form.status;

          if (Object.keys(userData).length === 1) {
            this.closeModal();
            return;
          }
          this.$emit('ok', { isNewUser: false, userData });
          this.closeModal();
          return;
        }

        if (this.isTargetRoot && this.isCurrentUserRoot) {
          if (this.$v.form.status.$dirty) userData.status = this.form.status;
          if (
            this.$v.form.privilege?.$dirty &&
            this.form.privilege !== 'NoAccess'
          ) {
            userData.privilege = this.form.privilege;
          }
          if (this.$v.form.password.$dirty) {
            userData.password = this.form.password;
          }
          if (this.$v.form.manualUnlock?.$dirty) {
            userData.locked = false;
          }
          if (Object.keys(userData).length === 1) {
            this.closeModal();
            return;
          }
          this.$emit('ok', { isNewUser: false, userData });
          this.closeModal();
          return;
        }

        if (this.$v.form.status.$dirty) {
          userData.status = this.form.status;
        }
        if (this.$v.form.username.$dirty) {
          userData.username = this.form.username;
        }
        if (
          this.$v.form.privilege.$dirty &&
          this.form.privilege !== 'NoAccess'
        ) {
          userData.privilege = this.form.privilege;
        }
        if (this.$v.form.password.$dirty) {
          userData.password = this.form.password;
        }
        if (this.$v.form.manualUnlock.$dirty) {
          userData.locked = false;
        }

        if (Object.entries(userData).length === 1) {
          this.closeModal();
          return;
        }
      }

      this.$emit('ok', { isNewUser: this.newUser, userData });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.originalUsername = '';
      this.form.status = true;
      this.form.username = '';
      this.form.privilege = null;
      this.form.password = '';
      this.form.passwordConfirmation = '';
      this.$v.$reset();
      this.$emit('hidden');
    },
    requirePassword() {
      if (this.newUser) return true;
      if (this.$v.form.password.$dirty) return true;
      if (this.$v.form.passwordConfirmation.$dirty) return true;
      return false;
    },
    onOk(bvModalEvt) {
      // предотвратить автозакрытие модалки
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>

<style lang="scss" scoped>
.col-sm-5,
.col-sm-7 {
  @include media-breakpoint-down(sm) {
    padding: 0;
  }
}

.mb-3 {
  @include media-breakpoint-down(sm) {
    margin-bottom: 0 !important;
  }
}

.btn {
  @include media-breakpoint-down(sm) {
    white-space: wrap;
  }
}

.gap {
  gap: 1rem;
}
</style>
