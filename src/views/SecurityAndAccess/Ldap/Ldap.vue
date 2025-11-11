<template>
  <b-container fluid>
    <page-title :description="$t('pageLdap.pageDescription')" />
    <page-section :section-title="$t('pageLdap.settings')">
      <b-form novalidate @submit.prevent="handleSubmit">
        <div class="section-container">
          <b-row class="ldap-section">
            <b-col>
              <b-form-group
                class="mb-0"
                :label="$t('pageLdap.form.ldapAuthentication')"
                :disabled="loading"
              >
                <b-form-checkbox
                  v-model="form.ldapAuthenticationEnabled"
                  switch
                  data-test-id="ldap-checkbox-ldapAuthenticationEnabled"
                  @change="onChangeldapAuthenticationEnabled"
                >
                  {{ $t('global.action.enable') }}
                </b-form-checkbox>
              </b-form-group>
            </b-col>
          </b-row>

          <b-form-group
            class="m-0"
            :label="$t('pageLdap.ariaLabel.ldapSettings')"
            label-class="sr-only"
            :disabled="!form.ldapAuthenticationEnabled || loading"
          >
            <b-row class="ldap-section">
              <b-col md="8" xl="4">
                <b-form-group
                  class="mb-0"
                  :label="$t('pageLdap.form.secureLdapUsingSsl')"
                >
                  <b-form-text id="enable-secure-help-block">
                    {{ $t('pageLdap.form.secureLdapHelper') }}
                  </b-form-text>
                  <b-form-checkbox
                    id="enable-secure-ldap"
                    v-model="form.secureLdapEnabled"
                    switch
                    aria-describedby="enable-secure-help-block"
                    data-test-id="ldap-checkbox-secureLdapEnabled"
                    :disabled="
                      !caCertificateExpiration || !ldapCertificateExpiration
                    "
                    @change="$v.form.secureLdapEnabled.$touch()"
                  >
                    {{ $t('global.action.enable') }}
                  </b-form-checkbox>
                </b-form-group>
              </b-col>
              <b-col md="2" xl="4">
                <b-form-group
                  class="mb-0"
                  :label="$t('pageLdap.form.serviceType')"
                >
                  <b-form-radio
                    v-model="form.activeDirectoryEnabled"
                    data-test-id="ldap-radio-activeDirectoryEnabled"
                    :value="false"
                    @change="onChangeServiceType"
                  >
                    {{ $t('pageLdap.form.openLDAP') }}
                  </b-form-radio>
                  <b-form-radio
                    v-model="form.activeDirectoryEnabled"
                    data-test-id="ldap-radio-activeDirectoryEnabled"
                    :value="true"
                    @change="onChangeServiceType"
                  >
                    {{ $t('pageLdap.form.activeDirectory') }}
                  </b-form-radio>
                </b-form-group>
              </b-col>
              <b-col md="2" xl="4">
                <b-form-group
                  class="mb-0"
                  :label="$t('pageLdap.form.useKerberos')"
                >
                  <b-form-radio
                    v-model="form.kerberosEnabled"
                    :value="false"
                    @change="onChangeServiceType"
                  >
                    {{ $t('pageLdap.form.kerberosDisabled') }}
                  </b-form-radio>
                  <b-form-radio
                    v-model="form.kerberosEnabled"
                    :value="true"
                    @change="onChangeServiceType"
                  >
                    {{ $t('pageLdap.form.kerberosEnabled') }}
                  </b-form-radio>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row class="ldap-section">
              <b-col xl="12">
                <b-row>
                  <b-col md="3" xl="3" class="ldap-certificate-container">
                    <dl>
                      <dt>{{ $t('pageLdap.form.caCertificateValidUntil') }}</dt>
                      <dd v-if="caCertificateExpiration">
                        <!-- {{ caCertificateExpiration | formatDate }} -->
                      </dd>
                      <dd v-else>--</dd>
                    </dl>
                    <dl>
                      <dt>
                        {{ $t('pageLdap.form.ldapCertificateValidUntil') }}
                      </dt>
                      <dd v-if="ldapCertificateExpiration">
                        <!-- {{ ldapCertificateExpiration | formatDate }} -->
                      </dd>
                      <dd v-else>--</dd>
                    </dl>
                  </b-col>
                  <b-col md="9" xl="9">
                    <b-row>
                      <b-col md="12" xl="12" class="mb-3">
                        <b-form-group
                          :label="$t('pageLdap.form.serverUri')"
                          label-for="-"
                          class="mb-3"
                        >
                          <template #label>
                            {{ $t('pageLdap.form.serverUri') }}
                            <info-tooltip
                              :title="$t('pageLdap.form.serverUriTooltip')"
                            />
                          </template>
                          <div
                            v-for="(serverUri, index) in form.serverUris"
                            :key="index"
                            class="d-flex mb-4 align-items-center relative"
                          >
                            <div class="mb-0 d-flex server-uri-container w-100">
                              <b-form-select
                                v-model="serverUri.scheme"
                                :options="availableSchemeOptions(index)"
                                :disabled="
                                  !form.ldapAuthenticationEnabled || loading
                                "
                                class="w-25"
                                @change="
                                  $v.form.serverUris.$each[
                                    index
                                  ].scheme.$touch()
                                "
                              />
                              <b-form-input
                                v-model="serverUri.uri"
                                :placeholder="
                                  getUriPlaceholder(serverUri.scheme)
                                "
                                :state="
                                  getValidationState(
                                    $v.form.serverUris.$each[index].uri,
                                  )
                                "
                                :disabled="
                                  !form.ldapAuthenticationEnabled || loading
                                "
                                @change="
                                  $v.form.serverUris.$each[index].uri.$touch()
                                "
                              />
                              <b-form-invalid-feedback role="alert">
                                {{ $t('global.form.fieldRequired') }}
                              </b-form-invalid-feedback>
                              <b-button
                                v-if="form.serverUris.length > 1"
                                variant="link"
                                class="ml-2 p-0 delete-scheme-button"
                                :disabled="
                                  !form.ldapAuthenticationEnabled || loading
                                "
                                @click="removeServerUri(index)"
                              >
                                <icon-trashcan />
                                <span class="sr-only">
                                  {{ $t('pageLdap.form.removeServerUri') }}
                                </span>
                              </b-button>
                            </div>
                          </div>
                          <b-button
                            v-if="canAddMoreServerUris"
                            variant="secondary"
                            :disabled="
                              !form.ldapAuthenticationEnabled || loading
                            "
                            @click="addServerUri"
                          >
                            {{ $t('pageLdap.form.addServerUri') }}
                            <icon-add />
                          </b-button>
                        </b-form-group>
                      </b-col>
                      <b-col md="4" xl="4">
                        <b-form-group
                          :label="$t('pageLdap.form.bindDn')"
                          label-for="bind-dn"
                        >
                          <b-form-input
                            id="bind-dn"
                            v-model="form.bindDn"
                            data-test-id="ldap-input-bindDn"
                            :state="getValidationState($v.form.bindDn)"
                            @change="$v.form.bindDn.$touch()"
                          />
                          <b-form-invalid-feedback role="alert">
                            {{ $t('global.form.fieldRequired') }}
                          </b-form-invalid-feedback>
                        </b-form-group>
                      </b-col>
                      <b-col md="4" xl="4">
                        <b-form-group
                          :label="$t('pageLdap.form.bindPassword')"
                          label-for="bind-password"
                        >
                          <input-password-toggle
                            data-test-id="ldap-input-togglePassword"
                          >
                            <b-form-input
                              id="bind-password"
                              v-model="form.bindPassword"
                              type="password"
                              :state="getValidationState($v.form.bindPassword)"
                              class="form-control-with-button"
                              @change="$v.form.bindPassword.$touch()"
                            />
                            <b-form-invalid-feedback role="alert">
                              {{ $t('global.form.fieldRequired') }}
                            </b-form-invalid-feedback>
                          </input-password-toggle>
                        </b-form-group>
                      </b-col>
                      <b-col md="4" xl="4">
                        <b-form-group
                          class="mb-3 m-md-0"
                          :label="$t('pageLdap.form.baseDn')"
                          label-for="base-dn"
                        >
                          <b-form-input
                            id="base-dn"
                            v-model="form.baseDn"
                            data-test-id="ldap-input-baseDn"
                            @change="$v.form.baseDn.$touch()"
                          />
                        </b-form-group>
                      </b-col>
                      <b-col md="4" xl="4">
                        <b-form-group
                          class="mb-3 m-md-0"
                          label-for="user-id-attribute"
                        >
                          <template #label>
                            {{ $t('pageLdap.form.userIdAttribute') }} -
                            <span class="form-text d-inline">
                              {{ $t('global.form.optional') }}
                            </span>
                          </template>
                          <b-form-input
                            id="user-id-attribute"
                            v-model="form.userIdAttribute"
                            data-test-id="ldap-input-userIdAttribute"
                            @change="$v.form.userIdAttribute.$touch()"
                          />
                        </b-form-group>
                      </b-col>
                      <b-col md="4" xl="4">
                        <b-form-group
                          class="mb-0"
                          label-for="group-id-attribute"
                        >
                          <template #label>
                            {{ $t('pageLdap.form.groupIdAttribute') }} -
                            <span class="form-text d-inline">
                              {{ $t('global.form.optional') }}
                            </span>
                          </template>
                          <b-form-input
                            id="group-id-attribute"
                            v-model="form.groupIdAttribute"
                            data-test-id="ldap-input-groupIdAttribute"
                            @change="$v.form.groupIdAttribute.$touch()"
                          />
                        </b-form-group>
                      </b-col>
                    </b-row>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-link
                  class="d-inline-block"
                  to="/security-and-access/certificates"
                >
                  {{ $t('pageLdap.form.manageSslCertificates') }}
                </b-link>
              </b-col>
            </b-row>
          </b-form-group>
        </div>

        <b-row class="mt-lg-3">
          <b-col>
            <b-btn
              variant="primary"
              type="submit"
              class="btn-block"
              data-test-id="ldap-button-saveSettings"
              :disabled="loading"
            >
              {{ $t('global.action.saveSettings') }}
            </b-btn>
          </b-col>
        </b-row>
      </b-form>
    </page-section>

    <!-- Role groups -->
    <page-section :section-title="$t('pageLdap.roleGroups')">
      <div class="section-container">
        <table-role-groups />
      </div>
    </page-section>
  </b-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { find } from 'lodash';
