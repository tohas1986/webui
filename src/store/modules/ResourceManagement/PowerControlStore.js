import api from '@/store/api';
import i18n from '@/i18n';

const PowerControlStore = {
  namespaced: true,
  state: {
    powerCapValue: null,
    powerCapUri: '',
    powerConsumptionValue: null,
    powerCpuConsumptionValue: null,
  },
  getters: {
    powerCapValue: (state) => state.powerCapValue,
    powerCapUri: (state) => state.powerCapUri,
    powerConsumptionValue: (state) => state.powerConsumptionValue,
    powerCpuConsumptionValue: (state) => state.powerCpuConsumptionValue,
  },
  mutations: {
    setPowerCapValue: (state, powerCapValue) =>
      (state.powerCapValue = powerCapValue),
    setPowerCapUri: (state, powerCapUri) => (state.powerCapUri = powerCapUri),
    setPowerConsumptionValue: (state, powerConsumptionValue) =>
      (state.powerConsumptionValue = powerConsumptionValue),
    setCpuPowerConsumptionValue: (state, powerCpuConsumptionValue) =>
      (state.powerCpuConsumptionValue = powerCpuConsumptionValue),
  },
  actions: {
    setPowerCapUpdatedValue({ commit }, value) {
      commit('setPowerCapValue', value);
    },
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/')
        .then((response) => api.get(response.data.Chassis['@odata.id']))
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    /*async getPowerControl({ commit }) {
      api
        .get('/redfish/v1/Chassis/System_FRU/Sensors/Total_Power')
        .then(({ data: { Reading } } = {}) => {
          commit('setPowerConsumptionValue', Reading);
        })
        .catch((error) => console.log(error));
    },
    async getCpuPowerControl({ commit }) {
      api
        .get('/redfish/v1/Chassis/System_FRU/Sensors/CPU_Power')
        .then(({ data: { Reading } } = {}) => {
          commit('setCpuPowerConsumptionValue', Reading);
        })
        .catch((error) => console.log(error));
    },*/
    async getPowerControl({ commit }) {
      try {
        // Запрашиваем оба эндпоинта параллельно
        const [totalPowerRes, cpuPowerRes] = await Promise.all([
          api.get('/redfish/v1/Chassis/System_FRU/Sensors/Total_Power'),
          api.get('/redfish/v1/Chassis/System_FRU/Sensors/CPU_Power'),
        ]);
        // Извлекаем значения из ответо
        const totalPower = totalPowerRes.data?.Reading || 0;
        const cpuPower = cpuPowerRes.data?.Reading || 0;
        // Коммитим оба значения
        commit('setPowerConsumptionValue', totalPower);
        commit('setCpuPowerConsumptionValue', cpuPower);
        // Опционально: можно вернуть оба значения
        // return { totalPower, cpuPower };
      } catch (error) {
        console.log('Power control data error', error.message);
        // В случае ошибки можно закоммитить значения по умолчанию
        commit('setPowerConsumptionValue', 0);
        commit('setCpuPowerConsumptionValue', 0);
      }
    },
    async getPowerControl_legacy({ dispatch, commit }) {
      const collection = await dispatch('getChassisCollection');
      if (!collection || collection.length === 0) return;
      return await api
        .get(`${collection[0]}`)
        .then((response) => api.get(response.data.Power['@odata.id']))
        .then((response) => {
          const powerControl = response.data.PowerControl;
          if (!powerControl || powerControl.length === 0) return;
          const powerCapUri = powerControl[0]['@odata.id'];
          const powerCap = powerControl[0].PowerLimit.LimitInWatts;
          // If system is powered off, power consumption does not exist in the PowerControl
          //const powerConsumption = powerControl[0].PowerConsumedWatts || null;
          commit('setPowerCapUri', powerCapUri);
          commit('setPowerCapValue', powerCap);
        })
        .catch((error) => {
          console.log('Power control', error);
        });
    },
    async setPowerControl({ state }, powerCapValue) {
      const data = {
        PowerControl: [{ PowerLimit: { LimitInWatts: powerCapValue } }],
      };
      return await api
        .patch(state.powerCapUri, data)
        .then(() =>
          i18n.t('pageServerPowerOperations.toast.successSaveSettings')
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
          );
        });
    },
  },
};

export default PowerControlStore;
