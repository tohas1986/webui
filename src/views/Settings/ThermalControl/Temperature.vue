<template>
  <div>
    <!-- <template v-if="showTe">
      <point-echars :board-i-d="BoardID" />
    </template> -->
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
        label-for="fan-mode"
        label-align="right"
      >
        <b-form-select
          id="fan-mode"
          v-model="fanSpeedLevel"
          size="sm"
          :options="fanSpeedLevelOptions"
          class="mb-0 thisSelect"
        >
        </b-form-select>
      </b-form-group>
      <div class="center-in mt-4 ml_width">
        <!-- <b-button  variant="light" class="mr-2" @click="resetFaninfo">
          {{ $t('global.action.reset') }}
        </b-button> -->
        <b-btn id="StartUpdate" type="submit" variant="primary">
          {{ $t('global.action.submit') }}
        </b-btn>
      </div>
    </b-form>
  </div>
</template>

<script>
// import PointEchars from './PointEchars.vue';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
export default {
  components: {
    // PointEchars,
  },
  mixins: [BVToastMixin, LoadingBarMixin],
  data() {
    return {
      fanMode: 'Automatic',
      fanModeOptions: [
        {
          text: this.$t('pageThermalControl.temperature.silent'),
          value: 'Silent',
        },
        {
          text: this.$t('pageThermalControl.temperature.standard'),
          value: 'Automatic',
        },
        {
          text: this.$t('pageThermalControl.temperature.powerful'),
          value: 'Powerful',
        },
        {
          text: this.$t('pageThermalControl.temperature.custom'),
          value: 'Manual',
        },
      ],
      fanSpeedLevel: 'Level1',
      fanSpeedLevelOptions: [
        { text: '20%', value: 'Level1' },
        { text: '40%', value: 'Level2' },
        { text: '60%', value: 'Level3' },
        { text: '80%', value: 'Level4' },
        { text: '100%', value: 'Level5' },
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
    showTe() {
      const serverNames = [
        '0x40054101', //G7466 X5
        '0x40064101', //G7460-X6
        '0x40052101', //R7260L X5
        '0x40062101', //R7260L X6
        '0x40052201', //R7260 X5
        '0x40062201', //R7260 X6
      ];
      const isSupportedServer = serverNames.includes(this.BoardID);
      if (this.BoardID === '0x40064101' && this.Backplane === 'n/a') {
        return false;
      }
      if (this.BoardID === '0x40054101' && this.Backplane === 'n/a') {
        return false;
      }
      return isSupportedServer;
    },
    fanSpeedSettings() {
      return this.$store.getters['ThermalControl/fanSpeedSettings'];
    },
  },
  watch: {
    fanSpeedSettings(val) {
      const defaultFanSpeedLevel = 'Level1';
      if (
        !this.fanSpeedLevelOptions.find(
          (option) => option.value === val.FanSpeedLevel
        )
      ) {
        val.FanSpeedLevel = defaultFanSpeedLevel;
      }
      this.fanMode = val.FanSpeedMode;
      this.fanSpeedLevel = val.FanSpeedLevel;
    },
  },
  created() {
    this.getFanSpeedSettings();
  },

  mounted() {},

  methods: {
    async getFanSpeedSettings() {
      this.startLoader();
      return await this.$store
        .dispatch('thermal/getFanSpeedSettings')
        .finally(() => this.$root.$emit('thermal-temperature-complete'));
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
          if (isSet) this.setFanSpeedSettings();
        });
    },
    setFanSpeedSettings() {
      this.startLoader();
      const req = {
        FanSpeedMode: this.fanMode,
        FanSpeedLevel:
          this.fanMode == 'Automatic' ? 'Level0' : this.fanSpeedLevel,
      };

      this.$store
        .dispatch('thermal/updateFanSpeedSettings', req)
        .then((success) => {
          this.successToast(success);
        })
        .catch((message) => {
          this.errorToast(message);
        })
        .finally(() => this.endLoader());
    },
    resetFaninfo() {
      this.getFanSpeedSettings().finally(() => {
        this.endLoader();
        document.activeElement.blur();
      });
    },
  },
};
</script>
<style scoped>
/* @import url(); 引入css类 */
.ml_width {
  margin-left: 180px;
}
</style>
