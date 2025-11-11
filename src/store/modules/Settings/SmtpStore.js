import api from '@/store/api';
import i18n from '@/i18n';

const state = {
  data: null,
};

export const mutationTypes = {
  getSmtpStart: '[smtp] Get smtp start',
  getSmtpSuccess: '[smtp] Get smtp success',
  getSmtpFailure: '[smtp] Get smtp failure',

  saveSmtpStart: '[smtp] Save smtp start',
  saveSmtpSuccess: '[smtp] Save smtp success',
  saveSmtpFailure: '[smtp] Save smtp failure',
};

export const actionTypes = {
  getSmtp: '[smtp] Get smtp',
  saveSmtp: '[smtp] Save smtp',
};

const mutations = {
  [mutationTypes.getSmtpStart]() {},
  [mutationTypes.getSmtpSuccess](state, payload) {
    state.data = payload;
  },
  [mutationTypes.getSmtpFailure]() {},

  [mutationTypes.saveSmtpStart]() {},
  [mutationTypes.saveSmtpSuccess]() {},
  [mutationTypes.saveSmtpFailure]() {},
};

const actions = {
  [actionTypes.getSmtp](context) {
    return new Promise((resolve) => {
      context.commit(mutationTypes.getSmtpStart);
      api
        .get('/redfish/v1/EventService')
        .then((response) => {
          context.commit(mutationTypes.getSmtpSuccess, response.data);
          resolve(response.data);
        })
        .catch(() => {
          context.commit(mutationTypes.getSmtpFailure);
        });
    });
  },
  [actionTypes.saveSmtp](context, data) {
    return new Promise((resolve) => {
      context.commit(mutationTypes.saveSmtpStart);
      api
        .patch('/redfish/v1/EventService', data)
        .then(() => {
          context.commit(mutationTypes.saveSmtpSuccess);
          resolve();
          i18n.t('pageSmtp.toast.successSaveSmtpSettings');
        })
        .catch((error) => {
          context.commit(mutationTypes.saveSmtpFailure);
          console.log(error);
          throw new Error(i18n.t('pageSmtp.toast.errorSaveSmtpSettings'));
        });
    });
  },
};

export default {
  state,
  actions,
  mutations,
};
