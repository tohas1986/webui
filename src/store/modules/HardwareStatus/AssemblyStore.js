import api from '@/store/api';
import i18n from '@/i18n';

const AssemblyStore = {
  namespaced: true,
  state: {
    assemblies: null,
  },
  getters: {
    assemblies: (state) => state.assemblies,
  },
  mutations: {
    setAssemblyInfo: (state, data) => {
      state.assemblies = data.map((assembly) => {
        const {
          Type,
          PartNumber,
          Serial,
          Model,
          Name,
          Location,
          LocationIndicatorActive,
        } = assembly;
        return {
          id: Type,
          partNumber: PartNumber,
          serialNumber: Serial,
          model: Model,
          name: Name,
          locationNumber: Location?.PartLocation?.ServiceLabel,
          identifyLed: LocationIndicatorActive,
          uri: assembly['@odata.id'],
        };
      });
    },
  },
  actions: {
    async getAssemblyInfo({ commit }) {
      return await api
      .get('/redfish/v1/Systems/system/Storage/1')
          .then(({ data: { Drives = [] } }) =>
          Drives.map((member) => api.get(member['@odata.id']))
        )
        .then((promises) => api.all(promises))
        .then((response) => {
          const data = response.map(({ data }) => data);
          commit('setAssemblyInfo', data);
        })
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        Assemblies: [
          {
            MemberId: led.memberId,
            LocationIndicatorActive: led.identifyLed,
          },
        ],
      };

      return await api.patch(uri, updatedIdentifyLedValue).catch((error) => {
        dispatch('getAssemblyInfo');
        console.log('error', error);
        if (led.identifyLed) {
          throw new Error(i18n.t('pageInventory.toast.errorEnableIdentifyLed'));
        } else {
          throw new Error(
            i18n.t('pageInventory.toast.errorDisableIdentifyLed')
          );
        }
      });
    },
  },
};

export default AssemblyStore;
