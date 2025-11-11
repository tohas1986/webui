<template>
  <b-container fluid>
    <page-title />
    <b-form class="smtp-form" novalidate @submit.prevent="handleSubmit">
      <div class="section-container">
        <b-row>
          <b-col sm="12">
            <b-form-group
              class="snmp-group"
              :label="$t('pageSmtp.form.smtpEnable')"
            >
              <b-form-checkbox
                id="snmpProtocolSwitch"
                v-model="form.smtpEnabled"
                switch
                @change="onChangeSmtpEnabled"
              >
                {{ $t('global.status.enabled') }}
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="12">
            <b-form-group :disabled="disabledSmtp">
              <b-row>
                <b-col sm="12" lg="6">
                  <b-form-group
                    for="smtp-mail-send"
                    :label="$t('pageSmtp.form.smtpMailSend')"
                  >
                    <b-form-input
                      id="smtp-mail-send"
                      v-model="form.smtpMailSend"
                      type="text"
                      :state="getValidationState($v.form.smtpMailSend)"
                      @change="$v.form.smtpMailSend.$touch()"
                    />
                    <b-form-invalid-feedback role="alert">
                      {{ $t('global.form.fieldRequired') }}
                    </b-form-invalid-feedback>
                  </b-form-group>
                  <b-form-group
                    for="smtp-address"
                    :label="$t('pageSmtp.form.smtpAddress')"
                  >
                    <b-form-input
                      id="smtp-address"
                      v-model="form.smtpAddress"
                      type="text"
                      :state="getValidationState($v.form.smtpAddress)"
                      @change="$v.form.smtpAddress.$touch()"
                    />
                    <b-form-invalid-feedback role="alert">
                      {{ $t('global.form.fieldRequired') }}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
                <b-col sm="12" lg="6">
                  <b-row>
                    <b-col sm="12" lg="6">
                      <b-form-group
                        for="smtp-password"
                        :label="$t('pageSmtp.form.smtpPassword')"
                      >
                        <input-password-toggle>
                          <b-form-input
                            id="smtp-password"
                            v-model="form.smtpPassword"
                            type="password"
                            :state="getValidationState($v.form.smtpPassword)"
                            @change="$v.form.smtpPassword.$touch()"
                          />
                          <b-form-invalid-feedback role="alert">
                            {{ $t('global.form.fieldRequired') }}
                          </b-form-invalid-feedback>
                        </input-password-toggle>
                      </b-form-group>
                    </b-col>
                    <b-col sm="12" lg="6">
                      <b-form-group
                        for="smtp-port"
                        :label="$t('pageSmtp.form.smtpPort')"
                      >
                        <b-form-input
                          id="smtp-port"
                          v-model="form.smtpPort"
                          type="number"
                          number
                          :state="getValidationState($v.form.smtpPort)"
                          @change="$v.form.smtpPort.$touch()"
                        />
                        <b-form-invalid-feedback role="alert">
                          {{ $t('global.form.fieldRequired') }}
                        </b-form-invalid-feedback>
                      </b-form-group>
                    </b-col>
                  </b-row>
                  <b-form-group
                    for="smtp-mail-recipient"
                    :label="$t('pageSmtp.form.smtpMailRecipient')"
                  >
                    <b-form-input
                      id="smtp-mail-recipient"
                      v-model="form.smtpMailRecipient"
                      type="text"
                      :state="getValidationState($v.form.smtpMailRecipient)"
                      @change="$v.form.smtpMailRecipient.$touch()"
                    />
                    <b-form-invalid-feedback role="alert">
                      {{ $t('global.form.fieldRequired') }}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-form-group>
          </b-col>
          <b-col sm="12">
            <b-form-group :disabled="disabledSmtp">
              <div class="smtp-form-container section-container">
                <b-row class="smtp-form">
                  <b-col sm="12" md="3" class="text-divider">
                    <dl>
                      <dt>{{ $t('pageSmtp.form.smtpEnableTls') }}</dt>
                      <dd>
                        <b-form-radio-group
                          v-model="form.smtpConnectionProtocol"
                          :options="ConnectionProtocolOptions"
                        ></b-form-radio-group>
                      </dd>
                    </dl>
                  </b-col>
                  <b-col sm="12" md="3" class="text-divider">
                    <dl>
                      <dt>{{ $t('pageSmtp.form.smtpEnableError') }}</dt>
                      <dd>
                        <b-form-checkbox
                          id="snmpErrorSwitch"
                          v-model="form.smtpEnabledError"
                          switch
                        >
                          {{ $t('global.status.enabled') }}
                        </b-form-checkbox>
                      </dd>
                    </dl>
                  </b-col>
                  <b-col sm="12" md="3" class="text-divider">
                    <dl>
                      <dt>{{ $t('pageSmtp.form.smtpEnableWarning') }}</dt>
                      <dd>
                        <b-form-checkbox
                          id="snmpWarningSwitch"
                          v-model="form.smtpEnabledWarning"
                          switch
                        >
                          {{ $t('global.status.enabled') }}
                        </b-form-checkbox>
                      </dd>
                    </dl>
                  </b-col>
                  <b-col sm="12" md="3" class="text-divider">
                    <dl>
                      <dt>{{ $t('pageSmtp.form.smtpEnableUplink') }}</dt>
                      <dd>
                        <b-form-checkbox
                          id="snmpUplinkSwitch"
                          v-model="form.smtpEnabledUplink"
                          switch
                        >
                          {{ $t('global.status.enabled') }}
                        </b-form-checkbox>
                      </dd>
                    </dl>
                  </b-col>
                </b-row>
              </div>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      <b-row>
        <b-col sm="12" lg="6">
          <b-button type="submit" class="btn-block" variant="primary">
            {{ $t('global.action.saveSettings') }}</b-button
          >
        </b-col>
        <b-col sm="12" lg="6">
          <b-button
            class="btn-block"
            variant="primary"
            :disabled="btnTestDisabled"
            @click="sentTestMail"
          >
            {{ $t('pageSmtp.smtpBtnTest') }}</b-button
          >
        </b-col>
      </b-row>
    </b-form>
  </b-container>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';
