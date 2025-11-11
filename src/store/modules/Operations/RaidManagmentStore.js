import api from '@/store/api';
import i18n from '@/i18n';

const RaidManagmentStore = {
  namespaced: true,
  state: {
    raids: [],
    drives: [],
    volumes: [],
    stateRaid: [],
    raidEventLogs: [],
  },
  getters: {
    raids: (state) => state.raids,
    drives: (state) => state.drives,
    volumes: (state) => state.volumes,
    stateRaid: (state) =>
      state.raids.filter((item) => item.state === 'Updating'),
    raidEventLogs: (state) => state.raidEventLogs,
  },
  mutations: {
    setRaidsInfo(state, raids) {
      state.raids = raids;
    },
    setDrivesInfo(state, drives) {
      state.drives = drives;
    },
    setVolumesInfo(state, volumes) {
      state.volumes = volumes;
    },
    setRaidEventLogs(state, logs) {
      state.raidEventLogs = logs;
    },
  },
  actions: {
    async getData({ commit }) {
      try {
        const { data } = await api.get('/redfish/v1/Systems/system/Storage/1/');
        const storageControllers = data?.StorageControllers || [];

        if (!Array.isArray(storageControllers)) {
          commit('setRaidsInfo', []);
          commit('setDrivesInfo', []);
          commit('setVolumesInfo', []);
          return;
        }

        const raidData = await Promise.all(
          storageControllers.map(async (controller) => {
            try {
              const controllerUrl = controller['@odata.id'];
              if (!controllerUrl) return null;

              const { data: controllerData } = await api.get(controllerUrl);

              // Обработка дисков
              let drives = [];
              const driveLinks = controllerData?.Links?.Drives || [];
              if (driveLinks.length > 0) {
                const driveResponses = await Promise.all(
                  driveLinks.map((d) =>
                    api.get(d['@odata.id']).catch(() => null),
                  ),
                );
                drives = driveResponses
                  .filter((r) => r && r.data)
                  .map((r) => r.data);
              }

              // Обработка томов
              let volumes = [];
              const volumeLinks = controllerData?.Links?.Volumes || [];
              if (volumeLinks.length > 0) {
                const volumeResponses = await Promise.all(
                  volumeLinks.map((v) =>
                    api.get(v['@odata.id']).catch(() => null),
                  ),
                );
                volumes = volumeResponses
                  .filter((r) => r && r.data)
                  .map((r) => r.data);
              }

              // Обработка связанных дисков для томов
              const volumeDriveId = [];
              for (const volume of volumeLinks) {
                try {
                  const { data: volumeData } = await api.get(
                    volume['@odata.id'],
                  );
                  const linkedDrives = volumeData?.Links?.Drives || [];
                  if (linkedDrives.length > 0) {
                    const driveResponses = await Promise.all(
                      linkedDrives.map((d) =>
                        api.get(d['@odata.id']).catch(() => null),
                      ),
                    );
                    volumeDriveId.push(
                      ...driveResponses
                        .filter((r) => r && r.data)
                        .map((r) => r.data?.DriveId)
                        .filter(Boolean),
                    );
                  }
                } catch (error) {
                  console.error(
                    `Error fetching volume details: ${volume['@odata.id']}`,
                    error,
                  );
                  continue;
                }
              }

              return {
                id: controllerData?.Id,
                name: controllerData?.Name,
                model: controllerData?.Model,
                links: controllerData?.Links || {},
                drives,
                volumes,
                volumeDriveId,
                serialNumber: controllerData?.SerialNumber,
                firmwareVersion: controllerData?.FirmwareVersion,
                state: controllerData?.State,
                progress: controllerData?.Progress,
                location: controllerData?.['@odata.id'],
              };
            } catch (error) {
              console.error(
                `Error processing RAID controller: ${controller['@odata.id']}`,
                error,
              );
              return null;
            }
          }),
        );
        const validRaidData = raidData.filter(Boolean);

        commit('setRaidsInfo', validRaidData);
        commit(
          'setDrivesInfo',
          validRaidData.flatMap((r) => r.drives),
        );
        commit(
          'setVolumesInfo',
          validRaidData.flatMap((r) =>
            r.links?.Volumes?.length ? r.volumes : [],
          ),
        );
      } catch (error) {
        console.error('RAID data fetch failed:', error);
      }
    },

    async getRaidEventLogs({ commit }, { controllerId, model, name }) {
      try {
        const { data } = await api.get(
          `/redfish/v1/Systems/system/Storage/1/StorageControllers/${controllerId}/EventLogs/EventDetails`,
        );
        const eventObj = Array.isArray(data) ? data[0] : data;
        const logs = (eventObj.Members || eventObj.EventLogEntries || []).map(
          (log) => {
            const oem = log.Oem.OpenYard;
            return {
              model: model,
              id: name,
              controllerId: controllerId,
              seqNum: oem.seq_num || log.Id,
              timestamp: oem.timestamp,
              eventType: oem.event_type,
              verbosity: oem.verbosity,
              description: oem.description,
            };
          },
        );
        commit('setRaidEventLogs', logs);
        return logs;
      } catch (error) {
        console.error('RAID event logs fetch failed:', error);
        commit('setRaidEventLogs', []);
        return [];
      }
    },

    async clearRaidEventLogs(_, controllerId) {
      return await api
        .post(
          `/redfish/v1/Systems/system/Storage/1/StorageControllers/${controllerId}/Actions/StorageController.ClearEvents`,
        )
        .then(() => i18n.tc('pageRaidEventLogs.toast.successDelete'))
        .catch((error) => {
          console.error('Clear RAID event logs failed:', error);
          throw new Error(error);
        });
    },

    async addConfig(_, { id, data }) {
      try {
        await api.post(
          `/redfish/v1/Systems/system/Storage/1/StorageControllers/${id}/Actions/StorageController.AddConfig`,
          data,
        );
      } catch (error) {
        console.error('Add Config failed:', error);
        throw new Error(error);
      }
    },

    async clearConfig(_, id) {
      try {
        await api.post(
          `/redfish/v1/Systems/system/Storage/1/StorageControllers/${id}/Actions/StorageController.ClearConfig`,
        );
      } catch (error) {
        console.error('Clear Config failed:', error);
        throw new Error(error);
      }
    },

    async updateRaid({ dispatch }, { id, type, file }) {
      try {
        await api.put(
          `/redfish/v1/Systems/system/Storage/1/StorageControllers/${id}/Actions/StorageController.FirmwareUpdate/${type}`,
          file,
          { headers: { 'Content-Type': 'application/octet-stream' } },
        );
        await dispatch('getData');
      } catch (error) {
        console.error('Update RAID failed:', error);
        throw new Error(error);
      }
    },

    async getRaidInformation(_, controllerId) {
      try {
        const { data } = await api.get(
          `/redfish/v1/Systems/system/Storage/1/StorageControllers/${controllerId}`,
        );
        return {
          model: data.Model,
          name: data.Id,
        };
      } catch (error) {
        console.error('RAID controller info fetch failed:', error);
        return {
          model: '',
          name: '',
        };
      }
    },
  },
};

export default RaidManagmentStore;
