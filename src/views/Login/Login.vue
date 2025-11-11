<template>
  <b-form class="login-form" novalidate @submit.prevent="login">
    <alert class="login-error" :show="authError" variant="danger">
      <p id="login-error-alert">
        {{ $t('pageLogin.alert.message') }}
      </p>
    </alert>
    <div class="login-form-border">
      <div class="d-flex justify-content-between login-form-header">
        <div class="d-flex flex-column justify-content-between">
          <div v-if="model || hostName" class="nav-item nav-text">
            <h3 class="text-model">
              {{ $t('pageLogin.model') + ': ' + model }}
            </h3>
            <p class="text-muted">
              {{ $t('pageLogin.hostName') + ': ' + hostName }}
            </p>
          </div>
          <h1>{{ $t('pageLogin.signIn') }}</h1>
        </div>
        <div class="login-image">
          <img src="@/assets/images/qr-code-support.png" />
          <b-link
            class="login-image-text"
            target="_blank"
            href="https://lk.openyard.ru/auth/login"
          >
            {{ $t('pageLogin.supportLink') }}</b-link
          >
        </div>
      </div>
      <b-form-group label-for="language" :label="$t('pageLogin.language')">
        <b-form-select
          id="language"
          v-model="$i18n.locale"
          :options="languages"
          data-test-id="login-select-language"
        ></b-form-select>
      </b-form-group>
      <b-form-group
        label-for="username"
        :label="$t('pageLogin.username')"
        class="field-wrapper"
      >
        <b-form-input
          id="username"
          v-model="userInfo.username"
          aria-describedby="login-error-alert username-required"
          :state="getValidationState($v.userInfo.username)"
          type="text"
          autofocus="autofocus"
          data-test-id="login-input-username"
          @input="$v.userInfo.username.$touch()"
        >
        </b-form-input>
        <b-form-invalid-feedback id="username-required" role="alert">
          <template v-if="!$v.userInfo.username.required">
            {{ $t('global.form.fieldRequired') }}
          </template>
        </b-form-invalid-feedback>
      </b-form-group>
      <div class="login-form__section field-wrapper">
        <label for="password">{{ $t('pageLogin.password') }}</label>
        <input-password-toggle>
          <b-form-input
            id="password"
            v-model="userInfo.password"
            aria-describedby="login-error-alert password-required"
            :state="getValidationState($v.userInfo.password)"
            type="password"
            data-test-id="login-input-password"
            class="form-control-with-button"
            @input="$v.userInfo.password.$touch()"
          >
          </b-form-input>
          <b-form-invalid-feedback id="password-required" role="alert">
            <template v-if="!$v.userInfo.password.required">
              {{ $t('global.form.fieldRequired') }}
            </template>
          </b-form-invalid-feedback>
        </input-password-toggle>
      </div>
    </div>
    <b-button
      class="btn-block login-btn"
      type="submit"
      variant="primary"
      data-test-id="login-button-submit"
      :disabled="disableSubmitButton"
      >{{ $t('pageLogin.logIn') }}
      <icon-chevron-right />
    </b-button>
  </b-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import i18n from '@/i18n';
import Alert from '@/components/Global/Alert';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import IconChevronRight from '@/components/icons/IconChevronRight';

export default {
  name: 'Login',
  components: { Alert, InputPasswordToggle, IconChevronRight },
  mixins: [VuelidateMixin],
  data() {
    return {
      userInfo: {
        username: null,
        password: null,
      },
      disableSubmitButton: false,
      languages: [
        {
          value: 'en-US',
          text: 'English',
        },
        {
          value: 'ru-RU',
          text: 'Русский',
        },
      ],
    };
  },
  computed: {
    authError() {
      return this.$store.getters['authentication/authError'];
    },
    hostName() {
      return localStorage.getItem('hostName');
    },
    model() {
      return localStorage.getItem('model');
    },
  },
  validations: {
    userInfo: {
      username: {
        required,
      },
      password: {
        required,
      },
    },
  },
  methods: {
    login: function () {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.disableSubmitButton = true;
      const username = this.userInfo.username;
      const password = this.userInfo.password;
      this.$store
        .dispatch('authentication/login', { username, password })
        .then(() => {
          localStorage.setItem('storedLanguage', i18n.locale);
          localStorage.setItem('storedUsername', username);
          this.$store.commit('global/setUsername', username);
          this.$store.commit('global/setLanguagePreference', i18n.locale);
          return this.$store.dispatch('authentication/getUserInfo', username);
        })
        .then(({ PasswordChangeRequired, RoleId }) => {
          if (PasswordChangeRequired) {
            this.$router.push('/change-password');
          } else {
            this.$router.push('/');
          }
          if (RoleId) {
            this.$store.commit('global/setPrivilege', RoleId);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => (this.disableSubmitButton = false));
    },
  },
};
</script>

<style lang="scss" scoped>
.btn-primary {
  justify-content: space-between;
}

.login-image {
  max-width: 15%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @include media-breakpoint-down('xl') {
    max-width: 25%;
  }

  @include media-breakpoint-only(xs) {
    max-width: 35%;
  }
}

.login-image-text {
  font-size: clamp(0.625rem, 0.369rem + 0.3175vw, 0.75rem);
  color: $purple;
  text-align: center;
}

.login-btn {
  background-color: rgba(39, 43, 50, 1);

  @include media-breakpoint-down(sm) {
    background-color: rgba(39, 43, 50, 0.7);
    border: 2px solid rgba(240, 240, 240);
  }
}

.login-form {
  position: relative;
}

.login-error {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 1rem);
  margin: 0 !important;
}

.field-wrapper {
  position: relative;
  margin-bottom: 1.25rem;

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
