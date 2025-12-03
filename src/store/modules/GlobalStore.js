import api from '@/store/api';
import i18n from '@/i18n';

const HOST_STATE = {
  on: 'xyz.openbmc_project.State.Host.HostState.Running',
  off: 'xyz.openbmc_project.State.Host.HostState.Off',
  error: 'xyz.openbmc_project.State.Host.HostState.Quiesced',
  diagnosticMode: 'xyz.openbmc_project.State.Host.HostState.DiagnosticMode',
};

const serverStateMapper = (hostState) => {
  switch (hostState) {
    case HOST_STATE.on:
    case 'On': // Redfish PowerState
      return 'on';
    case HOST_STATE.off:
    case 'Off': // Redfish PowerState
      return 'off';
    case HOST_STATE.error:
    case 'Quiesced': // Redfish Status
      return 'error';
    case HOST_STATE.diagnosticMode:
    case 'InTest': // Redfish Status
      return 'diagnosticMode';
    default:
      return 'unreachable';
  }
};
let updateTimeTimer = null;

const GlobalStore = {
  namespaced: true,
  state: {
    serverName: '',
    serverConfig: null,
    uidStatus: null,
    assetTag: null,
    loginTime: null,
    bmcTime: null,
    timezone: null,
    timeZoneDst: null,
    modelType: null,
    serialNumber: null,
    serverStatus: 'unreachable',
    powerStatus: null,
    powerlastTime: null,
    powerInput: null,
    languagePreference: 'en-US',
    isUtcDisplay: true,
    //  localStorage.getItem('storedUtcDisplay')
    //   ? JSON.parse(localStorage.getItem('storedUtcDisplay'))
    //   : true,
    username: localStorage.getItem('storedUsername'),
    userRole: localStorage.getItem('storedUserRole'),
    isAuthorized: true,
    // cloud modify
    quickLink: null,
    energy_efficientcy: null,
    ProductName: null,
    ProductSerial: null,
    isNavigationOpen: false,
    bmcVersion: null,
    mfg: null,
    systemHealth: null,
    kvmClientsCount: null,
    etag: '',
  },
  getters: {
    serverName: (state) => state.serverName,
    serverConfig: (state) => state.serverConfig,
    uidStatus: (state) => state.uidStatus,
    assetTag: (state) => state.assetTag,
    modelType: (state) => state.modelType,
    serialNumber: (state) => state.serialNumber,
    serverStatus: (state) => state.serverStatus,
    powerStatus: (state) => state.powerStatus,
    powerlastTime: (state) => state.powerlastTime,
    powerInput: (state) => state.powerInput,
    bmcTime: (state) => state.bmcTime,
    loginTime: (state) => state.loginTime,
    timezone: (state) => state.timezone,
    timeZoneDst: (state) => state.timeZoneDst,
    languagePreference: (state) => state.languagePreference,
    isUtcDisplay: (state) => state.isUtcDisplay,
    username: (state) => state.username,
    userRole: (state) => state.userRole,
    isAuthorized: (state) => state.isAuthorized,
    // cloud modify
    quickLink: (state) => state.quickLink,
    energy_efficientcy: (state) => state.energy_efficientcy,
    ProductName: (state) => state.ProductName,
    ProductSerial: (state) => state.ProductSerial,
    isNavigationOpen: (state) => state.isNavigationOpen,
    bmcVersion: (state) => state.bmcVersion,
    mfg: (state) => state.mfg,
    systemHealth: (state) => state.systemHealth,
    kvmClientsCount: (state) => state.kvmClientsCount,
    etag: (state) => state.etag,
  },
  mutations: {
    setServerName: (state, serverName) => (state.serverName = serverName),
    setServerConfig: (state, serverConfig) =>
      (state.serverConfig = serverConfig),
    setUidStatus: (state, uidStatus) => (state.uidStatus = uidStatus),
    setAssetTag: (state, assetTag) => (state.assetTag = assetTag),
    setModelType: (state, modelType) => (state.modelType = modelType),
    setMfg: (state, val) => (state.mfg = val),
    setSerialNumber: (state, serialNumber) =>
      (state.serialNumber = serialNumber),
    setBmcTime: (state, bmcTime) => (state.bmcTime = bmcTime),
    setLoginTime: (state, loginTime) => (state.loginTime = loginTime),
    setTimeZone: (state, timezone) => (state.timezone = timezone),
    setTimeZoneDst: (state, timeZoneDst) => (state.timeZoneDst = timeZoneDst),
    setServerStatus: (state, serverState) =>
      (state.serverStatus = serverStateMapper(serverState)),
    setpowerStatus: (state, val = {}) => {
      state.powerStatus = val.PowerState;
      state.powerlastTime = new Date(val.LastResetTime);
      state.powerInput = val.TotolPowerInput;
    },
    setLanguagePreference: (state, language) =>
      (state.languagePreference = language),
    setUsername: (state, username) => (state.username = username),
    setUserRole: (state, userRole) => (state.userRole = userRole),
    setUtcTime: (state, isUtcDisplay) => (state.isUtcDisplay = isUtcDisplay),
    setUnauthorized: (state) => {
      state.isAuthorized = false;
      window.setTimeout(() => {
        state.isAuthorized = true;
      }, 100);
    },
    setQuickLink: (state, data) => (state.quickLink = data),
    setEnergy_efficientcy: (state, data) => (state.energy_efficientcy = data),
    setProductInfo: (state, data) => {
      state.ProductName = data.Name;
      state.ProductSerial = data.Serial;
      state.mfg = data.Mfg;
    },
    setIsNavigationOpen: (state, val = false) => {
      state.isNavigationOpen = val;
    },
    setBmcVersion: (state, val) => {
      state.bmcVersion = val;
    },
    setSystemHealth: (state, val) => {
      state.systemHealth = val;
    },
    setKvmClientsCount: (state, val) => {
      state.kvmClientsCount = val;
    },
    setEtag: (state, val) => {
      state.etag = val;
    },
  },
  actions: {
    async getBmcServerName({ commit }) {
      return await api
        .post('/redfish/v1/SessionService/Sessions', {})
        .then((res) => {
          commit('setServerName', res.data?.ProductName || '');
        });
    },
    async getBmcServerConfig({ commit }) {
      return await api.get('/webconfig.json').then((res) => {
        commit('setServerConfig', res.data);
      });
    },
    async getBmcTime({ commit, dispatch }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then((response) => {
          let { DateTime, TimeZone, TimeZoneDst, IsDst } = response.data;
          const date = new Date(DateTime).getTime();
          // const date = new Date(DateTime);
          // TimeZone = selectTimezone || TimeZone || "UTC+00:00";
          // const timestamp = dateToTimestamp(date, TimeZone);
          commit('setBmcTime', date);
          // commit('setBmcTime', timestamp);
          commit('setTimeZone', TimeZone);
          if (IsDst) commit('setTimeZoneDst', TimeZoneDst);
          else commit('setTimeZoneDst', null);
          clearInterval(updateTimeTimer);
          dispatch('updateSeconds');
        })
        .catch((error) => console.log(error));
    },
    async getLoginTime({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then((response) => {
          let { DateTime } = response.data;
          commit('setLoginTime', DateTime);
        })
        .catch((error) => console.log(error));
    },
    updateSeconds({ state, commit }) {
      updateTimeTimer = setInterval(() => {
        commit('setBmcTime', state.bmcTime + 1000);
      }, 1000);
    },
    getSystemInfo({ commit }) {
      api
        .get('/redfish/v1/Systems/system')
        .then(
          ({
            data: {
              AssetTag,
              Model,
              PowerState,
              SerialNumber,
              PowerSummary,
              Status: { State } = {},
              Oem,
            },
            headers,
          } = {}) => {
            commit('setEtag', headers?.etag || '');
            commit('setAssetTag', AssetTag);
            commit('setSerialNumber', SerialNumber);
            commit('setModelType', Model);
            if (State === 'Quiesced' || State === 'InTest') {
              // OpenBMC's host state interface is mapped to 2 Redfish
              // properties "Status""State" and "PowerState". Look first
              // at State for certain cases.
              commit('setServerStatus', State);
            } else {
              commit('setServerStatus', PowerSummary?.PowerState);
            }
            commit('setpowerStatus', PowerState);
            commit('setSystemHealth', Oem.SystemHealth);
          }
        )
        .catch((error) => console.log(error));
    },
    getUidStatus({ commit }) {
      return api
        .get('/redfish/v1/Chassis/1')
        .then((res) => {
          commit('setUidStatus', res.data.IndicatorLED);
        })
        .catch((error) => {
          console.log('get uidinfo error', error);
        });
    },
    async updateUidStatus({ dispatch }, data) {
      return await api
        .patch(`/redfish/v1/Chassis/1`, data)
        .then(() => {
          dispatch('getUidStatus');
          return i18n.t('appHeader.toast.successSetUidStatus');
        })
        .catch((error) => {
          console.log(error);
          throw error;
        });
    },
    getQuickLink({ commit }) {
      return api
        .get('/ip/api/quickLink/root')
        .then((res) => {
          commit('setQuickLink', res.data.QuickLinks);
        })
        .catch((error) => {
          console.log('QuickLink error', error);
        });
    },
    getEnergy({ commit }) {
      return api
        .get('/ip/api/energy_efficientcy')
        .then((res) => {
          commit('setEnergy_efficientcy', res.data);
        })
        .catch((error) => {
          console.log('Energy_efficientcy error', error);
        });
    },
    getProductInfo({ commit }) {
      return api
        .get('/redfish/v1/Chassis/1/Fru/BaseBoard')
        .then((res) => {
          commit('setProductInfo', res.data.Product);
        })
        .catch((error) => {
          console.log('Product Info error', error);
        });
    },
    getKvmClientsCount({ commit }) {
      api
        .get('/redfish/v1/Managers/bmc/KvmService')
        .then((res) => commit('setKvmClientsCount', res.data.KvmClientsCount));
    },
  },
};

export default GlobalStore;
