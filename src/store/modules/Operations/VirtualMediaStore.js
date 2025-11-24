import api from '@/store/api';
import i18n from '@/i18n';

const transferProtocolType = {
  CIFS: 'CIFS',
  FTP: 'FTP',
  SFTP: 'SFTP',
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
  NFS: 'NFS',
  SCP: 'SCP',
  TFTP: 'TFTP',
  OEM: 'OEM',
};

const VirtualMediaStore = {
  namespaced: true,
  state: {
    proxyDevices: [],
    legacyDevices: [],
    connections: [],
  },
  getters: {
    proxyDevices: (state) => state.proxyDevices,
    legacyDevices: (state) => state.legacyDevices,
    connections: (state) => state.connections,
  },
  mutations: {
    setProxyDevicesData: (state, deviceData) =>
      (state.proxyDevices = deviceData),
    setLegacyDevicesData: (state, deviceData) =>
      (state.legacyDevices = deviceData),
    setConnectionsData: (state, connections) =>
      (state.connections = connections),
  },
  actions: {
    async getData({ commit }) {
      const virtualMediaListEnabled =
        process.env.VUE_APP_VIRTUAL_MEDIA_LIST_ENABLED === 'true'
          ? true
          : false;
      if (!virtualMediaListEnabled) {
        const device = {
          id: i18n.t('pageVirtualMedia.defaultDeviceName'),
          websocket: '/vm/0/0',
          file: null,
          transferProtocolType: transferProtocolType.OEM,
          isActive: false,
        };
        commit('setProxyDevicesData', [device]);
        return;
      }

      return await api
        .get('/redfish/v1/Managers/1/VirtualMedia')
        .then((response) =>
          response.data.Members.map((virtualMedia) => virtualMedia['@odata.id'])
        )
        .then((devices) => api.all(devices.map((device) => api.get(device))))
        .then((devices) => {
          const deviceData = devices.map((device) => {
            const isActive = device.data?.Inserted === true ? true : false;
            let file = null;
            if (isActive === true) {
              file = new File([], device.data?.FilePath);
            }
            const username = device.data?.UserName;
            const serverUri = device.data?.FilePath;
            return {
              id: device.data?.Id,
              transferProtocolType: device.data?.TransferProtocolType,
              websocket: device.data?.Oem?.OpenBMC?.WebSocketEndpoint,
              isActive: isActive,
              file,
              username,
              serverUri,
            };
          });
          const proxyDevices = deviceData
            .filter((d) => d.transferProtocolType === transferProtocolType.OEM)
            .map((device) => {
              return {
                ...device,
              };
            });
          const legacyDevices = deviceData
            .filter((d) => d.transferProtocolType !== transferProtocolType.OEM)
            .map((device) => {
              return {
                ...parseServerUri(device.serverUri),
                ...device,
                password: '',
                isRW: false,
              };
            });
          commit('setProxyDevicesData', proxyDevices);
          commit('setLegacyDevicesData', legacyDevices);
        })
        .catch((error) => {
          console.log('Virtual Media:', error);
        });
    },
    async mountImage(_, { id, data }) {
      return await api
        .post(
          `/redfish/v1/Managers/1/VirtualMedia/${id}/Actions/VirtualMedia.InsertMedia`,
          data
        )
        .catch((error) => {
          console.log('Mount image:', error);
          throw new Error();
        });
    },
    async unmountImage(_, id) {
      return await api
        .post(
          `/redfish/v1/Managers/1/VirtualMedia/${id}/Actions/VirtualMedia.EjectMedia`
        )
        .catch((error) => {
          console.log('Unmount image:', error);
          throw new Error();
        });
    },
    async uploadFilename(_, { id, filename }) {
      try {
        const { data } = await api.get('/redfish/v1/Managers/1/VirtualMedia');
        const slotArr = data.Members.map((vm) => vm['@odata.id']);
        const apiUrl = slotArr.filter((slot) => slot.includes(id))[0];
        const result = await api.post(apiUrl, { FilePath: filename });
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    async unmountLocalImage({ dispatch }, slotId) {
      try {
        const id = slotId.slice(-1);
        const { data } = await api.post(
          `/redfish/v1/Managers/1/VirtualMedia/close/${id}`
        );
        if (data?.status === 'success') {
          await dispatch('uploadFilename', {
            id: slotId,
            filename: '',
          });
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    async getLocalImageStatus(_, id) {
      try {
        const { data } = await api.get('/redfish/v1/Managers/1/VirtualMedia');
        const slotArr = data.Members.map((vm) => vm['@odata.id']);
        const apiUrl = slotArr.filter((slot) => slot.includes(id))[0];
        const result = await api.get(apiUrl);
        const isActive = result?.data?.Inserted;
        return isActive;
      } catch (error) {
        console.log(error);
      }
    },
  },
};

function parseServerUri(uri) {
  let protocol = null,
    server = null,
    filePath = null;
  const nfsRegex = /nfs:\/\/(.*?):(\/.+)/;
  const smbRegex = /smb:\/\/(.*?)(\/.*)/;
  if (uri.startsWith('nfs://')) {
    protocol = 'nfs://';
    const match = uri.match(nfsRegex);
    if (match) {
      server = match[1];
      filePath = match[2];
    }
  } else if (uri.startsWith('smb://')) {
    protocol = 'smb://';
    const match = uri.match(smbRegex);
    if (match) {
      server = match[1];
      filePath = match[2];
    }
  }
  return { protocol, server, filePath };
}

export default VirtualMediaStore;
