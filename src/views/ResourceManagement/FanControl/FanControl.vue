<template>
  <b-container fluid>
    <page-title />
    <page-section :section-title="$t('pageFanControl.fanSettings')">
      <b-form novalidate @submit.prevent="handleSubmit">
        <div class="section-container">
          <b-row class="mb-3">
            <b-col sm="12">
              <b-form-group
                :label="$t('pageFanControl.form.fanMode')"
                label-for="fan-mode"
              >
                <b-select
                  id="fan-mode"
                  v-model="form.fanMode"
                  :options="fanControlOptions"
                ></b-select>
              </b-form-group>
            </b-col>
          </b-row>
          <template v-if="form.fanMode === 'Manual'">
            <b-row>
              <b-col sm="12">
                <label class="mb-2">{{ $t('pageFanControl.form.duty') }}</label>
              </b-col>
              <b-col
                v-for="(fan, idx) in filteredFansPwmList"
                :key="idx"
                sm="12"
                xl="6"
                class="mb-3"
              >
                <div class="section-container">
                  <b-row>
                    <b-col sm="4" class="text-divider">
                      <h3>{{ fan.Name }} - {{ form.fanReading[idx] }}%</h3>
                    </b-col>
                    <b-col sm="8">
                      <b-form-group>
                        <b-form-input
                          v-model="form.fanReading[idx]"
                          type="range"
                          min="0"
                          max="100"
                        ></b-form-input>
                      </b-form-group>
                    </b-col>
                  </b-row>
                </div>
              </b-col>
            </b-row>
          </template>
          <template v-if="form.fanMode === 'Auto'">
            <b-card class="row">
              <b-tabs card>
                <b-tab
                  v-if="fansGroup.Stepwise_CPU"
                  :title="$t('pageFanControl.cpu')"
                >
                  <fan-control-stepwise-tab
                    :steps="fansGroup.Stepwise_CPU.Steps"
                    :outputs="form.cpuOutput"
                    :targets="form.cpuTarget"
                    :zones="fansGroup.Stepwise_CPU.Zones"
                    :sensors="fansGroup.Stepwise_CPU.Inputs"
                    @update:outputs="(val) => (form.cpuOutput = val)"
                    @update:targets="(val) => (form.cpuTarget = val)"
                  />
                </b-tab>
                <b-tab
                  v-if="fansGroup.Stepwise_CPU_DIMM"
                  :title="$t('pageFanControl.cpuDimm')"
                >
                  <fan-control-stepwise-tab
                    :steps="fansGroup.Stepwise_CPU_DIMM.Steps"
                    :outputs="form.cpuDimmOutput"
                    :targets="form.cpuDimmTarget"
                    :zones="fansGroup.Stepwise_CPU_DIMM.Zones"
                    :sensors="fansGroup.Stepwise_CPU_DIMM.Inputs"
                    @update:outputs="(val) => (form.cpuDimmOutput = val)"
                    @update:targets="(val) => (form.cpuDimmTarget = val)"
                  />
                </b-tab>
                <b-tab
                  v-if="fansGroup.Stepwise_CPU_DTS"
                  :title="$t('pageFanControl.cpuDts')"
                >
                  <fan-control-stepwise-tab
                    :steps="fansGroup.Stepwise_CPU_DTS.Steps"
                    :outputs="form.cpuDtsOutput"
                    :targets="form.cpuDtsTarget"
                    :zones="fansGroup.Stepwise_CPU_DTS.Zones"
                    :sensors="fansGroup.Stepwise_CPU_DTS.Inputs"
                    @update:outputs="(val) => (form.cpuDtsOutput = val)"
                    @update:targets="(val) => (form.cpuDtsTarget = val)"
                  />
                </b-tab>
                <b-tab
                  v-if="fansGroup.Stepwise_CPU_Die"
                  :title="$t('pageFanControl.cpuDie')"
                >
                  <fan-control-stepwise-tab
                    :steps="fansGroup.Stepwise_CPU_Die.Steps"
                    :outputs="form.cpuOutput"
                    :targets="form.cpuTarget"
                    :zones="fansGroup.Stepwise_CPU_Die.Zones"
                    :sensors="fansGroup.Stepwise_CPU_Die.Inputs"
                    @update:outputs="(val) => (form.cpuDieOutput = val)"
                    @update:targets="(val) => (form.cpuDieTarget = val)"
                  />
                </b-tab>
              </b-tabs>
              <b-row class="justify-content-center">
                <div class="btn-container">
                  <b-button
                    variant="link"
                    class="btn-table"
                    :href="ExportFanProfile"
                    ><icon-export /> {{ $t('pageFanControl.form.btnExport') }}
                  </b-button>
                  <b-button
                    v-b-modal.upload-fan-profile
                    variant="link"
                    class="btn-table"
                  >
                    <icon-upload />
                    {{ $t('pageFanControl.form.btnImport') }}</b-button
                  >
                </div>
              </b-row>
            </b-card>
          </template>
        </div>
        <div>
          <b-row>
            <b-col>
              <b-button
                type="submit"
                class="btn-block btn-mt"
                variant="primary"
                >{{ $t('pageFanControl.form.fanBtnSave') }}</b-button
              >
            </b-col>
          </b-row>
        </div>
      </b-form>
    </page-section>

    <modal-upload-fan-profile @ok="onModalOk" />
  </b-container>