import { requiredIf } from 'vuelidate/lib/validators';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import InfoTooltip from '@/components/Global/InfoTooltip';
import IconAdd from '@/components/icons/IconAdd';
import IconTrashcan from '@/components/icons/IconTrashcan';
import TableRoleGroups from './TableRoleGroups';

export default {
  name: 'Ldap',
  components: {
    IconAdd,
    IconTrashcan,
    InfoTooltip,
    InputPasswordToggle,
    PageTitle,
    PageSection,
    TableRoleGroups,
  },
  mixins: [BVToastMixin, VuelidateMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      form: {
        ldapAuthenticationEnabled: this.$store.getters['ldap/isServiceEnabled'],
        secureLdapEnabled: false,
        activeDirectoryEnabled:
          this.$store.getters['ldap/isActiveDirectoryEnabled'],
        kerberosEnabled: false,
        serverUris: [{ scheme: 'dns:', uri: '' }],
        bindDn: '',
        bindPassword: '',
        baseDn: '',
        userIdAttribute: '',
        groupIdAttribute: '',
        loading,
      },
      schemeOptions: [
        { value: 'dns:', text: 'dns:' },
        { value: 'ldap://', text: 'ldap://' },
        { value: 'ldaps://', text: 'ldaps://' },
      ],
    };
  },
  computed: {
    ...mapGetters('ldap', [
      'isServiceEnabled',
      'isActiveDirectoryEnabled',
      'ldap',
      'activeDirectory',
    ]),
    isDnsSelected() {
      return this.form.serverUris.some(
        (serverUri) => serverUri.scheme === 'dns:',
      );
    },
    canAddMoreServerUris() {
      return !this.isDnsSelected && this.form.serverUris.length < 32;
    },
    availableSchemeOptions() {
      return () => {
        if (this.form.serverUris.length > 1) {
          return this.schemeOptions.filter((option) => option.value !== 'dns:');
        }
        return this.schemeOptions;
      };
    },
    sslCertificates() {
      return this.$store.getters['certificates/allCertificates'];
    },
    caCertificateExpiration() {
      const caCertificate = find(this.sslCertificates, {
        type: 'TrustStore Certificate',
      });
      if (caCertificate === undefined) return null;
      return caCertificate.validUntil;
    },
    ldapCertificateExpiration() {
      const ldapCertificate = find(this.sslCertificates, {
        type: 'LDAP Certificate',
      });
      if (ldapCertificate === undefined) return null;
      return ldapCertificate.validUntil;
    },
  },
  watch: {
    isServiceEnabled: function (value) {
      this.form.ldapAuthenticationEnabled = value;
    },
    isActiveDirectoryEnabled: function (value) {
      this.form.activeDirectoryEnabled = value;
      this.setFormValues();
    },
    'form.activeDirectoryEnabled': function (value) {
      if (value) {
        this.form.kerberosEnabled = true;
      }
    },
  },
  validations: {
    form: {
      ldapAuthenticationEnabled: {},
      secureLdapEnabled: {},
      activeDirectoryEnabled: {
        required: requiredIf(function () {
          return this.form.ldapAuthenticationEnabled;
        }),
      },
      serverUris: {
        required: requiredIf(function () {
          return this.form.ldapAuthenticationEnabled;
        }),
        $each: {
          scheme: {
            required: requiredIf(function () {
              return this.form.ldapAuthenticationEnabled;
            }),
          },
          uri: {
            required: requiredIf(function () {
              return this.form.ldapAuthenticationEnabled;
            }),
          },
        },
      },
      bindDn: {
        required: requiredIf(function () {
          return this.form.ldapAuthenticationEnabled;
        }),
      },
      bindPassword: {
        required: requiredIf(function () {
          return this.form.ldapAuthenticationEnabled;
        }),
      },
      userIdAttribute: {},
      groupIdAttribute: {},
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('ldap/getAccountSettings')
      .finally(() => this.endLoader());
    this.$store
      .dispatch('certificates/getCertificates')
      .finally(() => this.endLoader());
    this.setFormValues();
  },
  methods: {
    setFormValues(serviceType) {
      if (!serviceType) {
        serviceType = this.isActiveDirectoryEnabled
          ? this.activeDirectory
          : this.ldap;
      }
      const {
        serviceAddresses = [],
        bindDn = '',
        baseDn = '',
        userAttribute = '',
        groupsAttribute = '',
      } = serviceType;
      let addresses = [];
      if (serviceAddresses?.length > 0) {
        if (Array.isArray(serviceAddresses[0])) {
          addresses = serviceAddresses?.flat();
        } else {
          addresses = [];
        }
      }
      this.form.serverUris =
        addresses.length > 0
          ? addresses.map((address) => this.parseServiceAddress(address))
          : [{ scheme: 'dns:', uri: '' }];

      this.form.bindDn = bindDn;
      this.form.bindPassword = '';
      this.form.baseDn = baseDn;
      this.form.userIdAttribute = userAttribute;
      this.form.groupIdAttribute = groupsAttribute;
    },
    parseServiceAddress(address) {
      if (address.startsWith('dns:')) {
        return { scheme: 'dns:', uri: address.substring(4) };
      } else if (address.startsWith('ldaps://')) {
        return { scheme: 'ldaps://', uri: address.substring(8) };
      } else if (address.startsWith('ldap://')) {
        return { scheme: 'ldap://', uri: address.substring(7) };
      }
      return { scheme: 'dns:', uri: address };
    },
    buildServiceAddress(serverUri) {
      if (serverUri.scheme === 'dns:') {
        return `dns:${serverUri.uri}`;
      }
      return `${serverUri.scheme}${serverUri.uri}`;
    },
    getUriPlaceholder(scheme) {
      switch (scheme) {
        case 'dns:':
          return 'example.com';
        case 'ldap://':
          return 'dc1-dfo.example.com:389';
        case 'ldaps://':
          return 'dc2-dfo.example.com:636';
        default:
          return '';
      }
    },
    addServerUri() {
      if (this.canAddMoreServerUris) {
        this.form.serverUris.push({ scheme: 'ldap://', uri: '' });
      }
    },
    removeServerUri(index) {
      if (this.form.serverUris.length > 1) {
        this.form.serverUris.splice(index, 1);
      }
    },
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      const serviceAddresses = this.form.serverUris
        .filter((serverUri) => serverUri.uri.trim())
        .map((serverUri) => this.buildServiceAddress(serverUri));
      const data = {
        serviceEnabled: this.form.ldapAuthenticationEnabled,
        activeDirectoryEnabled: this.form.activeDirectoryEnabled,
        serviceAddresses: serviceAddresses,
        bindDn: this.form.bindDn,
        bindPassword: this.form.bindPassword,
        baseDn: this.form.baseDn,
        userIdAttribute: this.form.userIdAttribute,
        groupIdAttribute: this.form.groupIdAttribute,
        kerberosEnabled: this.form.kerberosEnabled,
      };
      this.startLoader();
      this.$store
        .dispatch('ldap/saveAccountSettings', data)
        .then((success) => {
          this.successToast(success);
        })
        .catch(({ message }) => {
          this.errorToast(message);
        })
        .finally(() => {
          this.form.bindPassword = '';
          this.$v.form.$reset();
          this.endLoader();
        });
    },
    onChangeServiceType(isActiveDirectoryEnabled) {
      this.$v.form.activeDirectoryEnabled.$touch();
      const serviceType = isActiveDirectoryEnabled
        ? this.activeDirectory
        : this.ldap;
      // Set form values according to user selected
      // service type
      this.setFormValues(serviceType);
    },
    onChangeldapAuthenticationEnabled(isServiceEnabled) {
      this.$v.form.ldapAuthenticationEnabled.$touch();
      if (!isServiceEnabled) {
        // Request will fail if sent with empty values.
        // The frontend only checks for required fields
        // when the service is enabled. This is to prevent
        // an error if a user clears any properties then
        // disables the service.
        this.setFormValues();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.ldap-certificate-container {
  display: flex;

  @include media-breakpoint-down(sm) {
    gap: 0.875rem;
    margin-bottom: 0.875rem;
  }
}

.ldap-section {
  margin-bottom: 1.75rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid $gray-border;
  @include media-breakpoint-down(sm) {
    gap: 0.875rem;
  }
}

a {
  font-size: clamp(0.875rem, 0.3631rem + 0.6349vw, 1.125rem);
  color: $purple;
}

.wrapper:not(:last-child) {
  @include media-breakpoint-down(sm) {
    margin-bottom: 1rem;
  }
}

.btn-secondary {
  margin-bottom: 0;
  padding: clamp(0.625rem, 0.1131rem + 0.6349vw, 0.875rem)
    clamp(1rem, -0.0238rem + 1.2698vw, 1.5rem);

  @media (max-width: 1110px) {
    font-size: 0.7rem;
    padding: 0.6rem;
  }

  svg {
    margin-left: 1.25rem;
    margin-right: 0;

    @media (max-width: 1110px) {
      margin-left: 1rem;
    }
  }
}

.custom-select,
.form-control {
  height: auto;
  align-self: stretch;
}

.server-uri-container {
  position: relative;

  .form-control {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .custom-select {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .invalid-feedback {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
  }
}

.delete-scheme-button {
  position: absolute;
  right: 0.5rem;
  top: 0;
  bottom: 0;
  background-color: transparent;
  border: none;
  padding: 0;
}
</style>
