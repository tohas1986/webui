import api from '@/store/api';

const PowerSupplyStore = {
  namespaced: true,
  state: {
    powerSupplies: [],
  },
  getters: {
    powerSupplies: (state) => state.powerSupplies,
  },
  mutations: {
    setPowerSupply: (state, data) => {
      state.powerSupplies = data.map((powerSupply) => {
        const {
          FirmwareVersion,
          LocationIndicatorActive,
          PsuId,
          PsuManufacturer,
          PsuProductName,
          PsuProductSerial,
          Location,
          Status = {},
        } = powerSupply;
        return {
          id: PsuId,
          health: Status.Health,
          serialNumber: PsuProductSerial,
          firmwareVersion: FirmwareVersion,
          identifyLed: LocationIndicatorActive,
          manufacturer: PsuManufacturer,
          model: PsuProductName,
          name: PsuProductName,
          locationNumber: Location?.PartLocation?.ServiceLabel,
          statusState: Status.State,
        };
      });
    },
  },
  actions: {
    async getAllPowerSupplies({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Processors')
        .then(({ data: { Members = [] } }) =>
          Members.map((member) => api.get(member['@odata.id']))
        )
        .then((promises) => api.all(promises))
        .then((response) => {
          const data = response.map(({ data }) => data);
          commit('setPowerSupply', data);
        })
        .catch((error) => console.log(error));
    },
  },
};

export default PowerSupplyStore;
