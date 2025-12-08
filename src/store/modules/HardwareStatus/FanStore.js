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
          MemberId,
          Name,
          Reading,
          ReadingUnits,
          Status = {},
          PartNumber,
          SerialNumber,
        } = fan;
        return {
          id: MemberId,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          healthRollup: Status.HealthRollup,
          identifyLed: IndicatorLED,
          locationNumber: Location,
          name: Name,
          speed: Reading + ' ' + ReadingUnits,
          statusState: Status.State,
        };
      });
    },
  },
  actions: {
    async getFanInfo({ commit }) {
      return await api
        .get('redfish/v1/Systems/system')
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
