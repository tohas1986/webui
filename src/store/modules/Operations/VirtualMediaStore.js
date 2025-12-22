import api from '@/store/api';

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
  },
  mutations: {
    setProxyDevicesData: (state, deviceData) =>
      (state.proxyDevices = deviceData),
    setLegacyDevicesData: (state, deviceData) =>
      (state.legacyDevices = deviceData),
  },
  actions: {
    async getData({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/VirtualMedia')
        .then((response) =>
          response.data.Members.map((virtualMedia) => virtualMedia['@odata.id'])
        )
        .then((devices) => api.all(devices.map((device) => api.get(device))))
        .then((devices) => {
          const deviceData = devices.map((device) => {
            const isActive = device.data?.Inserted === true ? true : false;
            return {
              id: device.data?.Id,
              transferProtocolType: device.data?.TransferProtocolType,
              websocket: device.data?.Oem?.OpenBMC?.WebSocketEndpoint,
              isActive: isActive,
            };
          });
          const proxyDevices = deviceData
            .filter((d) => d.transferProtocolType === transferProtocolType.OEM)
            .map((device) => {
              return {
                ...device,
                file: null,
              };
            });
          const legacyDevices = deviceData
            .filter((d) => d.transferProtocolType !== transferProtocolType.OEM)
            .map((device) => {
              return {
                ...device,
                serverUri: '',
                username: '',
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
    async mountImage({ data }) {
      return await api
        .post(
          `/redfish/v1/Managers/bmc/VirtualMedia/Slot_2/Actions/VirtualMedia.InsertMedia`,
          data
        )
        .catch((error) => {
          console.log('Mount image:', error);
          throw new Error();
        });
    },
    async unmountImage() {
      return await api
        .post(
          `/redfish/v1/Managers/bmc/VirtualMedia/Slot_2/Actions/VirtualMedia.EjectMedia`
        )
        .catch((error) => {
          console.log('Unmount image:', error);
          throw new Error();
        });
    },
  },
};

export default VirtualMediaStore;
