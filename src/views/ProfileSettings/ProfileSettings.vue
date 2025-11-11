<template>
  <b-container fluid>
    <page-title />

    <b-row>
      <b-col sm="12">
        <div class="section-container">
          <b-row>
            <b-col sm="12" lg="4" class="profile-text">
              <h3>{{ $t('pageProfileSettings.profileInfoTitle') }}</h3>
            </b-col>
            <b-col sm="12" lg="4">
              <dl>
                <dt>{{ $t('pageProfileSettings.username') }}</dt>
                <dd class="mt-1">
                  {{ username }}
                </dd>
              </dl>
            </b-col>
          </b-row>
        </div>
      </b-col>
    </b-row>

    <b-form class="profile-form" @submit.prevent="submitForm">
      <b-row>
        <b-col sm="12">
          <div class="section-container">
            <b-row>
              <b-col sm="12" xl="4" class="profile-text profile-text--password">
                <h3>{{ $t('pageProfileSettings.changePassword') }}</h3>
              </b-col>
              <b-col sm="12" xl="8">
                <b-row>
                  <b-col sm="12" lg="4" xl="4">
                    <b-form-group
                      id="input-group-0"
                      :label="$t('pageProfileSettings.currentPassword')"
                      label-for="input-0"
                    >
                      <input-password-toggle>
                        <b-form-input
                          id="old-password"
                          v-model="form.currentPassword"
                          type="password"
                          data-test-id="profileSettings-input-ocurrentPassword"
                          class="form-control-with-button"
                        />
                      </input-password-toggle>
                    </b-form-group>
                  </b-col>
                  <b-col sm="12" lg="4" xl="4">
                    <b-form-group
                      id="input-group-1"
                      :label="$t('pageProfileSettings.newPassword')"
                      label-for="input-1"
                    >
                      <input-password-toggle>
                        <b-form-input
                          id="password"
                          v-model="form.newPassword"
                          type="password"
                          aria-describedby="password-help-block"
                          :state="getValidationState($v.form.newPassword)"
                          data-test-id="profileSettings-input-newPassword"
                          class="form-control-with-button"
                          @input="$v.form.newPassword.$touch()"
                        />
                        <b-form-text id="password-help-block">
                          {{
                            $t(
                              'pageUserManagement.modal.passwordMustBeBetween',
                              {
                                min: passwordRequirements.minLength,
                                max: passwordRequirements.maxLength,
                              },
                            )
                          }}
                        </b-form-text>
                        <b-form-invalid-feedback role="alert">
                          <template
                            v-if="
                              !$v.form.newPassword.minLength ||
                              !$v.form.newPassword.maxLength
                            "
                          >
                            {{
                              $t('pageProfileSettings.newPassLabelTextInfo', {
                                min: passwordRequirements.minLength,
                                max: passwordRequirements.maxLength,
                              })
                            }}
                          </template>
                        </b-form-invalid-feedback>
                        <b-form-invalid-feedback role="alert">
                          <template
                            v-if="!$v.form.newPassword.isDigitsRequired"
                          >
                            {{ $t('pageProfileSettings.isDigitsRequired') }}
                          </template>
                        </b-form-invalid-feedback>
                        <b-form-invalid-feedback role="alert">
                          <template
                            v-if="
                              !$v.form.newPassword.isSpecialCharactersRequired
                            "
                          >
                            {{
                              $t('pageProfileSettings.isSpecialCharsRequired')
                            }}
                          </template>
                        </b-form-invalid-feedback>
                        <b-form-invalid-feedback role="alert">
                          <template
                            v-if="
                              !$v.form.newPassword.isUpperCaseCharactersRequired
                            "
                          >
                            {{
                              $t('pageProfileSettings.isUpperCaseCharsRequired')
                            }}
                          </template>
                        </b-form-invalid-feedback>
                      </input-password-toggle>
                    </b-form-group>
                  </b-col>
                  <b-col sm="12" lg="4" xl="4">
                    <b-form-group
                      id="input-group-2"
                      :label="$t('pageProfileSettings.confirmPassword')"
                      label-for="input-2"
                    >
                      <input-password-toggle>
                        <b-form-input
                          id="password-confirmation"
                          v-model="form.confirmPassword"
                          type="password"
                          :state="getValidationState($v.form.confirmPassword)"
                          data-test-id="profileSettings-input-confirmPassword"
                          class="form-control-with-button"
                          @input="$v.form.confirmPassword.$touch()"
                        />
                        <b-form-invalid-feedback role="alert">
                          <template
                            v-if="!$v.form.confirmPassword.sameAsPassword"
                          >
                            {{ $t('pageProfileSettings.passwordsDoNotMatch') }}
                          </template>
                        </b-form-invalid-feedback>
                      </input-password-toggle>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
          </div>
        </b-col>
      </b-row>
      <div class="section-container">
        <b-row>
          <b-col sm="12" lg="4" class="profile-text">
            <h3>{{ $t('pageProfileSettings.timezoneDisplay') }}</h3>
          </b-col>
          <b-col sm="12" lg="8">
            <h3 class="mb-3">
              {{ $t('pageProfileSettings.timezoneDisplayDesc') }}
            </h3>
            <b-form-group :label="$t('pageProfileSettings.timezone')">
              <b-form-radio
                v-model="form.isUtcDisplay"
                :value="true"
                data-test-id="profileSettings-radio-defaultUTC"
              >
                {{ $t('pageProfileSettings.defaultUTC') }}
              </b-form-radio>
              <b-form-radio
                v-model="form.isUtcDisplay"
                :value="false"
                data-test-id="profileSettings-radio-browserOffset"
              >
                {{
                  $t('pageProfileSettings.browserOffset', {
                    timezone,
                  })
                }}
              </b-form-radio>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      <div class="section-container">
        <b-row>
          <b-col sm="12" lg="4" class="profile-text">
            <h3>{{ $t('pageProfileSettings.languageDisplay') }}</h3>
          </b-col>

          <b-col sm="12" lg="8">
            <h3 class="mb-3">
              {{ $t('pageProfileSettings.languageDisplayDesc') }}
            </h3>
            <b-form-group :label="$t('pageProfileSettings.language')">
              <b-form-radio v-model="form.language" :value="'ru-RU'">
                {{ $t('pageProfileSettings.ru') }}
              </b-form-radio>
              <b-form-radio v-model="form.language" :value="'en-US'">
                {{ $t('pageProfileSettings.en') }}
              </b-form-radio>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      <b-button
        variant="primary"
        class="btn-block"
        type="submit"
        data-test-id="profileSettings-button-saveSettings"
      >
        {{ $t('global.action.saveSettings') }}
      </b-button>
    </b-form>
  </b-container>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import { maxLength, minLength, sameAs } from 'vuelidate/lib/validators';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import LocalTimezoneLabelMixin from '@/components/Mixins/LocalTimezoneLabelMixin';
