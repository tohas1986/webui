import api from '@/store/api';
import i18n from '@/i18n';

const AssemblyStore = {
  namespaced: true,
  state: {
    storages: null,
  },
  getters: {
    storages: (state) => state.storages,
  },
  mutations: {
    setStorageInfo: (state, data) => {
      state.storages = data.map((storage) => {
        const {
          MemberId,
          PartNumber,
          SerialNumber,
          SparePartNumber,
          Model,
          Name,
          Manufacturer,
          FirmwareVersion,
          ConnectionSpeed,
          SizeInKB,
          Location,
          Wear,
        } = storage;
        return {
          id: MemberId,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          sparePartNumber: SparePartNumber,
          model: Model,
          manufacturer: Manufacturer,
          firmwareVersion: FirmwareVersion,
          speed: ConnectionSpeed,
          size: SizeInKB,
          name: Name,
          location: Location,
          wear: Wear,
          uri: storage['@odata.id'],
        };
      });
    },
  },
  actions: {
    async getStorageInfo({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Storage/1/Drives')
        .then(({ data: { Drives = [] } }) =>
          Drives.map((drive) => api.get(drive['@odata.id'])),
        )
        .then((promises) => api.all(promises))
        .then((response) => {
          const data = response.map(({ data }) => data);
          commit('setStorageInfo', data);
        })
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        Storages: [
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
            i18n.t('pageInventory.toast.errorDisableIdentifyLed'),
          );
        }
      });
    },
  },
};

export default AssemblyStore;