</template>

<script>
import { mapState } from 'vuex';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import IconExport from '@/components/icons/IconExport';
import IconUpload from '@carbon/icons-vue/es/upload/20';
import ModalUploadFanProfile from './ModalUploadFanProfile';
import FanControlStepwiseTab from './FanControlStepwiseTab.vue';

export default {
  name: 'FanProfile',
  components: {
    PageTitle,
    PageSection,
    IconExport,
    IconUpload,
    ModalUploadFanProfile,
    FanControlStepwiseTab,
  },
  mixins: [BVToastMixin, LoadingBarMixin],
  data() {
    return {
      form: {
        fanMode: this.$store.getters['fanControl/fanControlMode'],
        fanReading: [],
        cpuOutput: [],
        cpuTarget: [],
        cpuDimmOutput: [],
        cpuDimmTarget: [],
        cpuDtsOutput: [],
        cpuDtsTarget: [],
        cpuDieOutput: [],
        cpuDieTarget: [],
      },
    };
  },
  computed: {
    ...mapState('fanControl', [
      'fanControlOptions',
      'fanControlMode',
      'fansList',
      'fansGroup',
    ]),
    fansPwmList() {
      return this.fansList
        .filter((fan) => fan.Name.includes('Pwm'))
        .map((fan) => {
          return fan;
        });
    },
    filteredFansPwmList() {
      return this.fansPwmList.filter(
        (fan) => fan.Name !== 'Pwm PSU2 Fan 1' && fan.Name !== 'Pwm PSU1 Fan 1',
      );
    },
    ExportFanProfile() {
      return '/redfish/v1/Managers/bmc/pid/';
    },
  },
  watch: {
    fanControlMode(value) {
      this.form.fanMode = value;
    },
    fansPwmList(value) {
      this.form.fanReading = value.map((fan) => fan.Reading);
    },
    fansGroup(value) {
      const mappings = {
        Stepwise_CPU: ['cpuOutput', 'cpuTarget'],
        Stepwise_CPU_DIMM: ['cpuDimmOutput', 'cpuDimmTarget'],
        Stepwise_CPU_DTS: ['cpuDtsOutput', 'cpuDtsTarget'],
        Stepwise_CPU_Die: ['cpuDieOutput', 'cpuDieTarget'],
      };

      for (const [key, [outputKey, targetKey]] of Object.entries(mappings)) {
        this.updateStepwiseForm(value?.[key]?.Steps, outputKey, targetKey);
      }
    },
  },
  created() {
    this.startLoader();
    this.getFansList();
    this.$store
      .dispatch('fanControl/getFanControlSettings')
      .finally(() => this.endLoader());
  },
  methods: {
    generateStepwiseSteps(outputArray, targetArray) {
      return outputArray
        .map((output, index) => ({
          Output: output,
          Target: targetArray[index],
        }))
        .filter((step) => step.Output != null && step.Target != null);
    },

    updateStepwiseForm(steps, outputKey, targetKey) {
      if (!Array.isArray(steps)) return;

      steps.forEach((step, i) => {
        this.$set(this.form[outputKey], i, step?.Output ?? null);
        this.$set(this.form[targetKey], i, step?.Target ?? null);
      });
    },

    getAutoSteps() {
      const configs = [
        { key: 'cpu', name: 'Stepwise_CPU' },
        { key: 'cpuDimm', name: 'Stepwise_CPU_DIMM' },
        { key: 'cpuDts', name: 'Stepwise_CPU_DTS' },
        { key: 'cpuDie', name: 'Stepwise_CPU_Die' },
      ];

      return configs.reduce((acc, { key, name }) => {
        const outputs = this.form[`${key}Output`] || [];
        const targets = this.form[`${key}Target`] || [];

        const steps = this.generateStepwiseSteps(outputs, targets);

        if (steps.length > 0) {
          acc[name] = { Steps: steps };
        }

        return acc;
      }, {});
    },

    getManualReadings() {
      return {
        Fans: this.filteredFansPwmList.map((fan, idx) => ({
          MemberId: fan.MemberId,
          Reading: Number(this.form.fanReading[idx] ?? 0),
        })),
      };
    },

    async handleSubmit() {
      try {
        this.startLoader();

        const fanControlMode = this.form.fanMode;
        if (!fanControlMode) {
          this.errorToast(this.$t('pageFanControl.toast.invalidFanMode'));
          return;
        }

        const baseSettings = {
          Oem: { OpenBmc: { Fan: { Profile: fanControlMode } } },
        };

        await this.$store.dispatch(
          'fanControl/saveFanControlSettings',
          baseSettings,
        );

        if (fanControlMode === 'Manual') {
          const manualReadings = this.getManualReadings();
          await this.$store.dispatch(
            'fanControl/saveFanControlSettingsReading',
            manualReadings,
          );
        } else if (fanControlMode === 'Auto') {
          const autoSteps = this.getAutoSteps();
          if (Object.keys(autoSteps).length > 0) {
            const autoSettings = {
              Oem: { OpenBmc: { Fan: { StepwiseControllers: autoSteps } } },
            };
            await this.$store.dispatch(
              'fanControl/saveFanControlSettings',
              autoSettings,
            );
          }
        }

        this.successToast(this.$t('pageFanControl.toast.saveSettingsSuccess'));
      } catch (error) {
        this.errorToast(this.$t('pageFanControl.toast.saveSettingsError'));
      } finally {
        this.endLoader();
      }
    },
    getFansList() {
      this.$store.dispatch('fanControl/getFansList');
    },
    onModalOk(file) {
      this.startLoader();
      this.$store
        .dispatch('fanControl/importFanProfile', file)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>

<style lang="scss" scoped>
dt {
  color: $main-color;
  text-wrap: nowrap;
}

dd {
  text-wrap: nowrap;
}

.card {
  background-color: $gray-light;
}

.card-body {
  padding: 1rem;
  padding-top: 0;
}

.btn-container {
  bottom: 0;
}

.col-lg-1 {
  flex: 0 0 11% !important;
  max-width: 11% !important;
}

.form-group {
  margin-bottom: 0;
}

.text-divider {
  &::after {
    @include media-breakpoint-only(xs) {
      content: none;
    }
  }
}
</style>