import PageTitle from '@/components/Global/PageTitle';
import { actionTypes } from '@/store/modules/Settings/SmtpStore';
import { mapState } from 'vuex';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import FormDiffMixin from '@/components/Mixins/FormDiffMixin';

export default {
  name: 'Smtp',
  components: { PageTitle, InputPasswordToggle },
  mixins: [BVToastMixin, LoadingBarMixin, VuelidateMixin, FormDiffMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      btnTestDisabled: false,
      form: {
        smtpEnabled: false,
        smtpMailSend: '',
        smtpAddress: '',
        smtpPassword: '',
        smtpPort: '',
        smtpMailRecipient: '',
        smtpConnectionProtocol: [],
        smtpEnabledStartTls: false,
        smtpEnabledError: false,
        smtpEnabledWarning: false,
        smtpEnabledUplink: false,
        smtpTestEnabled: false,
      },
      currentForm: {},
      ConnectionProtocolOptions: [
        { text: 'TLS SSL', value: 'TLS_SSL' },
        { text: 'Start TLS', value: 'StartTLS' },
      ],
    };
  },
  computed: {
    ...mapState({
      smtp: (state) => state.smtp.data,
    }),
    disabledSmtp() {
      return !this.form.smtpEnabled;
    },
  },
  watch: {
    smtp() {
      this.form.smtpEnabled = this.smtp.SMTP.ServiceEnabled;
      this.form.smtpMailSend = this.smtp.SMTP.FromAddress;
      this.form.smtpAddress = this.smtp.SMTP.ServerAddress;
      this.form.smtpPort = this.smtp.SMTP.Port;
      this.form.smtpConnectionProtocol = this.smtp.SMTP.ConnectionProtocol;
      this.form.smtpMailRecipient = this.smtp.OemActions.SMTPToAddress;
      this.form.smtpEnabledError = this.smtp.OemActions.SMTPerrorEnabled;
      this.form.smtpEnabledWarning = this.smtp.OemActions.SMTPwarningEnabled;
      this.form.smtpEnabledUplink = this.smtp.OemActions.SMTPuplinkEnabled;
      this.form.smtpTestEnabled = this.smtp.OemActions.SMTPtestEnabled;
      this.currentForm = JSON.parse(JSON.stringify(this.form));
    },
  },
  validations: {
    form: {
      smtpEnabled: {},
      smtpMailSend: {
        required: requiredIf(function () {
          return this.form.smtpEnabled;
        }),
      },
      smtpAddress: {
        required: requiredIf(function () {
          return this.form.smtpEnabled;
        }),
      },
      smtpPassword: {
        required: requiredIf(function () {
          return this.form.smtpEnabled;
        }),
      },
      smtpPort: {
        required: requiredIf(function () {
          return this.form.smtpEnabled;
        }),
      },
      smtpMailRecipient: {
        required: requiredIf(function () {
          return this.form.smtpEnabled;
        }),
      },
    },
  },
  mounted() {
    this.startLoader();
    this.$store.dispatch(actionTypes.getSmtp).finally(() => this.endLoader());
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;

      const modifiedForm = this.getModifiedFields(this.form, this.currentForm, [
        'smtpEnabled',
      ]);

      if (!this.form.smtpEnabled) {
        if (modifiedForm.smtpEnabled === undefined) return;

        const smtpData = {
          SMTP: {
            ServiceEnabled: this.form.smtpEnabled,
          },
        };

        this.$store
          .dispatch(actionTypes.saveSmtp, smtpData)
          .then(() => {
            this.successToast(
              this.$t('pageSmtp.toast.successSaveSmtpSettings'),
            );
            this.currentForm = JSON.parse(JSON.stringify(this.form));
          })
          .catch(({ message }) => {
            this.errorToast(message);
          });

        return;
      }

      const smtpData = {
        SMTP: {
          ...(modifiedForm.smtpEnabled !== undefined && {
            ServiceEnabled: modifiedForm.smtpEnabled,
          }),
          ...(modifiedForm.smtpAddress !== undefined && {
            ServerAddress: modifiedForm.smtpAddress,
          }),
          ...(modifiedForm.smtpMailSend !== undefined && {
            FromAddress: modifiedForm.smtpMailSend,
          }),
          ...(modifiedForm.smtpPassword !== undefined && {
            Password: modifiedForm.smtpPassword,
          }),
          ...(modifiedForm.smtpPort !== undefined && {
            Port: modifiedForm.smtpPort,
          }),
          ...(modifiedForm.smtpConnectionProtocol !== undefined && {
            ConnectionProtocol: modifiedForm.smtpConnectionProtocol,
          }),
        },
        OemActions: {
          ...(modifiedForm.smtpMailRecipient !== undefined && {
            SMTPToAddress: modifiedForm.smtpMailRecipient,
          }),
          ...(modifiedForm.smtpEnabledError !== undefined && {
            SMTPerrorEnabled: modifiedForm.smtpEnabledError,
          }),
          ...(modifiedForm.smtpEnabledWarning !== undefined && {
            SMTPwarningEnabled: modifiedForm.smtpEnabledWarning,
          }),
          ...(modifiedForm.smtpEnabledUplink !== undefined && {
            SMTPuplinkEnabled: modifiedForm.smtpEnabledUplink,
          }),
        },
      };

      this.$store
        .dispatch(actionTypes.saveSmtp, smtpData)
        .then(() => {
          this.successToast(this.$t('pageSmtp.toast.successSaveSmtpSettings'));

          this.currentForm = JSON.parse(JSON.stringify(this.form));
        })
        .catch(({ message }) => {
          this.errorToast(message);
        })
        .finally(() => {
          this.form.smtpPassword = '';
          this.$v.form.$reset();
        });
    },

    sentTestMail() {
      this.$v.$touch();
      if (this.$v.$invalid) return;

      if (!this.form.smtpEnabled) {
        this.errorToast(this.$t('pageSmtp.toast.smtpNotEnabled'));
        return;
      }

      this.btnTestDisabled = true;

      const smtpTestData = {
        SMTP: {
          ServiceEnabled: this.form.smtpEnabled,
          FromAddress: this.form.smtpMailSend,
          Password: this.form.smtpPassword,
          Port: this.form.smtpPort,
          ConnectionProtocol: this.form.smtpConnectionProtocol,
        },
        OemActions: {
          SMTPToAddress: this.form.smtpMailRecipient,
          SMTPerrorEnabled: this.form.smtpEnabledError,
          SMTPwarningEnabled: this.form.smtpEnabledWarning,
          SMTPuplinkEnabled: this.form.smtpEnabledUplink,
          SMTPtestEnabled: true,
        },
      };

      this.$store
        .dispatch(actionTypes.saveSmtp, smtpTestData)
        .then(() => {
          setTimeout(() => {
            this.successToast(this.$t('pageSmtp.toast.successSendSmtpMail'));
            this.btnTestDisabled = false;
          }, 5000);
        })
        .catch(({ message }) => {
          this.errorToast(message);
          this.successToast(this.$t('pageSmtp.toast.errorSendSmtpMail'));
          this.btnTestDisabled = false;
        })
        .finally(() => {
          this.form.smtpPassword = '';
          this.$v.form.$reset();
        });
    },

    onChangeSmtpEnabled() {
      this.$v.form.smtpEnabled.$touch();
    },
  },
};
</script>

<style lang="scss" scoped>
.btn-primary {
  margin-top: clamp(0.813rem, -0.0818rem + 1.1098vw, 1.25rem);
}

.text-divider {
  @include media-breakpoint-down(sm) {
    padding: 0;
    margin: 1rem 0;

    &:first-of-type {
      margin-top: 0;
    }

    &:last-of-type {
      margin-bottom: 0;
    }

    dd {
      margin-top: 0.2rem;
    }
  }

  &:last-of-type::after {
    content: none;
  }

  &:not(:last-of-type)::after {
    content: '';
    width: 1px;
    height: 100%;
    background-color: $gray-border;

    @include media-breakpoint-down(sm) {
      bottom: -1rem;
      top: auto;
      left: 0;
      right: 0;
      width: 100%;
      height: 1px;
    }
  }
}

dd {
  margin-top: 12px;
}

.smtp-form {
  @include media-breakpoint-down(sm) {
    flex-direction: column;
  }
}
</style>
