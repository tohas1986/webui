<template>
  <b-container fluid>
    <page-title />
    <b-form novalidate @submit.prevent="handleSubmit">
      <b-form-group :disabled="disabledSyslog">
        <div class="section-container">
          <b-row>
            <b-col sm="12" lg="6">
              <b-form-group :label="$t('pageSyslog.protocolTcp')">
                <b-form-checkbox
                  id="protocolTcpSwitch"
                  v-model="form.protocolTcp"
                  switch
                  value="Enabled"
                  unchecked-value="Disabled"
                >
                  {{ $t('global.status.enabled') }}
                </b-form-checkbox>
              </b-form-group>
              <b-form-group :disabled="disabledTcp">
                <b-row>
                  <b-col sm="12" lg="6">
                    <b-form-group
                      for="ip-tcp"
                      :label="$t('pageSyslog.ipAddress')"
                    >
                      <b-form-input
                        id="ip-tcp"
                        v-model="form.ipTcp"
                        :state="getValidationState($v.form.ipTcp)"
                        @change="$v.form.ipTcp.$touch()"
                      ></b-form-input>
                      <b-form-invalid-feedback role="alert">
                        {{ $t('global.form.fieldRequired') }}
                      </b-form-invalid-feedback>
                    </b-form-group>
                  </b-col>
                  <b-col sm="12" lg="6">
                    <b-form-group for="port-tcp" :label="$t('pageSyslog.port')">
                      <b-form-input
                        id="port-tcp"
                        v-model="form.portTcp"
                        type="number"
                        number
                        :state="getValidationState($v.form.portTcp)"
                        @change="$v.form.portTcp.$touch()"
                      ></b-form-input>
                      <b-form-invalid-feedback role="alert">
                        <template v-if="!$v.form.portTcp.required">
                          {{ $t('global.form.fieldRequired') }}
                        </template>
                      </b-form-invalid-feedback>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col sm="12" lg="6">
                    <b-form-group
                      for="interval-tcp"
                      :label="$t('pageSyslog.interval')"
                    >
                      <b-form-input
                        id="interval-tcp"
                        v-model="form.intervalTcp"
                        type="number"
                        number
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                  <b-col sm="12" lg="6">
                    <b-form-group
                      for="limit-tcp"
                      :label="$t('pageSyslog.entryLimit')"
                    >
                      <b-form-input
                        id="limit-tcp"
                        v-model="form.limitTcp"
                        type="number"
                        number
                      ></b-form-input
                    ></b-form-group>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col sm="12">
                    <b-form-group :label="$t('pageSyslog.sources')">
                      <b-form-tags
                        v-model="form.sourcesTcp"
                        add-on-change
                        no-outer-focus
                      >
                        <template
                          #default="{
                            tags,
                            inputAttrs,
                            inputHandlers,
                            disabled,
                            removeTag,
                          }"
                        >
                          <ul
                            v-if="tags.length > 0"
                            class="list-inline d-inline-block mb-2"
                          >
                            <li
                              v-for="tag in tags"
                              :key="tag"
                              class="list-inline-item"
                            >
                              <b-form-tag
                                :title="tag"
                                :disabled="disabled"
                                variant="secondary"
                                class="badge-pill"
                                @remove="removeTag(tag)"
                                >{{ tag }}</b-form-tag
                              >
                            </li>
                          </ul>
                          <b-form-select
                            v-bind="inputAttrs"
                            :disabled="
                              disabled || availableOptionsTcp.length === 0
                            "
                            :options="availableOptionsTcp"
                            v-on="inputHandlers"
                          >
                            <template #first>
                              <option disabled value="">
                                {{ $t('global.form.selectAnOption') }}
                              </option>
                            </template>
                          </b-form-select>
                        </template></b-form-tags
                      >
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-form-group>
            </b-col>
            <b-col sm="12" lg="6">
              <b-form-group :label="$t('pageSyslog.protocolUdp')">
                <b-form-checkbox
                  id="protocolUdpSwitch"
                  v-model="form.protocolUdp"
                  switch
                  value="Enabled"
                  unchecked-value="Disabled"
                >
                  {{ $t('global.status.enabled') }}
                </b-form-checkbox>
              </b-form-group>
              <b-form-group :disabled="disabledUdp">
                <b-row>
                  <b-col sm="12" lg="6">
                    <b-form-group
                      for="ip-udp"
                      :label="$t('pageSyslog.ipAddress')"
                    >
                      <b-form-input
                        id="ip-udp"
                        v-model="form.ipUdp"
                        :state="getValidationState($v.form.ipUdp)"
                        @change="$v.form.ipUdp.$touch()"
                      ></b-form-input>
                      <b-form-invalid-feedback role="alert">
                        {{ $t('global.form.fieldRequired') }}
                      </b-form-invalid-feedback>
                    </b-form-group>
                  </b-col>
                  <b-col sm="12" lg="6">
                    <b-form-group for="port-udp" :label="$t('pageSyslog.port')">
                      <b-form-input
                        id="port-udp"
                        v-model="form.portUdp"
                        number
                        :state="getValidationState($v.form.portUdp)"
                        @change="$v.form.portUdp.$touch()"
                      ></b-form-input>
                      <b-form-invalid-feedback role="alert">
                        {{ $t('global.form.fieldRequired') }}
                      </b-form-invalid-feedback>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col sm="12" lg="6">
                    <b-form-group
                      for="interval-udp"
                      :label="$t('pageSyslog.interval')"
                    >
                      <b-form-input
                        id="interval-udp"
                        v-model="form.intervalUdp"
                        type="number"
                        number
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                  <b-col sm="12" lg="6">
                    <b-form-group
                      for="limit-udp"
                      :label="$t('pageSyslog.entryLimit')"
                    >
                      <b-form-input
                        id="limit-udp"
                        v-model="form.limitUdp"
                        type="number"
                        number
                      ></b-form-input
                    ></b-form-group>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col sm="12">
                    <b-form-group :label="$t('pageSyslog.sources')">
                      <b-form-tags
                        v-model="form.sourcesUdp"
                        add-on-change
                        no-outer-focus
                      >
                        <template
                          #default="{
                            tags,
                            inputAttrs,
                            inputHandlers,
                            disabled,
                            removeTag,
                          }"
                        >
                          <ul
                            v-if="tags.length > 0"
                            class="list-inline d-inline-block mb-2"
                          >
                            <li
                              v-for="tag in tags"
                              :key="tag"
                              class="list-inline-item"
                            >
                              <b-form-tag
                                :title="tag"
                                :disabled="disabled"
                                variant="secondary"
                                class="badge-pill"
                                @remove="removeTag(tag)"
                                >{{ tag }}</b-form-tag
                              >
                            </li>
                          </ul>
                          <b-form-select
                            v-bind="inputAttrs"
                            :disabled="
                              disabled || availableOptionsUdp.length === 0
                            "
                            :options="availableOptionsUdp"
                            v-on="inputHandlers"
                          >
                            <template #first>
                              <option disabled value="">
                                {{ $t('global.form.selectAnOption') }}
                              </option>
                            </template>
                          </b-form-select>
                        </template></b-form-tags
                      >
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-form-group>
            </b-col>
          </b-row>
        </div>
        <b-button type="submit" class="btn-block btn-mt" variant="primary">
          {{ $t('global.action.saveSettings') }}</b-button
        >
      </b-form-group>
    </b-form>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { mapState } from 'vuex';
