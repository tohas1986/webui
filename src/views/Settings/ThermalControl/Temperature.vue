<template>
  <div>
    <h4>{{ $t('pageThermalControl.temperature.fanSpeedAdjustment') }}</h4>
    <b-form inline @submit.prevent="Confirm">
      <b-form-group
        label-class="Fixed-width-6"
        :label="$t('pageThermalControl.temperature.adjustFanSpeedMode')"
        label-for="fan-mode"
        label-align="right"
      >
        <b-form-select
          id="fan-mode"
          v-model="fanMode"
          size="sm"
          :options="fanModeOptions"
          class="mb-0 thisSelect"
        >
        </b-form-select>
      </b-form-group>
      <b-form-group
        v-show="fanMode == 'Manual'"
        label-class="Fixed-width-6"
        :label="$t('pageThermalControl.temperature.speedLevel')"
        label-for="fan-speed-level"
        label-align="right"
      >
        <b-form-select
          id="fan-speed-level"
          v-model="fanSpeedLevel"
          size="sm"
          :options="fanSpeedLevelOptions"
          class="mb-0 thisSelect"
        >
        </b-form-select>
      </b-form-group>
      <div class="center-in mt-4 ml_width">
        <b-btn id="StartUpdate" type="submit" variant="primary">
          {{ $t('global.action.submit') }}
        </b-btn>
      </div>
    </b-form>
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  mixins: [BVToastMixin, LoadingBarMixin],
  data() {
    return {
      fanMode: 'Performance', // Значение по умолчанию из нового API
      fanModeOptions: [
        {
          text: this.$t('pageThermalControl.temperature.acoustic'),
          value: 'Acoustic',
        },
        {
          text: this.$t('pageThermalControl.temperature.performance'),
          value: 'Performance',
        },
        //{
        //  text: this.$t('pageThermalControl.temperature.custom'),
        //  value: 'Manual',
        //},
      ],
      fanSpeedLevel: '20',
      fanSpeedLevelOptions: [
        { text: '20%', value: '20' },
        { text: '40%', value: '40' },
        { text: '60%', value: '60' },
        { text: '80%', value: '80' },
        { text: '100%', value: '100' },
      ],
    };
  },
  computed: {
    BoardID() {
      return this.$store.getters['global/serverConfig']?.BoardID;
    },
    Backplane() {
      return this.$store.getters['ThermalControl/Backplane'];
    },
    fanProfile() {
      return this.$store.getters['ThermalControl/fanProfile'];
    },
  },
  watch: {
    fanProfile(val) {
      if (val && val.Profile) {
        // Преобразуем Profile в fanMode
        if (val.Profile === 'Acoustic' || val.Profile === 'Performance') {
          this.fanMode = val.Profile;
        } //else {
        // Если режим ручной, определяем по ManualPwmPercent
        //  this.fanMode = 'Manual';
        //  if (val.ManualPwmPercent !== undefined) {
        //    this.fanSpeedLevel = val.ManualPwmPercent.toString();
        //  }
        //}
      }
    },
  },
  created() {
    this.getFanProfile();
  },
  methods: {
    async getFanProfile() {
      this.startLoader();
      return await this.$store
        .dispatch('thermal/getFanProfile')
        .finally(() => this.endLoader());
    },

    Confirm() {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageThermalControl.temperature.toast.ConfirmFanContext'),
          {
            title: this.$tc(
              'pageThermalControl.temperature.toast.Confirmtitlefan'
            ),
            okTitle: this.$t('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((isSet) => {
          if (isSet) this.updateFanProfile();
        });
    },

    updateFanProfile() {
      this.startLoader();
      const requestData = {
        Oem: {
          OpenBmc: {
            Fan: {
              Profile: this.fanMode === 'Manual' ? null : this.fanMode,
              ...(this.fanMode === 'Manual' && {
                ManualPwmPercent: parseInt(this.fanSpeedLevel),
              }),
            },
          },
        },
      };

      // Очищаем null значения
      const cleanRequest = (obj) => {
        Object.keys(obj).forEach((key) => {
          if (obj[key] === null || obj[key] === undefined) {
            delete obj[key];
          } else if (typeof obj[key] === 'object') {
            cleanRequest(obj[key]);
            if (Object.keys(obj[key]).length === 0) {
              delete obj[key];
            }
          }
        });
        return obj;
      };

      const cleanedRequest = cleanRequest(requestData);

      this.$store
        .dispatch('thermal/updateFanProfile', cleanedRequest)
        .then((success) => {
          this.successToast(success);
        })
        .catch((message) => {
          this.errorToast(message);
        })
        .finally(() => this.endLoader());
    },
  },
};
</script>

<style scoped>
.ml_width {
  margin-left: 180px;
}
</style>
