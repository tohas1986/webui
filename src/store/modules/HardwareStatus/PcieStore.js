import api from '@/store/api';
import i18n from '@/i18n';

const PcieStore = {
  namespaced: true,
  state: {
    pcies: [],
  },
  getters: {
    pcies: (state) => state.pcies,
  },
  mutations: {
    setPciesInfo: (state, data) => {
      state.pcies = data.map((pcie) => {
        const {
          Id,
          Status = {},
          PartNumber,
          SerialNumber,
          Manufacturer,
          Model,
          Name,
          DeviceType,
          Location,
          LocationIndicatorActive,
          Oem,
          PCIeInterface,
        } = pcie;
        return {
          id: Id,
          health: Status.Health,
          healthRollup: Status.HealthRollup,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          statusState: Status.State,
          manufacturer: Manufacturer,
          model: Model,
          name: Name,
          deviceType: DeviceType,
          locationNumber: Location?.PartLocation?.ServiceLabel,
          identifyLed: LocationIndicatorActive,
          uri: pcie['@odata.id'],
          location: Oem?.OpenYard?.Location,
          linkWidth: PCIeInterface?.LanesInUse,
          linkSpeed: PCIeInterface?.PCIeType,
        };
      });
    },
  },
  actions: {
    async getPciesInfo({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/PCIeDevices')
        .then(({ data: { Members = [] } }) =>
          Members.map((member) => api.get(member['@odata.id'])),
        )
        .then((promises) => api.all(promises))
        .then((response) => {
          const data = response.map(({ data }) => data);
          commit('setPciesInfo', data);
        })
        .catch((error) => console.log(error));
    },
    // Waiting for the following to be merged to test the Identify Led:
    // https://gerrit.openbmc-project.xyz/c/openbmc/bmcweb/+/37045
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api.patch(uri, updatedIdentifyLedValue).catch((error) => {
        dispatch('getPciesInfo');
        console.log('error', error);
        if (led.identifyLed) {
          throw new Error(i18n.t('pageInventory.toast.errorEnableIdentifyLed'));
        } else {
          throw new Error(
            i18n.t('pageInventory.toast.errorDisableIdentifyLed'),
          );
        }
      });
    },
  },
};

export default PcieStore;
