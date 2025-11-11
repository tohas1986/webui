import api from '@/store/api';
import i18n from '@/i18n';

const AuditLogsStore = {
  namespaced: true,
  state: {
    allAudit: [],
  },
  getters: {
    allAudit: (state) => state.allAudit,
  },
  mutations: {
    setAllAudit: (state, allAudit) => (state.allAudit = allAudit),
  },
  actions: {
    async getAuditLogData({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/EventLog/Entries/')
        .then(({ data: { Members = [] } = {} }) => {
          const auditLogs = Members.map((log) => {
            console.log(log);
            const {
              Id,
              Severity,
              Created,
              EntryType,
              Message,
              Name,
              Modified,
              Resolved,
              AdditionalDataURI,
            } = log;
            return {
              id: Id,
              severity: Severity,
              date: new Date(Created),
              type: EntryType,
              description: Message,
              name: Name,
              modifiedDate: new Date(Modified),
              uri: log['@odata.id'],
              filterByStatus: Resolved ? 'Resolved' : 'Unresolved',
              status: Resolved, //true or false
              additionalDataUri: AdditionalDataURI,
            };
          });
          commit('setAllAudit', auditLogs);
        })
        .catch((error) => {
          console.log('Event Log Data:', error);
        });
    },
    async deleteAllAuditLogs({ dispatch }, data) {
      return await api
        .post(
          '/redfish/v1/Systems/system/LogServices/Actions/LogService.ClearLog',
        )
        .then(() => dispatch('getAuditLogData'))
        .then(() => i18n.tc('pageAuditLogs.toast.successDelete', data.length))
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.tc('pageAuditLogs.toast.errorDelete', data.length),
          );
        });
    },
  },
};

export default AuditLogsStore;
