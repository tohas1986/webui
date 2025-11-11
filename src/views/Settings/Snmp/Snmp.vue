<template>
  <b-container fluid>
    <page-title :description="$t('pageSnmp.pageDescription')" />
    <b-form class="snmp-form" novalidate @submit.prevent="handleSubmit">
      <div class="section-container">
        <b-row>
          <b-col sm="12" lg="6">
            <b-form-group :label="$t('pageSnmp.form.snmpEnable')">
              <b-form-checkbox
                id="snmpSwitch"
                v-model="form.snmpEnabled"
                switch
                @change="onChangeSnmpEnabled"
              >
                {{ $t('global.status.enabled') }}
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-row>
        <b-form-group class="m-0" :disabled="disabledSnmp">
          <b-row>
            <b-col sm="12" lg="6">
              <b-form-group :label="$t('pageSnmp.form.snmpV2Enable')">
                <b-form-checkbox
                  id="snmpV2Switch"
                  v-model="form.enableSNMPv2c"
                  switch
                >
                  {{ $t('global.status.enabled') }}
                </b-form-checkbox>
              </b-form-group>
              <b-form-group class="m-0" :disabled="disabledSnmpV2">
                <b-form-group for="snmp-port" :label="$t('pageSnmp.form.port')"
                  ><b-form-input
                    id="snmp-port"
                    v-model="form.port"
                    type="number"
                    number
                    :state="getValidationState($v.form.port)"
                    @change="$v.form.port.$touch()"
                  ></b-form-input>
                  <b-form-invalid-feedback role="alert">
                    {{ $t('global.form.fieldRequired') }}
                  </b-form-invalid-feedback>
                </b-form-group>

                <b-form-group
                  for="snmp-group"
                  :label="$t('pageSnmp.form.defaultGroup')"
                  ><b-form-input
                    id="snmp-group"
                    v-model="form.defaultGroup"
                    :state="getValidationState($v.form.defaultGroup)"
                    @change="$v.form.defaultGroup.$touch()"
                  ></b-form-input>
                  <b-form-invalid-feedback role="alert">
                    {{ $t('global.form.fieldRequired') }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </b-form-group>
            </b-col>
            <b-col sm="12" lg="6">
              <b-form-group :label="$t('pageSnmp.form.snmpV3Enable')">
                <b-form-checkbox
                  id="snmpV3Switch"
                  v-model="form.enableSNMPv3"
                  switch
                >
                  {{ $t('global.status.enabled') }}
                </b-form-checkbox>
              </b-form-group>
              <b-form-group class="m-0" :disabled="disabledSnmpV3">
                <b-form-group
                  for="snmp-username"
                  :label="$t('pageSnmp.form.username')"
                  ><b-form-input
                    id="snmp-username"
                    v-model="form.username"
                    :state="getValidationState($v.form.username)"
                    @change="$v.form.username.$touch()"
                  ></b-form-input>
                  <b-form-invalid-feedback role="alert">
                    {{ $t('global.form.fieldRequired') }}
                  </b-form-invalid-feedback>
                </b-form-group>
                <b-row>
                  <b-col sm="12" lg="6">
                    <b-form-group
                      for="snmp-hash"
                      :label="$t('pageSnmp.form.hashMethod')"
                      ><b-form-select
                        id="snmp-hash"
                        v-model="form.hashMethod"
                        :options="hashMethods"
                        :state="getValidationState($v.form.hashMethod)"
                        @change="$v.form.hashMethod.$touch()"
                        @input="hashChange()"
                      >
                        <template #first>
                          <b-form-select-option :value="null" disabled>
                            {{ $t('global.form.selectAnOption') }}
                          </b-form-select-option>
                        </template>
                      </b-form-select>
                      <b-form-invalid-feedback role="alert">
                        {{ $t('global.form.fieldRequired') }}
                      </b-form-invalid-feedback>
                    </b-form-group>
                  </b-col>
                  <b-col sm="12" lg="6">
                    <b-form-group
                      for="snmp-auth-pwd"
                      :label="$t('pageSnmp.form.authPwd')"
                      :disabled="disabledHash"
                    >
                      <input-password-toggle>
                        <b-form-input
                          id="snmp-auth-pwd"
                          v-model="form.authPwd"
                          type="password"
                          :state="getValidationState($v.form.authPwd)"
                          @change="$v.form.authPwd.$touch()"
                        ></b-form-input>
                        <b-form-invalid-feedback role="alert">
                          {{ $t('global.form.fieldRequired') }}
                        </b-form-invalid-feedback>
                      </input-password-toggle>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-form-group :disabled="disabledEncryptMethod">
                  <b-row>
                    <b-col sm="12" lg="6">
                      <b-form-group
                        for="snmp-encrypt-method"
                        :label="$t('pageSnmp.form.encryptMethod')"
                        :disabled="disabledHash"
                        ><b-form-select
                          id="snmp-encrypt-method"
                          v-model="form.encryptMethod"
                          :options="encryptMethods"
                          :state="getValidationState($v.form.encryptMethod)"
                          @change="$v.form.encryptMethod.$touch()"
                        >
                          <template #first>
                            <b-form-select-option :value="null" disabled>
                              {{ $t('global.form.selectAnOption') }}
                            </b-form-select-option>
                          </template>
                        </b-form-select>
                        <b-form-invalid-feedback role="alert">
                          {{ $t('global.form.fieldRequired') }}
                        </b-form-invalid-feedback>
                      </b-form-group>
                    </b-col>
                    <b-col sm="12" lg="6">
                      <b-form-group
                        for="snmp-encrypt-pwd"
                        :label="$t('pageSnmp.form.encryptPwd')"
                        :disabled="disabledEncrypt"
                      >
                        <input-password-toggle
                          ><b-form-input
                            id="snmp-encrypt-pwd"
                            v-model="form.encryptPwd"
                            type="password"
                            :state="getValidationState($v.form.encryptPwd)"
                            @change="$v.form.encryptPwd.$touch()"
                          ></b-form-input>
                          <b-form-invalid-feedback role="alert">
                            {{ $t('global.form.fieldRequired') }}
                          </b-form-invalid-feedback>
                        </input-password-toggle>
                      </b-form-group>
                    </b-col>
                  </b-row>
                </b-form-group>
              </b-form-group>
            </b-col>
            <b-col sm="12">
              <b-form-group
                class="snmp-group"
                :label="$t('pageSnmp.form.trapsEnable')"
              >
                <b-form-checkbox
                  id="identify"
                  v-model="form.trapsEnabled"
                  data-test-id="overviewInventory-checkbox-identifyLed"
                  switch
                  @change="onChangeTrapsEnabled"
                >
                  {{ $t('global.status.enabled') }}</b-form-checkbox
                >
              </b-form-group>
              <b-form-group class="m-0" :disabled="disabledTraps">
                <b-row>
                  <b-col sm="12" lg="6">
                    <b-form-group
                      for="traps-ip"
                      :label="$t('pageSnmp.form.ipAddr')"
                      ><b-form-input
                        id="snmp-ip"
                        v-model="form.ipAddr"
                        :state="getValidationState($v.form.ipAddr)"
                        @change="$v.form.ipAddr.$touch()"
                      ></b-form-input>
                      <b-form-invalid-feedback role="alert">
                        {{ $t('global.form.fieldRequired') }}
                      </b-form-invalid-feedback>
                    </b-form-group>
                  </b-col>
                  <b-col sm="12" lg="6">
                    <b-form-group
                      for="traps-port"
                      :label="$t('pageSnmp.form.trapsPort')"
                      ><b-form-input
                        id="traps-port"
                        v-model="form.trapsPort"
                        type="number"
                        number
                        :state="getValidationState($v.form.trapsPort)"
                        @change="$v.form.trapsPort.$touch()"
                      ></b-form-input>
                      <b-form-invalid-feedback role="alert">
                        {{ $t('global.form.fieldRequired') }}
                      </b-form-invalid-feedback>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-form-group>
            </b-col>
          </b-row>
        </b-form-group>
        <b-row class="justify-content-center">
          <div class="btn-container">
            <b-button :href="hrefMib" variant="link" class="btn-table"
              ><icon-export />{{ $t('pageSnmp.btnMib') }}</b-button
            >

            <b-button :href="hrefZabbix" variant="link" class="btn-table">
              <icon-export /> {{ $t('pageSnmp.btnZabbix') }}
            </b-button>
            <b-button
              :href="hrefRedfishZabbix"
              variant="link"
              class="btn-table"
            >
              <icon-export /> {{ $t('pageSnmp.btnRedfishZabbix') }}
            </b-button>
          </div>
        </b-row>
      </div>
      <b-button type="submit" class="btn-block" variant="primary">
        {{ $t('global.action.saveSettings') }}</b-button
      >
    </b-form>
  </b-container>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';
import PageTitle from '@/components/Global/PageTitle';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import { actionTypes } from '@/store/modules/Settings/SnmpStore';
import { mapState } from 'vuex';
import IconExport from '@/components/icons/IconExport';
import FormDiffMixin from '@/components/Mixins/FormDiffMixin';

export default {
  name: 'Snmp',
  components: {
    PageTitle,
    InputPasswordToggle,
    IconExport,
  },
  mixins: [BVToastMixin, LoadingBarMixin, VuelidateMixin, FormDiffMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      form: {
        snmpEnabled: false,
        trapsEnabled: false,
        port: '',
        enableSNMPv2c: false,
        enableSNMPv3: false,
        defaultGroup: '',
        username: '',
        authPwd: '',
        encryptPwd: '',
        hashMethod: null,
        encryptMethod: null,
        trapsPort: '',
        ipAddr: '',
      },
      currentForm: {},
      protocols: [
        { value: true, text: 'V2' },
        { value: false, text: 'V3' },
      ],
      hashMethods: [
        { value: 'None', text: 'None' },
        { value: 'HMAC_MD5', text: 'HMAC_MD5' },
        { value: 'HMAC_SHA96', text: 'HMAC_SHA96' },
        { value: 'HMAC128_SHA224', text: 'HMAC128_SHA224' },
        { value: 'HMAC192_SHA256', text: 'HMAC192_SHA256' },
        { value: 'HMAC256_SHA384', text: 'HMAC256_SHA384' },
        { value: 'HMAC384_SHA512', text: 'HMAC384_SHA512' },
      ],
      encryptMethods: [
        { value: 'None', text: 'None' },
        { value: 'CBC_DES', text: 'CBC_DES' },
        { value: 'CFB128_AES128', text: 'CFB128_AES128' },
      ],
    };
  },
  computed: {
    ...mapState({
      snmp: (state) => state.snmp.data,
    }),
    disabledSnmp() {
      return !this.form.snmpEnabled;
    },
    disabledSnmpV2() {
      return !this.form.enableSNMPv2c;
    },
    disabledSnmpV3() {
      return !this.form.enableSNMPv3;
    },
    disabledTraps() {
      return !this.form.trapsEnabled;
    },
    disabledEncrypt() {
      if (this.form.encryptMethod === 'None') {
        return true;
      }
      return false;
    },
    disabledHash() {
      if (this.form.hashMethod === 'None') {
        return true;
      }
      return false;
    },
    disabledEncryptMethod() {
      if (this.form.hashMethod === 'None') {
        return true;
      }
      return false;
    },
    hrefMib() {
      return '/redfish/v1/Managers/bmc/NetworkProtocol/mib/';
    },
    hrefZabbix() {
      return '/redfish/v1/Managers/bmc/NetworkProtocol/zabbix/';
    },
    hrefRedfishZabbix() {
      return '/redfish/v1/Managers/bmc/NetworkProtocol/zredfish/';
    },
  },
  watch: {
    snmp() {
      this.form.snmpEnabled = this.snmp.ProtocolEnabled;
      this.form.enableSNMPv2c = this.snmp.EnableSNMPv2c;
      this.form.enableSNMPv3 = this.snmp.SNMPv3Enable;
      this.form.port = this.snmp.Port;
      this.form.trapsPort = this.snmp.TrapPort;
      this.form.trapsEnabled = this.snmp.TrapEnabled;
      this.form.ipAddr = this.snmp.TrapIp;
      this.form.defaultGroup = this.snmp.CommunityString;
      this.form.username = this.snmp.UserName;
      this.form.hashMethod = this.snmp.AuthenticationProtocol;
      this.form.encryptMethod = this.snmp.EncryptionProtocol;
      this.currentForm = JSON.parse(JSON.stringify(this.form));
    },
  },
  validations: {
    form: {
      snmpEnabled: {},
      enableSNMPv2c: {},
      enableSNMPv3: {},
      trapsEnabled: {},
      port: {
        required: requiredIf(function () {
          return this.form.enableSNMPv2c;
        }),
      },
      defaultGroup: {
        required: requiredIf(function () {
          return this.form.enableSNMPv2c;
        }),
      },
      username: {
        required: requiredIf(function () {
          return this.form.enableSNMPv3;
        }),
      },
      hashMethod: {
        required: requiredIf(function () {
          return this.form.enableSNMPv3;
        }),
      },
      encryptMethod: {
        required: requiredIf(function () {
          return this.form.enableSNMPv3;
        }),
      },
      authPwd: {
        required: requiredIf(function () {
          if (this.form.hashMethod === 'None') {
            return false;
          }
          return this.form.enableSNMPv3;
        }),
      },
      encryptPwd: {
        required: requiredIf(function () {
          if (this.form.encryptMethod === 'None') {
            return false;
          } else if (this.form.hashMethod === 'None') {
            return false;
          }
          return this.form.enableSNMPv3;
        }),
      },
      ipAddr: {
        required: requiredIf(function () {
          return this.form.trapsEnabled;
        }),
      },
      trapsPort: {
        required: requiredIf(function () {
          return this.form.trapsEnabled;
        }),
      },
    },
  },
  mounted() {
    this.startLoader();
    this.$store.dispatch(actionTypes.getSnmp).finally(() => this.endLoader());
  },
  methods: {
    hashChange() {
      if (this.form.hashMethod === 'None') {
        this.form.encryptMethod = 'None';
        this.form.encryptPwd = '';
        this.form.authPwd = '';
      }
    },
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;

      const modifiedForm = this.getModifiedFields(this.form, this.currentForm, [
        'snmpEnabled',
      ]);

      if (!this.form.snmpEnabled) {
        if (modifiedForm.snmpEnabled === undefined) return;

        const snmpData = {
          ProtocolEnabled: this.form.snmpEnabled,
          ...(modifiedForm.trapsEnabled !== undefined && {
            TrapEnabled: modifiedForm.trapsEnabled,
          }),
          ...(modifiedForm.enableSNMPv2c !== undefined && {
            EnableSNMPv2c: modifiedForm.enableSNMPv2c,
          }),
          ...(modifiedForm.enableSNMPv3 !== undefined && {
            SNMPv3Enable: modifiedForm.enableSNMPv3,
          }),
        };

        this.$store
          .dispatch(actionTypes.saveSnmp, snmpData)
          .then(() => {
            this.successToast(
              this.$t('pageSnmp.toast.successSaveSnmpSettings'),
            );
            this.currentForm = JSON.parse(JSON.stringify(this.form));
          })
          .catch(({ message }) => {
            this.errorToast(message);
          });

        return;
      }

      const snmpData = {
        ...(modifiedForm.snmpEnabled !== undefined && {
          ProtocolEnabled: modifiedForm.snmpEnabled,
        }),
        ...(modifiedForm.port !== undefined && { Port: modifiedForm.port }),
        ...(modifiedForm.enableSNMPv2c !== undefined && {
          EnableSNMPv2c: modifiedForm.enableSNMPv2c,
        }),
        ...(modifiedForm.enableSNMPv3 !== undefined && {
          SNMPv3Enable: modifiedForm.enableSNMPv3,
        }),
        ...(modifiedForm.defaultGroup !== undefined && {
          CommunityString: modifiedForm.defaultGroup,
        }),
        ...(modifiedForm.trapsEnabled !== undefined && {
          TrapEnabled: modifiedForm.trapsEnabled,
        }),
        ...(modifiedForm.trapsPort !== undefined && {
          TrapPort: modifiedForm.trapsPort,
        }),
        ...(modifiedForm.ipAddr !== undefined && {
          TrapIp: modifiedForm.ipAddr,
        }),
        ...(modifiedForm.username !== undefined && {
          UserName: modifiedForm.username,
        }),
        ...(modifiedForm.authPwd !== undefined && {
          AuthenticationKey: modifiedForm.authPwd,
        }),
        ...(modifiedForm.hashMethod !== undefined && {
          AuthenticationProtocol: modifiedForm.hashMethod,
        }),
        ...(modifiedForm.encryptPwd !== undefined && {
          EncryptionKey: modifiedForm.encryptPwd,
        }),
        ...(modifiedForm.encryptMethod !== undefined && {
          EncryptionProtocol: modifiedForm.encryptMethod,
        }),
      };

      this.$store
        .dispatch(actionTypes.saveSnmp, snmpData)
        .then(() => {
          this.successToast(this.$t('pageSnmp.toast.successSaveSnmpSettings'));

          this.currentForm = JSON.parse(JSON.stringify(this.form));
        })
        .catch(({ message }) => {
          this.errorToast(message);
        })
        .finally(() => {
          this.form.encryptPwd = '';
          this.form.authPwd = '';
          this.$v.form.$reset();
        });
    },
    onChangeSnmpEnabled() {
      this.$v.form.snmpEnabled.$touch();
    },
    onChangeTrapsEnabled() {
      this.$v.form.snmpEnabled.$touch();
    },
  },
};
</script>
<style lang="scss" scoped>
.btn-primary {
  margin-top: 2.5rem;
}

.btn-secondary {
  padding: clamp(0.625rem, 0.1131rem + 0.6349vw, 0.875rem)
    clamp(1rem, -0.0238rem + 1.2698vw, 1.5rem);

  svg {
    margin-left: 1.25rem;
    margin-right: 0;
  }
}

.section-container {
  position: relative;
}
</style>
