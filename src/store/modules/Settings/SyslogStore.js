import api from '@/store/api';

const SyslogStore = {
  namespaced: true,
  state: {
    syslogTcp: [],
    syslogUdp: [],
  },
  getters: {
    syslogTcp: (state) => state.syslogTcp,
    syslogUdp: (state) => state.syslogUdp,
  },
  mutations: {
    setSyslogTcp: (state, dataTcp) => {
      state.syslogTcp = dataTcp.map((tcp) => {
        const { Id, Status = {}, Oem = {} } = tcp;
        return {
          id: Id,
          state: Status.State,
          ip: Oem?.OpenYard.IPAddress,
          port: Oem?.OpenYard.Port,
          interval: Oem?.OpenYard.Interval,
          limit: Oem?.OpenYard.EntryLimit,
          sources: Oem?.OpenYard.Sources,
          uri: tcp['@odata.id'],
        };
      });
    },
    setSyslogUpd: (state, dataUdp) => {
      state.syslogUdp = dataUdp.map((udp) => {
        const { Id, Status = {}, Oem = {} } = udp;
        return {
          id: Id,
          state: Status.State,
          ip: Oem?.OpenYard.IPAddress,
          port: Oem?.OpenYard.Port,
          interval: Oem?.OpenYard.Interval,
          limit: Oem?.OpenYard.EntryLimit,
          sources: Oem?.OpenYard.Sources,
          uri: udp['@odata.id'],
        };
      });
    },
  },
  actions: {
    async getSyslog({ commit }) {
      try {
        await api.get('/redfish/v1/EventService');

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const {
          data: { Members },
        } = await api.get('/redfish/v1/EventService/Subscriptions');

        const filteredIds = Members.filter(
          (member) =>
            member['@odata.id'] ===
              '/redfish/v1/EventService/Subscriptions/12' ||
            member['@odata.id'] === '/redfish/v1/EventService/Subscriptions/13',
        );

        const promises = filteredIds.map((item) => api.get(item['@odata.id']));
        const response = await api.all(promises);

        const data = response.map(({ data }) => data);
        const dataTcp = data.filter((item) => item.Id === '12');
        const dataUdp = data.filter((item) => item.Id === '13');
        commit('setSyslogTcp', dataTcp);
        commit('setSyslogUpd', dataUdp);
      } catch (error) {
        console.log('getSyslog error:', error);
      }
    },
    async saveSettingSyslog(_, { id, data }) {
      return api
        .patch(`redfish/v1/EventService/Subscriptions/${id}`, data)
        .catch((error) => {
          console.log('Save Settings:', error);
          throw new Error();
        });
    },
  },
};

export default SyslogStore;
