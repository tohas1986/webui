import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const SessionsStore = {
  namespaced: true,
  state: {
    allConnections: [],
    sessionTimeoutValue: null,
    maxKvmTotalSessions: null,
    maxKvmControlSessions: null,
    kvmSessionId: null,
    kvmControlEnabled: false,
    kvmControlReq: false,
    kvmControlAsked: false,
  },
  getters: {
    allConnections: (state) => state.allConnections,
    getSessionTimeoutValue: (state) => state.sessionTimeoutValue,
    maxKvmTotalSessions: (state) => state.maxKvmTotalSessions,
    maxKvmControlSessions: (state) => state.maxKvmControlSessions,
    getKvmSessionId: (state) => state.kvmSessionId,
    getKvmControlEnabled: (state) => state.kvmControlEnabled,
    getKvmControlReq: (state) => state.kvmControlReq,
    getKvmControlAsked: (state) => state.kvmControlAsked,
  },
  mutations: {
    setAllConnections: (state, allConnections) =>
      (state.allConnections = allConnections),
    setSessionTimeoutValue(state, sessionTimeoutValue) {
      state.sessionTimeoutValue = sessionTimeoutValue;
    },
    setMaxKvmTotalSessions(state, value) {
      state.maxKvmTotalSessions = value;
    },
    setMaxKvmControlSessions(state, value) {
      state.maxKvmControlSessions = value;
    },
    setKvmSessionId(state, sessionId) {
      state.kvmSessionId = sessionId;
    },
    setKvmControlEnabled(state, value) {
      state.kvmControlEnabled = value;
    },
    setKvmControlReq(state, value) {
      state.kvmControlReq = value;
    },
    setKvmControlAsked(state, value) {
      state.kvmControlAsked = value;
    },
  },
  actions: {
    async getSessionsData({ commit }) {
      return await api
        .get('/redfish/v1/SessionService/Sessions')
        .then((response) =>
          response.data.Members.map((sessionLogs) => sessionLogs['@odata.id']),
        )
        .then((sessionUris) =>
          api.all(sessionUris.map((sessionUri) => api.get(sessionUri))),
        )
        .then((sessionUris) => {
          const allConnectionsData = sessionUris.map((sessionUri) => {
            return {
              sessionID: sessionUri.data?.Id,
              context: sessionUri.data?.Context
                ? sessionUri.data?.Context
                : '-',
              username: sessionUri.data?.UserName,
              ipAddress: sessionUri.data?.ClientOriginIPAddress,
              sessionType: sessionUri.data?.SessionType,
              uri: sessionUri.data['@odata.id'],
            };
          });
          commit('setAllConnections', allConnectionsData);
        })
        .catch((error) => {
          console.log('Client Session Data:', error);
        });
    },
    async disconnectSessions({ dispatch }, uris = []) {
      const promises = uris.map((uri) =>
        api.delete(uri).catch((error) => {
          console.log(error);
          return error;
        }),
      );
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getSessionsData');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            const toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'pageSessions.toast.successDelete',
                successCount,
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'pageSessions.toast.errorDelete',
                errorCount,
              );
              toastMessages.push({ type: 'error', message });
            }
            return toastMessages;
          }),
        );
    },
    async getSessionTimeout({ commit }) {
      return await api
        .get('/redfish/v1/SessionService')
        .then((response) => {
          const sessionTimeoutValue = response.data.SessionTimeout;
          commit('setSessionTimeoutValue', sessionTimeoutValue);
        })
        .catch((error) => console.log(error));
    },
    async saveSessionTimeoutValue({ dispatch }, sessionTimeoutNewValue) {
      const sessionValue = {
        SessionTimeout: sessionTimeoutNewValue,
      };
      return await api
        .patch('/redfish/v1/SessionService', sessionValue)
        .then(() => dispatch('getSessionTimeout'))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageSessions.toast.errorSessionTimeout'));
        });
    },
    async getSessionService({ commit }) {
      const { data } = await api.get('/redfish/v1/SessionService');
      commit('setMaxKvmTotalSessions', data.MaxKVMTotalSessions);
      commit('setMaxKvmControlSessions', data.MaxKVMControlSessions);
      commit('setKvmSessionId', data.KvmSession);
      commit('setKvmControlEnabled', data.ControlEnabled ?? false);
    },
    async saveMaxKvmTotalSessions({ dispatch }, maxKvmTotalSessionsValue) {
      const payload = {
        MaxKVMTotalSessions: maxKvmTotalSessionsValue,
      };
      return await api
        .patch('/redfish/v1/SessionService', payload)
        .then(() => dispatch('getSessionService'))
        .catch((error) => {
          console.log(error.response.data);
          throw new Error(error);
        });
    },
    async saveMaxKvmControlSessions({ dispatch }, maxKvmControlSessionsValue) {
      const payload = {
        MaxKVMControlSessions: maxKvmControlSessionsValue,
      };
      return await api
        .patch('/redfish/v1/SessionService', payload)
        .then(() => dispatch('getSessionService'))
        .catch((error) => {
          console.log(error.response.data);
          throw new Error(error);
        });
    },
    async requestKvmControl() {
      try {
        await api.get('/redfish/v1/SessionService/kvm/reqestcontrol/');
      } catch (error) {
        throw new Error(
          error?.response?.data?.error?.message ||
            i18n.t('pageKvm.toast.requestError'),
        );
      }
    },
    async releaseKvmControl() {
      try {
        await api.get('/redfish/v1/SessionService/kvm/releasecontrol/');
      } catch (error) {
        throw new Error(
          error?.response?.data?.error?.message ||
            i18n.t('pageKvm.toast.releaseError'),
        );
      }
    },
  },
};
export default SessionsStore;
