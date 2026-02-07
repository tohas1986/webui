import api from '@/store/api';
import i18n from '@/i18n';

const ThermalControlStore = {
  namespaced: true,
  state: {
    pointData: [],
    meshdata: [],
    heatmapData: [],
    fanSpeedSettings: {},
    fanData: [],
    fansTotal: {
      total: 0,
      Present: 0,
    },
    // 4U10GPU
    Backplane: 'n/a',
    // ICX B03
    productBoardId: 0,
  },
  getters: {
    pointData: (state) => state.pointData,
    meshdata: (state) => state.meshdata,
    fanData: (state) => state.fanData,
    fanSpeedSettings: (state) => state.fanSpeedSettings,
    fansTotal: (state) => state.fansTotal,
    Backplane: (state) => state.Backplane,
    productBoardId: (state) => state.productBoardId,
  },
  mutations: {
    setpointData: (state, val) => (state.pointData = val),
    setMeshdata: (state, val) => (state.meshdata = val),
    setfanData: (state, val) => (state.fanData = val),
    setFanSpeedSettings: (state, val) => (state.fanSpeedSettings = val),
    setfansTotal: (state, data) => {
      state.fansTotal.total = data.Total;
      state.fansTotal.Present = data.count;
    },
    setBackplane: (state, val) => (state.Backplane = val),
    setProductBoardId: (state, val) => (state.productBoardId = val),
  },
  actions: {
    async getThermal({ commit }) {
      let datai = {
        Total: 0,
        count: 0,
      };
      return api
        .get('/redfish/v1/Chassis/1/Thermal')
        .then((res) => {
          var FansInfoALL = [];
          res.data.Fans.map((val) => {
            let name = null,
              location = null;
            name = val?.Name?.split('_')[0];
            location = val?.Name?.split('_')[1];
            FansInfoALL.push([val, name, location]);
          });
          FansInfoALL.sort((a, b) => {
            const A = parseInt(a[1]?.replace('FAN', ''));
            const B = parseInt(b[1]?.replace('FAN', ''));
            return A - B;
          });

          var Fans = [],
            FansInfo = [];

          FansInfoALL.map((val) => {
            if (!FansInfo.includes(val[1])) {
              FansInfo.push(val[1]);
              Fans.push({ name: val[1], val: [] });
            }
          });
          FansInfoALL.map((val1) => {
            Fans.map((val2) => {
              if (val1[1] == val2.name) {
                const sem = {
                  Location: val1[2],
                  Status:
                    val1[0].Status.State === 'Enabled'
                      ? val1[0].Status.Health
                      : '',
                  speed1: val1[0].Reading,
                  speed2: val1[0].Oem.Public.SpeedRatio,
                  Model: val1[0].Model,
                };
                val2.val.push(sem);
              }
            });
          });
          datai.Total = res.data['Members@odata.count'];
          datai.count = res.data.FanSummary.Count;

          commit('setfanData', Fans);
          commit('setfansTotal', datai);
          commit('setBackplane', res.data.Backplane);
          commit('setProductBoardId', res.data.ProductBoardId);
        })
        .catch((error) => {
          console.log('Product Info error', error.message);
        });
    },
    async getThermalInfo({ commit }) {
      const sensors = await api
        .get(`/redfish/v1/Chassis`)
        .then((response) => {
          return response.data.Members;
        })
        .catch((error) => console.log(error));
      if (!sensors) return;
      const promises = [];
      sensors.map((sensor) => {
        promises.push(
          api.get(sensor['@odata.id'] + '/Thermal').catch((error) => {
            console.log(error);
            return error;
          })
        );
      });

      return api
        .all(promises)
        .then(
          api.spread((...responses) => {
            var dataArray = [];
            var dataarrobj = [];

            // 定义 Status.Health 的优先级
            const healthPriority = {
              Critical: 4,
              Warning: 3,
              OK: 2,
              nop: 1,
            };

            responses.map(({ data }) => {
              data.Temperature.map((val) => {
                const { Oem, ReadingCelsius } = val;
                if (Oem && ReadingCelsius != null) {
                  let flag = false;
                  //let healthyLevel = 0;

                  for (let i = 0; i < dataArray.length; i++) {
                    // 如果点位相同
                    if (dataArray[i][6] === Oem.Coordinate) {
                      // 获取当前点的 Health 状态
                      const currentHealth = dataArray[i][2];
                      const currentPriority = healthPriority[currentHealth];

                      // 获取新的点的 Health 状态
                      const newHealth = val.Status.Health;
                      const newPriority = healthPriority[newHealth];

                      // 根据 Health 优先级更新数据
                      if (newPriority > currentPriority) {
                        dataArray[i] = [
                          Oem['X-coordinate'],
                          Oem['Y-coordinate'],
                          newHealth,
                          ReadingCelsius,
                          val.MaxReadingRangeTemp,
                          Oem.CoordinateName,
                          Oem.Coordinate,
                          val?.UpperThresholdCritical || 'N/A',
                          val?.UpperThresholdNonCritical || 'N/A',
                        ];
                        dataarrobj[i] = {
                          x: Oem['X-coordinate'],
                          y: Oem['Y-coordinate'],
                          value: ReadingCelsius,
                          health: newHealth,
                          fixed: true,
                        };
                        flag = true;
                        //healthyLevel = newPriority;
                      } else if (newPriority === currentPriority) {
                        // 如果 Health 优先级相同，则比较 ReadingCelsius
                        if (dataArray[i][3] < ReadingCelsius) {
                          dataArray[i] = [
                            Oem['X-coordinate'],
                            Oem['Y-coordinate'],
                            newHealth,
                            ReadingCelsius,
                            val.MaxReadingRangeTemp,
                            Oem.CoordinateName,
                            Oem.Coordinate,
                            val?.UpperThresholdCritical || 'N/A',
                            val?.UpperThresholdNonCritical || 'N/A',
                          ];
                          dataarrobj[i] = {
                            x: Oem['X-coordinate'],
                            y: Oem['Y-coordinate'],
                            value: ReadingCelsius,
                            health: newHealth,
                            fixed: true,
                          };
                          flag = true;
                          //healthyLevel = newPriority;
                        }
                      }
                    }
                  }

                  if (!flag) {
                    dataArray.push([
                      Oem['X-coordinate'],
                      Oem['Y-coordinate'],
                      val.Status.Health,
                      ReadingCelsius,
                      val.MaxReadingRangeTemp,
                      Oem.CoordinateName,
                      Oem.Coordinate,
                      val?.UpperThresholdCritical || 'N/A',
                      val?.UpperThresholdNonCritical || 'N/A',
                    ]);
                    dataarrobj.push({
                      x: Oem['X-coordinate'],
                      y: Oem['Y-coordinate'],
                      value: ReadingCelsius,
                      health: val.Status.Health,
                      fixed: true,
                    });
                  }
                }
              });
            });

            commit('setpointData', dataArray);
            commit('setMeshdata', dataarrobj);
          })
        )
        .catch((error) => {
          console.log('Product Info error', error.message);
        });
    },

    getFanSpeedSettings({ commit }) {
      return api
        .get('/redfish/v1/Managers/bmc')
        .then((res) => {
          commit('setFanSpeedSettings', res.data);
        })
        .catch(() => {
          throw new Error('get speed settings error');
        });
    },
    updateFanSpeedSettings({ dispatch }, req) {
      return api
        .patch('/redfish/v1/Managers/bmc', req)
        .then(() => {
          dispatch('getFanSpeedSettings');
          return i18n.t(
            'pageThermalControl.temperature.toast.successSaveFanSettings'
          );
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageThermalControl.temperature.toast.erroeSaveFanSettings')
          );
        });
    },
  },
};

export default ThermalControlStore;
