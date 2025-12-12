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
        .get('redfish/v1/Chassis/2SFF_BP1_FRU')
        .then(({ data: { PCIeDevices = [] } }) =>
          PCIeDevices.map((member) => api.get(member['@odata.id']))
        )
        .then((promises) => api.all(promises))
        .then((response) => {
          const data = response.map(({ data }) => data);
          commit('setFanInfo', data);
        })
        .catch((error) => console.log(error));
    },
  },
};

export default FanStore;
