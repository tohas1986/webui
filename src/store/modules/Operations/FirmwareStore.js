import api from '@/store/api';
import i18n from '@/i18n';

const FirmwareStore = {
  namespaced: true,
  state: {
    bmcFirmware: [],
    hostFirmware: [],
    bmcActiveFirmwareId: null,
    hostActiveFirmwareId: null,
    cpldActiveFirmware: null,
    cpldVersionDate: null,
    applyTime: null,
    tftpAvailable: false,
    UUID: null,
    Uploadstep: 1,
    // 2
    progressnum: 0,
    progressError: false,
    pcbVersion: null,
    upgradeData: null,
    // 1
    uplondProgress: 0,
    // 验证信息
    confirmInfo: [],
    // 电源在位情况
    PsuPresentMap: null,
    // 电源总个数
    MaxPsuNumber: null,
    PsuPresentNumber: null,
    bmcVersion: null,
    biosVersion: null,
  },
  getters: {
    getUploadstep: (state) => state.Uploadstep,
    isTftpUploadAvailable: (state) => state.tftpAvailable,
    isSingleFileUploadEnabled: (state) => state.hostFirmware.length === 0,
    activeBmcFirmware: (state) => {
      return state.bmcFirmware.find((firmware) => firmware.id === 'bmc_active');
    },
    activeHostFirmware: (state) => {
      return state.hostFirmware.find(
        (firmware) => firmware.id === state.hostActiveFirmwareId
      );
    },
    backupBmcFirmware: (state) => {
      return state.bmcFirmware.find((firmware) => firmware.id === 'bmc_backup');
    },
    backupHostFirmware: (state) => {
      return state.hostFirmware.find(
        (firmware) => firmware.id !== state.hostActiveFirmwareId
      );
    },
    UUID: (state) => state.UUID,
    progressnum: (state) => state.progressnum,
    uplondProgress: (state) => state.uplondProgress,
    progressError: (state) => state.progressError,
    pcbVersion: (state) => state.pcbVersion,
    cpldActiveFirmware: (state) => state.cpldActiveFirmware,
    cpldVersionDate: (state) => state.cpldVersionDate,
    upgradeData: (state) => state.upgradeData,
    confirmInfo: (state) => state.confirmInfo,
    powerPst: (state) => {
      return {
        PsuPresentMap: state.PsuPresentMap,
        MaxPsuNumber: state.MaxPsuNumber,
        PsuPresentNumber: state.PsuPresentNumber,
      };
    },
    bmcVersion: (state) => state.bmcVersion,
    biosVersion: (state) => state.biosVersion,
  },
  mutations: {
    setUploadstep: (state, num) => (state.Uploadstep = num),
    setActiveBmcFirmwareId: (state, id) => (state.bmcActiveFirmwareId = id),
    setActiveHostFirmwareId: (state, id) => (state.hostActiveFirmwareId = id),
    setBmcFirmware: (state, firmware) => (state.bmcFirmware = firmware),
    setHostFirmware: (state, firmware) => (state.hostFirmware = firmware),
    setApplyTime: (state, applyTime) => (state.applyTime = applyTime),
    setTftpUploadAvailable: (state, tftpAvailable) =>
      (state.tftpAvailable = tftpAvailable),
    setUUID: (state, data) => (state.UUID = data),
    setprogressnum: (state, data) => (state.progressnum = data),
    setUplondProgress: (state, data) => (state.uplondProgress = data),
    setProgressError: (state, val) => (state.progressError = val),
    setPcbVersion: (state, val) => (state.pcbVersion = val),
    setCpldActiveFirmware: (state, val) => (state.cpldActiveFirmware = val),
    setCpldActiveFirmwareDate: (state, val) => (state.cpldVersionDate = val),
    // 暂存
    setUpgradeData: (state, val) => (state.upgradeData = val),
    // 验证信息
    setConfirmInfo: (state, val) => (state.confirmInfo = val),
    setPowerPst: (state, val) => {
      state.PsuPresentMap = val.PsuPresentMap;
      state.MaxPsuNumber = val.MaxPsuNumber;
      state.PsuPresentNumber = val.PsuPresentNumber;
    },
    setBmcVersion: (state, data) => (state.bmcVersion = data),
    setBiosVersion: (state, data) => (state.biosVersion = data),
  },
  actions: {
    async getFirmwareInformation({ dispatch }) {
      dispatch('getActiveHostFirmware');
      dispatch('getActiveBmcFirmware');
      return await dispatch('getFirmwareInventory');
    },
    getpowerinfo({ commit }) {
      api
        .get('/redfish/v1/Chassis/1')
        .then(({ data: { PowerSupplySummary } }) => {
          commit('setPowerPst', PowerSupplySummary);
        })
        .catch((error) => console.log(error));
    },
    // 获取首页 UUID
    getActiveBmcFirmware({ commit }) {
      return api
        .get('/redfish/v1/Managers/1')
        .then(({ data: { UUID } }) => {
          commit('setUUID', UUID);
        })
        .catch((error) => console.log(error));
    },
    getActiveHostFirmware({ commit }) {
      return api
        .get('/redfish/v1/Systems/1/Bios')
        .then(({ data: { Links } }) => {
          const id = Links?.ActiveSoftwareImage['@odata.id'].split('/').pop();
          commit('setActiveHostFirmwareId', id);
        })
        .catch((error) => console.log(error));
    },
    // 获取总固件版本信息
    async getFirmwareInventory({ commit }) {
      const inventoryList = await api
        .get('/redfish/v1/UpdateService/FirmwareInventory')
        .then(({ data: { Members = [] } = {} }) =>
          Members.map((item) => api.get(item['@odata.id']))
        )
        .catch((error) => console.log(error));
      await api
        .all(inventoryList)
        .then((response) => {
          const bmcFirmware = [];
          const hostFirmware = [];
          let pcbVersion = '--',
            cpldVersion = '--',
            cpldVersionDate = '--';
          response.forEach(({ data }) => {
            const firmwareType = data?.RelatedItem?.[0]?.['@odata.id']
              .split('/')
              .pop();
            const item = {
              version: data?.Version,
              versionDate: data?.ReleaseDate,
              id: data?.Id,
              location: data?.['@odata.id'],
              status: data?.Status?.Health,
              VersionBackUp: data?.VersionBackUp,
              VersionBackUpDate: data?.ReleaseDateBackUp,
            };
            if (firmwareType === 'bmc') {
              bmcFirmware.push(item);
            } else if (firmwareType === 'Bios') {
              hostFirmware.push(item);
            }
            if (data?.Id === 'pcb') {
              pcbVersion = data?.Version;
            }
            if (data?.Id === 'cpld_active') {
              cpldVersion = data?.Version;
              cpldVersionDate = data?.ReleaseDate;
            }
          });
          commit('setBmcFirmware', bmcFirmware);
          commit('setHostFirmware', hostFirmware);
          commit('setPcbVersion', pcbVersion);
          commit('setCpldActiveFirmware', cpldVersion);
          commit('setCpldActiveFirmwareDate', cpldVersionDate);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // 获取首页BMC 固件版本
    async getBmcFirmwarData({ commit }) {
      const { data } = await api.get(
        '/redfish/v1/UpdateService/FirmwareInventory/bmc_active'
      );
      commit('setBmcVersion', data.Version);
    },
    // 获取首页BIOS 固件版本
    async getBiosFirmwarData({ commit }) {
      const { data } = await api.get(
        '/redfish/v1/UpdateService/FirmwareInventory/bios_active'
      );
      commit('setBiosVersion', data.Version);
    },
    getUpdateServiceSettings({ commit }) {
      api
        .get('/redfish/v1/UpdateService')
        .then(({ data }) => {
          const applyTime =
            data.HttpPushUriOptions.HttpPushUriApplyTime.ApplyTime;
          const allowableActions =
            data?.Actions?.['#UpdateService.SimpleUpdate']?.[
              'TransferProtocol@Redfish.AllowableValues'
            ];

          commit('setApplyTime', applyTime);
          if (allowableActions?.includes('TFTP')) {
            commit('setTftpUploadAvailable', true);
          }
        })
        .catch((error) => console.log(error));
    },
    setApplyTimeImmediate({ commit }) {
      const data = {
        HttpPushUriOptions: {
          HttpPushUriApplyTime: {
            ApplyTime: 'Immediate',
          },
        },
      };
      return api
        .patch('/redfish/v1/UpdateService', data)
        .then(() => commit('setApplyTime', 'Immediate'))
        .catch((error) => console.log(error));
    },

    // BMC and BIOS upload 1
    async uploadFirmware({ state, dispatch, commit }, data) {
      commit('setProgressError', false);

      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch('setApplyTimeImmediate');
      }
      return await api
        .patch('/redfish/v1/UpdateService', data.fristdata, {})
        .then(() => {
          return dispatch('uploadFirmwareImg', data);
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t(
              'pageFirmwareUpdate1.updateFirmware.toast.errorUpdateFirmware'
            )
          );
        });
    },

    // BMC and BIOS Upload img files 2
    async uploadFirmwareImg({ state, dispatch, commit }, data) {
      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch('setApplyTimeImmediate');
      }
      commit('setUpgradeData', data.seconddata);
      return await api
        .post('/redfish/v1/UpdateService/FirmwareInventory', data.image, {
          headers: { 'Content-Type': 'application/octet-stream' },
          onUploadProgress: function (progressEvent) {
            // 对原生进度事件的处理

            let progressPercent = Number(
              ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2)
            );
            commit('setUplondProgress', progressPercent);
            // console.log("pppp", progressPercent)
          },
        })
        .then(() => {
          //  流程修改，此时进入第二步
          return dispatch('setupload', data);
        })
        .then(({ data }) => {
          return dispatch('getBMCaBIOSuplondStatus', data['@odata.id']);
        })
        .catch(() => {
          throw new Error(
            i18n.t(
              'pageFirmwareUpdate2.updateFirmware.toast.errorUpdateFirmware'
            )
          );
        });
    },
    // BMC and BIOS progress 4
    getBMCaBIOSuplondStatus({ commit, dispatch }, url) {
      return api
        .get(url)
        .then(({ data: { TaskState, PercentComplete } }) => {
          commit('setprogressnum', PercentComplete);

          if (PercentComplete != 100) {
            if (TaskState == 'Completed') {
              return true;
            } else if (TaskState == 'Running') {
              setTimeout(() => {
                dispatch('getBMCaBIOSuplondStatus', url);
              }, 2000);
            } else {
              return dispatch('JudgmentFail', url);
            }
          } else {
            return true;
          }
        })
        .catch(() => {
          throw new Error(
            i18n.t(
              'pageFirmwareUpdate3.updateFirmware.toast.errorUpdateFirmware'
            )
          );
        });
    },

    // upload Action 3
    setupload({ state }) {
      let secondData;
      //   if(iscpld){
      //     secondData = data.seconddata
      //   }else{
      //     secondData = state.upgradeData
      //   }
      secondData = state.upgradeData;
      // console.log("ee1211", secondData)
      // commit('setUploadstep', 2)
      // return
      return api
        .post(
          '/redfish/v1/UpdateService/Actions/UpdateService.SimpleUpdate',
          secondData
        )
        .then((res) => {
          if (res.data.TaskStatus == 'Failed') {
            return Promise.reject(2000);
          } else {
            return res;
          }
        })
        .catch((error) => {
          // console.log('ee', error.response.data);
          if (
            error.response.data.error['@Message.ExtendedInfo'][0]
              .MessageArgs[0] == 'FAN_CPLD' &&
            error.response.data.error['@Message.ExtendedInfo'][0]
              .MessageArgs[1] ==
              ' Only the server node on the lower side can upgrade FAN CPLD'
          ) {
            throw new Error(4000);
          } else {
            throw new Error(
              i18n.t('pageFirmwareUpdate4.updateFirmware.toast.erroroccurred')
            );
          }
        });
    },
    // 触发升级操作
    setuploadcpld(data) {
      return api
        .post(
          '/redfish/v1/UpdateService/Actions/UpdateService.SimpleUpdate',
          data.seconddata
        )
        .then((res) => {
          if (res.data.TaskStatus == 'Failed') {
            return Promise.reject(2000);
          } else {
            return res;
          }
        })
        .catch((error) => {
          // console.log('ee', error.response.data);
          if (
            error.response.data.error['@Message.ExtendedInfo'][0]
              .MessageArgs[0] == 'FAN_CPLD' &&
            error.response.data.error['@Message.ExtendedInfo'][0]
              .MessageArgs[1] ==
              ' Only the server node on the lower side can upgrade FAN CPLD'
          ) {
            throw new Error(4000);
          } else {
            throw new Error(
              i18n.t('pageFirmwareUpdate5.updateFirmware.toast.erroroccurred')
            );
          }
        });
    },
    // upload CPLD firmware
    async uploadOtherFirmware({ state, commit, dispatch }, data) {
      // console.log('edat', data);
      if (state.applyTime !== 'Immediate') {
        await dispatch('setApplyTimeImmediate');
      }
      // 获取文件类型
      let type = data.type;

      // 创建默认错误提示字符串
      let errtext = i18n.t(
        'pageFirmwareUpdate.updateFirmware6.toast.errorUpdateFirmware'
      );
      commit('setUpgradeData', data.seconddata);
      // 固件升级接口调取
      return (
        api
          .post(
            'redfish/v1/UpdateService/Actions/Oem/Public/' +
              type +
              '/FirmwareInventory',
            data.image,
            {
              headers: { 'Content-Type': 'application/octet-stream' },
              onUploadProgress: function (progressEvent) {
                // 对原生进度事件的处理

                let progressPercent = Number(
                  ((progressEvent.loaded / progressEvent.total) * 100).toFixed(
                    2
                  )
                );
                commit('setUplondProgress', progressPercent);
                // console.log("pppp", progressPercent)
              },
            }
          )
          // .then((res)=>{
          //     if(type == 'cpld'){
          //         let restype = res.data.Type
          //         return dispatch("upgradeFirmware",[type,restype])
          //     }else{
          //         return dispatch("upgradeFirmware",[type])
          //     }

          // })
          .then((res) => {
            commit('setConfirmInfo', res.data);
            return data;
          })
          //   .then(() => {
          //     if (type == 'cpld') {
          //       return dispatch('getFirmwareuplondStatus');
          //     }
          //   })
          .catch((error) => {
            if (error.message == 4000) {
              errtext = i18n.t(
                'pageFirmwareUpdate.updateFirmware7.toast.errorcpldUpdateFirmware'
              );
            }
            throw new Error(errtext);
          })
      );
    },

    // 暂时弃用
    upgradeFirmware([type, res]) {
      var data = {
        ParameterType: 0,
      };
      if (type == 'cpld') {
        data = {
          CPLDType: res,
        };
      }

      return api
        .post('/' + type + '/upgrade', data, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then((res) => {
          if (res.data.status == 'Fail' || res.data.status == 'fail') {
            throw new Error(
              i18n.t('pageFirmwareUpdate.updateFirmware8.toast.erroroccurred')
            );
          }
        })
        .catch((error) => {
          if (
            error.response.data.error['@Message.ExtendedInfo'][0]
              .MessageArgs[0] == 'FAN_CPLD' &&
            error.response.data.error['@Message.ExtendedInfo'][0]
              .MessageArgs[1] ==
              ' Only the server node on the lower side can upgrade FAN CPLD'
          ) {
            throw new Error(4000);
          } else {
            throw new Error(
              i18n.t('pageFirmwareUpdate.updateFirmware9.toast.erroroccurred')
            );
          }
        });
    },

    getFirmwareuplondStatus({ commit, dispatch }) {
      return api
        .get('/redfish/v1/UpdateService/Actions/Oem/Public/cpld/status')
        .then(({ data: { status, progress } }) => {
          commit('setprogressnum', progress);

          if (status == 'Success' && progress != 100) {
            setTimeout(() => {
              dispatch('getFirmwareuplondStatus');
            }, 2000);
          }
        })
        .catch((error) => console.log(error));
    },
    // end
    async uploadFirmwareTFTP({ state, dispatch }, fileAddress) {
      const data = {
        TransferProtocol: 'TFTP',
        ImageURI: fileAddress,
      };
      if (state.applyTime !== 'Immediate') {
        // ApplyTime must be set to Immediate before making
        // request to update firmware
        await dispatch('setApplyTimeImmediate');
      }
      return await api
        .post(
          '/redfish/v1/UpdateService/Actions/UpdateService.SimpleUpdate',
          data
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t(
              'pageFirmwareUpdate.updateFirmware10.toast.errorUpdateFirmware'
            )
          );
        });
    },
    // async switchBmcFirmwareAndReboot({ getters }) {
    //   const backupLocation = getters.backupBmcFirmware.location;
    //   const data = {
    //     Links: {
    //       ActiveSoftwareImage: {
    //         '@odata.id': backupLocation,
    //       },
    //     },
    //   };
    //   return await api
    //     .patch('/redfish/v1/Managers/bmc', data)
    //     .catch((error) => {
    //       console.log(error);
    //       throw new Error(i18n.t('pageFirmwareUpdate.updateFirmware.toast.errorSwitchImages'));
    //     });
    // },
    async switchBmcFirmwareAndReboot() {
      return await api
        .post('/redfish/v1/Managers/1/Actions/Manager.RollBack')
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageFirmwareUpdate.updateFirmware11.toast.errorSwitchImages')
          );
        });
    },

    // 判断升级过程是否报错
    JudgmentFail({ commit, dispatch }, url) {
      return api
        .get(url + '/Monitor')
        .then(() => {
          return dispatch('getBMCaBIOSuplondStatus', url);
        })
        .catch(() => {
          commit('setprogressnum', 0);
          commit('setProgressError', true);
          throw new Error(
            i18n.t(
              'pageFirmwareUpdate.updateFirmware12.toast.errorUpdateFirmware'
            )
          );
        });
    },
    // 判断有没在升级任务进行中
    async getFirmwareTask() {
      return await api
        .get('/redfish/v1/TaskService/Tasks')
        .then(({ data }) => {
          if (data['Members@odata.count'] == 0) {
            return true;
          } else {
            //   return false
            let mid = [];
            mid = data.Members.map((item) => {
              return item['@odata.id'].split('/').pop();
            });
            mid.sort(function (a, b) {
              return a - b;
            });
            return api
              .get('/redfish/v1/TaskService/Tasks/' + mid.pop())
              .then((res) => {
                if (res.data.TaskState == 'Running') {
                  return false;
                } else {
                  return true;
                }
              });
          }
        })
        .catch((error) => console.log(error));
    },
  },
};

export default FirmwareStore;
