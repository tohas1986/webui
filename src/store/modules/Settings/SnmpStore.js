import api from '@/store/api';
import i18n from '@/i18n';

const state = {
  data: null,
};

export const mutationTypes = {
  getSnmpStart: '[snmp] Get snmp start',
  getSnmpSuccess: '[snmp] Get snmp success',
  getSnmpFailure: '[snmp] Get snmp failure',

  saveSnmpStart: '[snmp] Save snmp start',
  saveSnmpSuccess: '[snmp] Save snmp success',
  saveSnmpFailure: '[snmp] Save snmp failure',

  getMibStart: '[smtp] Get smtp start',
  getMibSuccess: '[smtp] Get smtp success',
  getMibFailure: '[smtp] Get smtp failure',

  getZabbixStart: '[smtp] Get smtp start',
  getZabbixSuccess: '[smtp] Get smtp success',
  getZabbixFailure: '[smtp] Get smtp failure',
};

export const actionTypes = {
  getSnmp: '[snmp] Get snmp',
  saveSnmp: '[snmp] Save snmp',
  getMibFile: '[smtp] Get mib file',
  getZabbixFile: '[smtp] Get zabbix file',
};

const mutations = {
  [mutationTypes.getSnmpStart]() {},
  [mutationTypes.getSnmpSuccess](state, payload) {
    state.data = payload;
  },
  [mutationTypes.getSnmpFailure]() {},

  [mutationTypes.saveSnmpStart]() {},
  [mutationTypes.saveSnmpSuccess]() {},
  [mutationTypes.saveSnmpFailure]() {},

  [mutationTypes.getMibStart]() {},
  [mutationTypes.getMibSuccess]() {},
  [mutationTypes.getMibFailure]() {},

  [mutationTypes.getZabbixStart]() {},
  [mutationTypes.getZabbixSuccess]() {},
  [mutationTypes.getZabbixFailure]() {},
};

const actions = {
  [actionTypes.getSnmp](context) {
    return new Promise((resolve) => {
      context.commit(mutationTypes.getSnmpStart);
      api
        .get('/redfish/v1/Managers/bmc/NetworkProtocol')
        .then((response) => {
          context.commit(mutationTypes.getSnmpSuccess, response.data['SNMP']);
          resolve(response.data['SNMP']);
        })
        .catch(() => {
          context.commit(mutationTypes.getSnmpFailure);
        });
    });
  },
  [actionTypes.saveSnmp](context, properties) {
    const data = { SNMP: properties };
    return new Promise((resolve) => {
      context.commit(mutationTypes.saveSnmpStart);
      api
        .patch('/redfish/v1/Managers/bmc/NetworkProtocol', data)
        .then(() => {
          context.commit(mutationTypes.saveSnmpSuccess);
          resolve();
          i18n.t('pageSnmp.toast.successSaveSnmpSettings');
        })
        .catch((error) => {
          context.commit(mutationTypes.saveSnmpFailure);
          console.log(error);
          throw new Error(i18n.t('pageSnmp.toast.errorSaveSnmpSettings'));
        });
    });
  },

  [actionTypes.getMibFile](context) {
    return new Promise((resolve) => {
      context.commit(mutationTypes.getMibStart);
      api
        .get('/redfish/v1/Managers/bmc/NetworkProtocol/mib')
        .then((response) => {
          context.commit(mutationTypes.getMibSuccess, response.data);
          resolve(response.data);
        })
        .catch(() => {
          context.commit(mutationTypes.getMibFailure);
        });
    });
  },
  [actionTypes.getSnmp](context) {
    return new Promise((resolve) => {
      context.commit(mutationTypes.getSnmpStart);
      api
        .get('/redfish/v1/Managers/bmc/NetworkProtocol')
        .then((response) => {
          context.commit(mutationTypes.getSnmpSuccess, response.data['SNMP']);
          resolve(response.data['SNMP']);
        })
        .catch(() => {
          context.commit(mutationTypes.getSnmpFailure);
        });
    });
  },
};

export default {
  state,
  actions,
  mutations,
};