import PageTitle from '@/components/Global/PageTitle';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import PasswordValidation from '@/components/Mixins/PasswordValidation.js';

export default {
  name: 'ProfileSettings',
  components: { InputPasswordToggle, PageTitle },
  mixins: [
    BVToastMixin,
    LocalTimezoneLabelMixin,
    LoadingBarMixin,
    VuelidateMixin,
    PasswordValidation,
  ],
  data() {
    return {
      form: {
        newPassword: '',
        confirmPassword: '',
        currentPassword: '',
        isUtcDisplay: this.$store.getters['global/isUtcDisplay'],
        language: this.$store.getters['global/languagePreference'],
      },
    };
  },
  computed: {
    username() {
      return this.$store.getters['global/username'];
    },
    passwordRequirements() {
      return this.$store.getters['userManagement/accountPasswordRequirements'];
    },
    timezone() {
      return this.localOffset();
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('userManagement/getAccountSettings')
      .finally(() => this.endLoader());
  },
  validations() {
    return {
      form: {
        newPassword: {
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
        confirmPassword: {
          sameAsPassword: sameAs('newPassword'),
        },
      },
    };
  },
  methods: {
    saveNewPasswordInputData() {
      this.$v.form.confirmPassword.$touch();
      this.$v.form.newPassword.$touch();
      if (this.$v.$invalid) return;
      let userData = {
        originalUsername: this.username,
        password: this.form.newPassword,
      };

      this.$store
        .dispatch('userManagement/updateUser', userData)
        .then((message) => {
          (this.form.newPassword = ''),
            (this.form.confirmPassword = ''),
            (this.form.currentPassword = '');
          this.$v.$reset();
          this.successToast(message);
          this.$store.dispatch('authentication/logout');
        })
        .catch(({ message }) => this.errorToast(message));
    },
    saveTimeZonePreferenceData() {
      localStorage.setItem('storedUtcDisplay', this.form.isUtcDisplay);
      this.$store.commit('global/setUtcTime', this.form.isUtcDisplay);
      this.successToast(
        this.$t('pageProfileSettings.toast.successUpdatingTimeZone'),
      );
    },
    saveLanguagePreferenceData() {
      localStorage.setItem('storedLanguage', this.form.language);
      this.$store.commit('global/setLanguagePreference', this.form.language);
      this.$i18n.locale = this.form.language;
      this.successToast(
        this.$t('pageProfileSettings.toast.successUpdatingLanguage'),
      );
    },
    submitForm() {
      if (
        this.form.confirmPassword &&
        this.form.newPassword &&
        this.form.currentPassword
      ) {
        this.confirmAuthenticate();
      }
      if (
        this.$store.getters['global/isUtcDisplay'] != this.form.isUtcDisplay
      ) {
        this.saveTimeZonePreferenceData();
      }
      if (
        this.$store.getters['global/languagePreference'] != this.form.language
      ) {
        this.saveLanguagePreferenceData();
      }
    },
    confirmAuthenticate() {
      this.$v.form.newPassword.$touch();
      if (this.$v.$invalid) return;

      const username = this.username;
      const password = this.form.currentPassword;

      this.$store
        .dispatch('authentication/login', { username, password })
        .then(() => {
          this.saveNewPasswordInputData();
        })
        .catch(() => {
          this.$v.$reset();
          this.errorToast(
            this.$t('pageProfileSettings.toast.wrongCredentials'),
          );
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.profile-text {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    display: block;
    right: 15%;
    top: 0;
    width: 1px;
    height: 100%;
    background-color: $gray-border;

    @include media-breakpoint-down('lg') {
      right: 5%;
    }

    @include media-breakpoint-down('md') {
      content: none;
    }
  }

  &--password {
    @include media-breakpoint-down('lg') {
      &::before {
        content: none;
      }
    }
  }
}

.btn-primary {
  margin-top: clamp(0.813rem, -0.0818rem + 1.1098vw, 1.25rem);
}

dd {
  margin-top: 12px;
}

.btn-block {
  @include media-breakpoint-down(md) {
    margin-top: 0;
  }
}

.profile-form {
  @include media-breakpoint-down(md) {
    margin-bottom: 1rem;
  }
}
</style>
