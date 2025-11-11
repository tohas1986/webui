import api from '@/store/api';
import i18n from '@/i18n';

const FanControlStore = {
  namespaced: true,
  state: {
    fanControlOptions: [],
    fanControlMode: null,
    fansList: [],
    fansGroup: [],
  },
  getters: {
    fanControlOptions: (state) => state.fanControlOptions,
    fanControlZones: (state) => state.fanControlZones,
    fanControlMode: (state) => state.fanControlMode,
    fansList: (state) => state.fansList,
    fansGroup: (state) => state.fansGroup,
  },
  mutations: {
    setFanControlOptions: (state, fanControlOptions) =>
      (state.fanControlOptions = fanControlOptions),
    setFanControlMode: (state, fanControlMode) =>
      (state.fanControlMode = fanControlMode),
    setFanControlZones: (state, fanControlZones) =>
      (state.fanControlZones = fanControlZones),
    setFansList: (state, fansList) => (state.fansList = fansList),
    setFanControlGroups: (state, fansGroup) => (state.fansGroup = fansGroup),
  },
  actions: {
    async getFanControlSettings({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/')
        .then(
          ({
            data: {
              Oem: {
                OpenBmc: { Fan },
              },
            },
          }) => {
            commit(
              'setFanControlOptions',
              Fan['Profile@Redfish.AllowableValues'],
            );
            commit('setFanControlMode', Fan.Profile);
            commit('setFanControlGroups', Fan.StepwiseControllers);
          },
        )
        .catch((error) => console.log(error));
    },
    async getFansList({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/Openyard_Server_Baseboard/Thermal')
        .then((response) => {
          commit('setFansList', response.data.Fans);
        });
    },
    async saveFanControlSettings(_, data) {
      return api.patch('/redfish/v1/Managers/bmc', data).catch((error) => {
        console.log('Save Settings:', error);
        throw new Error();
      });
    },
    saveFanControlSettingsReading(_, data) {
      return api
        .patch('/redfish/v1/Chassis/Openyard_Server_Baseboard/Thermal', data)
        .catch((error) => {
          console.log('Save Settings:', error);
          throw new Error();
        });
    },
    async importFanProfile({ dispatch }, file) {
      return await api
        .put('/redfish/v1/Managers/bmc/pid ', file)
        .then(() => dispatch('getFanControlSettings'))
        .then(() => i18n.t('pageFanControl.toast.successImportProfile'))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageFanControl.toast.errorImportProfile'));
        });
    },
  },
};

export default FanControlStore;
