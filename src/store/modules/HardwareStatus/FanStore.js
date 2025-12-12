import api from '@/store/api';

const FanStore = {
  namespaced: true,
  state: {
    fans: [],
  },
  getters: {
    fans: (state) => state.fans,
  },
  mutations: {
    setFanInfo: (state, data) => {
      state.fans = data.map((fan) => {
        const {
          IndicatorLED,
          Location,
          Id,
          Name,
          Status = {},
          PartNumber,
          Manufacturer,
          SerialNumber,
        } = fan;
        return {
          id: Id,
          health: 'OK',
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          healthRollup: Status.HealthRollup,
          identifyLed: IndicatorLED,
          locationNumber: Location,
          name: Name,
          manufacturer: Manufacturer,
          statusState: Status.State,
        };
      });
    },
  },
  actions: {
    async getFanInfo({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/PCIeDevices')
        .then(({ data: { Members } }) => {
          const promises = Members.map((item) => api.get(item['@odata.id']));
          return api.all(promises);
        })
        .then((response) => commit('setFanInfo', response))
        .catch((error) => console.log(error));
    },
  },
};

export default FanStore;
