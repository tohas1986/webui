import api from '@/store/api';

const BackupRestoreStore = {
  namespaced: true,
  state: {
    backupInProgress: false,
    restoreInProgress: false,
  },
  getters: {
    backupInProgress: (state) => state.backupInProgress,
    restoreInProgress: (state) => state.restoreInProgress,
  },
  mutations: {
    setBackupInProgress: (state, inProgress) => {
      state.backupInProgress = inProgress;
    },
    setRestoreInProgress: (state, inProgress) => {
      state.restoreInProgress = inProgress;
    },
  },
  actions: {
    async createBackup({ commit }) {
      commit('setBackupInProgress', true);
      try {
        const response = await api.get(
          '/redfish/v1/Managers/bmc/Actions/Oem.BackupConfiguration',
          {
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            responseType: 'blob',
          },
        );
        return response.data;
      } catch (error) {
        throw new Error(error.message);
      } finally {
        commit('setBackupInProgress', false);
      }
    },
    async restoreBackup({ commit }, backupFile) {
      commit('setRestoreInProgress', true);
      try {
        const response = await api.put(
          '/redfish/v1/Managers/bmc/Actions/Oem.RestoreConfiguration',
          backupFile,
          {
            headers: {
              'Content-Type': 'application/octet-stream',
            },
          },
        );
        return response.data;
      } catch (error) {
        throw new Error(error.message);
      } finally {
        commit('setRestoreInProgress', false);
      }
    },
  },
};

export default BackupRestoreStore;