import { requiredIf } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import FormDiffMixin from '@/components/Mixins/FormDiffMixin';

export default {
  name: 'Syslog',
  components: { PageTitle },
  mixins: [LoadingBarMixin, BVToastMixin, VuelidateMixin, FormDiffMixin],
  data() {
    return {
      loading,
      form: {
        protocolTcp: '',
        protocolUdp: '',
        ipTcp: '',
        ipUdp: '',
        portTcp: '',
        portUdp: '',
        intervalTcp: '',
        intervalUdp: '',
        limitTcp: '',
        limitUdp: '',
        sourcesTcp: [],
        sourcesUdp: [],
      },
      currentForm: {},
      sources: ['IPMI', 'Auditlog', 'BMC', 'Redfish'],
    };
  },
  computed: {
    ...mapState('syslog', ['syslogTcp', 'syslogUdp']),
    protocolTcp() {
      const [dataTcp] = this.syslogTcp;
      return dataTcp;
    },
    protocolUdp() {
      const [dataUdp] = this.syslogUdp;
      return dataUdp;
    },
    disabledTcp() {
      if (
        this.form.protocolTcp === 'Disabled' ||
        this.form.protocolTcp === ''
      ) {
        return true;
      }
      return false;
    },
    disabledUdp() {
      if (
        this.form.protocolUdp === 'Disabled' ||
        this.form.protocolUdp === ''
      ) {
        return true;
      }
      return false;
    },
    disabledSyslog() {
      if (this.syslogTcp.length === 0 && this.syslogUdp.length === 0) {
        return true;
      }
      return false;
    },
    availableOptionsTcp() {
      return this.sources.filter(
        (opt) => this.form.sourcesTcp.indexOf(opt) === -1,
      );
    },
    availableOptionsUdp() {
      return this.sources.filter(
        (opt) => this.form.sourcesUdp.indexOf(opt) === -1,
      );
    },
  },
  watch: {
    protocolTcp: function (value) {
      this.form.protocolTcp = value.state;
      this.form.ipTcp = value.ip;
      this.form.portTcp = value.port;
      this.form.intervalTcp = value.interval;
      this.form.limitTcp = value.limit;
      this.form.sourcesTcp = value.sources;
      this.currentForm = JSON.parse(JSON.stringify(this.form));
    },
    protocolUdp: function (value) {
      this.form.protocolUdp = value.state;
      this.form.ipUdp = value.ip;
      this.form.portUdp = value.port;
      this.form.intervalUdp = value.interval;
      this.form.limitUdp = value.limit;
      this.form.sourcesUdp = value.sources;
      this.currentForm = JSON.parse(JSON.stringify(this.form));
    },
  },
  validations: {
    form: {
      ptotocolTcp: {},
      protocolUdp: {},
      ipTcp: {
        required: requiredIf(function () {
          if (this.form.protocolTcp === 'Disabled') {
            return false;
          }
          if (this.form.protocolTcp === 'Enabled') {
            return true;
          }
        }),
      },
      portTcp: {
        required: requiredIf(function () {
          if (this.form.protocolTcp === 'Disabled') {
            return false;
          }
          if (this.form.protocolTcp === 'Enabled') {
            return true;
          }
        }),
      },
      ipUdp: {
        required: requiredIf(function () {
          if (this.form.protocolUdp === 'Disabled') {
            return false;
          }
          if (this.form.protocolUdp === 'Enabled') {
            return true;
          }
        }),
      },
      portUdp: {
        required: requiredIf(function () {
          if (this.form.protocolUdp === 'Disabled') {
            return false;
          }
          if (this.form.protocolUdp === 'Enabled') {
            return true;
          }
        }),
      },
      // sourcesTcp: {
      //   required: requiredIf(function () {
      //     if (this.form.protocolTcp === 'Disabled') {
      //       return false;
      //     }
      //     if (this.form.protocolTcp === 'Enabled') {
      //       return true;
      //     }
      //   }),
      // },
      // sourcesUdp: {
      //   required: requiredIf(function () {
      //     if (this.form.protocolUdp === 'Disabled') {
      //       return false;
      //     }
      //     if (this.form.protocolUdp === 'Enabled') {
      //       return true;
      //     }
      //   }),
      // },
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('syslog/getSyslog').finally(() => this.endLoader());
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;

      const modifiedForm = this.getModifiedFields(this.form, this.currentForm, [
        'protocolTcp',
        'protocolUdp',
      ]);

      const settingsTcp = {
        Status: {
          State: this.form.protocolTcp,
        },
      };

      if (this.form.protocolTcp === 'Enabled') {
        const oemDataTcp = {};
        if (modifiedForm.ipTcp !== undefined)
          oemDataTcp.IPAddress = modifiedForm.ipTcp;
        if (modifiedForm.portTcp !== undefined)
          oemDataTcp.Port = modifiedForm.portTcp;
        if (modifiedForm.intervalTcp !== undefined)
          oemDataTcp.Interval = modifiedForm.intervalTcp;
        if (modifiedForm.limitTcp !== undefined)
          oemDataTcp.EntryLimit = modifiedForm.limitTcp;
        if (modifiedForm.sourcesTcp !== undefined)
          oemDataTcp.Sources = modifiedForm.sourcesTcp;

        if (Object.keys(oemDataTcp).length > 0) {
          settingsTcp.Oem = { OpenYard: oemDataTcp };
        }
      }

      const settingsUdp = {
        Status: {
          State: this.form.protocolUdp,
        },
      };

      if (this.form.protocolUdp === 'Enabled') {
        const oemDataUdp = {};
        if (modifiedForm.ipUdp !== undefined)
          oemDataUdp.IPAddress = modifiedForm.ipUdp;
        if (modifiedForm.portUdp !== undefined)
          oemDataUdp.Port = modifiedForm.portUdp;
        if (modifiedForm.intervalUdp !== undefined)
          oemDataUdp.Interval = modifiedForm.intervalUdp;
        if (modifiedForm.limitUdp !== undefined)
          oemDataUdp.EntryLimit = modifiedForm.limitUdp;
        if (modifiedForm.sourcesUdp !== undefined)
          oemDataUdp.Sources = modifiedForm.sourcesUdp;

        if (Object.keys(oemDataUdp).length > 0) {
          settingsUdp.Oem = { OpenYard: oemDataUdp };
        }
      }

      const saveTcp = () => this.sendSyslog(this.protocolTcp.id, settingsTcp);
      const saveUdp = () => this.sendSyslog(this.protocolUdp.id, settingsUdp);

      Promise.all([saveTcp(), saveUdp()])
        .then(() => {
          this.successToast(this.$t('pageSyslog.toast.saveSettingsSuccess'));
          this.currentForm = JSON.parse(JSON.stringify(this.form));
        })
        .catch(() => {
          this.errorToast(this.$t('pageSyslog.toast.saveSettingsError'));
        })
        .finally(() => {
          this.$v.form.$reset();
          this.endLoader();
        });
    },
    sendSyslog(id, data) {
      return this.$store.dispatch('syslog/saveSettingSyslog', {
        id,
        data,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
