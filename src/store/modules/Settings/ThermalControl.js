import api from '@/store/api';
import i18n from '@/i18n';

const ThermalControlStore = {
  namespaced: true,
  state: {
    pointData: [],
    meshdata: [],
    heatmapData: [],
    fanProfile: {},
    fanData: [],
    fansTotal: {
      total: 0,
      Present: 0,
    },
    Backplane: 'n/a',
    productBoardId: 0,
  },
  getters: {
    pointData: (state) => state.pointData,
    meshdata: (state) => state.meshdata,
    fanData: (state) => state.fanData,
    fanProfile: (state) => state.fanProfile,
    fansTotal: (state) => state.fansTotal,
    Backplane: (state) => state.Backplane,
    productBoardId: (state) => state.productBoardId,
  },
  mutations: {
    setpointData: (state, val) => (state.pointData = val),
    setMeshdata: (state, val) => (state.meshdata = val),
    setfanData: (state, val) => (state.fanData = val),
    setFanProfile: (state, val) => (state.fanProfile = val),
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
      .get('/redfish/v1/Chassis/System_FRU/Thermal')
      .then((res) => {
        // Вспомогательный метод для определения местоположения вентилятора
        const getFanLocation = (fanNumber) => {
          const locationMap = {
            1: 'Front',
            2: 'Front',
            3: 'Rear',
            4: 'Rear',
          };
          return locationMap[fanNumber] || `Position ${fanNumber}`;
        };
      
        const fans = res.data.Fans;
        const fanMap = new Map();
      
        // Группировка данных по вентиляторам
        fans.forEach((fan) => {
          // Извлекаем номер вентилятора и тип из MemberId или Name
          let fanNumber = null;
          let fanType = null;
        
          // Пытаемся извлечь из MemberId (более надежный способ)
          if (fan.MemberId) {
            const memberMatch = fan.MemberId.match(/FAN(\d+)_([FR]?)_?(PWM|Speed)?/);
            if (memberMatch) {
              fanNumber = memberMatch[1];
              // Определяем тип по наличию PWM или Speed
              if (memberMatch[3] === 'PWM') {
                fanType = 'PWM';
              } else if (memberMatch[2] === 'F' || memberMatch[2] === 'R') {
                fanType = memberMatch[2];
              } else {
                fanType = 'Speed';
              }
            }
          }
        
          // Если не нашли в MemberId, пробуем из Name
          if (!fanNumber && fan.Name) {
            const nameMatch = fan.Name.match(/FAN(\d+)\s+([FR]?)\s*(PWM|Speed)?/);
            if (nameMatch) {
              fanNumber = nameMatch[1];
              if (nameMatch[3] === 'PWM') {
                fanType = 'PWM';
              } else if (nameMatch[2] === 'F' || nameMatch[2] === 'R') {
                fanType = nameMatch[2];
              } else {
                fanType = 'Speed';
              }
            }
          }
        
          if (!fanNumber) return;
        
          // Инициализируем запись для вентилятора, если её ещё нет
          if (!fanMap.has(fanNumber)) {
            fanMap.set(fanNumber, {
              name: `FAN${fanNumber}`,
              location: getFanLocation(fanNumber),
              status: '',
              model: '',
              frontSpeed: 0,    // скорость переднего вентилятора (F)
              rearSpeed: 0,     // скорость заднего вентилятора (R)
              dutyRatio: 0,     // PWM значение
              avgSpeed: 0,      // средняя скорость
            });
          }
        
          const fanInfo = fanMap.get(fanNumber);
        
          // Обрабатываем разные типы данных
          if (fanType === 'PWM') {
            fanInfo.dutyRatio = fan.Reading || 0;
          } else if (fanType === 'F') {
            fanInfo.frontSpeed = fan.Reading || 0;
            // Обновляем статус, если есть
            if (fan.Status?.Health) {
              const priority = {
                Critical: 3,
                Warning: 2,
                OK: 1,
                '': 0,
              };
              if (priority[fan.Status.Health] > priority[fanInfo.status]) {
                fanInfo.status = fan.Status.Health;
              }
            }
          } else if (fanType === 'R') {
            fanInfo.rearSpeed = fan.Reading || 0;
            // Обновляем статус, если есть
            if (fan.Status?.Health) {
              const priority = {
                Critical: 3,
                Warning: 2,
                OK: 1,
                '': 0,
              };
              if (priority[fan.Status.Health] > priority[fanInfo.status]) {
                fanInfo.status = fan.Status.Health;
              }
            }
          } else if (fanType === 'Speed') {
            // Для обратной совместимости, если не удалось определить F/R
            if (!fanInfo.frontSpeed) fanInfo.frontSpeed = fan.Reading || 0;
            if (fan.Status?.Health) {
              const priority = {
                Critical: 3,
                Warning: 2,
                OK: 1,
                '': 0,
              };
              if (priority[fan.Status.Health] > priority[fanInfo.status]) {
                fanInfo.status = fan.Status.Health;
              }
            }
          }
        
          // Получаем модель, если есть
          if (fan.Model && !fanInfo.model) {
            fanInfo.model = fan.Model;
          }
        });
      
        // Вычисляем среднюю скорость и обновляем местоположение для каждого вентилятора
        const fanData = Array.from(fanMap.values())
          .map(fan => {
            // Вычисляем среднюю скорость
            const speeds = [];
            if (fan.frontSpeed > 0) speeds.push(fan.frontSpeed);
            if (fan.rearSpeed > 0) speeds.push(fan.rearSpeed);
            fan.avgSpeed = speeds.length > 0 
              ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length)
              : 0;
          
            // Используем переднюю скорость как основную для отображения
            fan.speed = fan.frontSpeed || fan.rearSpeed || 0;
          
            // Обновляем локацию с информацией о наличии обоих вентиляторов
            const fanNumber = parseInt(fan.name.replace('FAN', ''));
            let location = getFanLocation(fanNumber);
            if (fan.frontSpeed > 0 && fan.rearSpeed > 0) {
              location = `${location} (F+R)`;
            } else if (fan.frontSpeed > 0) {
              location = `${location} (F)`;
            } else if (fan.rearSpeed > 0) {
              location = `${location} (R)`;
            }
            fan.location = location;
          
            return fan;
          })
          .sort((a, b) => {
            const numA = parseInt(a.name.replace('FAN', ''));
            const numB = parseInt(b.name.replace('FAN', ''));
            return numA - numB;
          });
      
        datai.Total = fanData.length;
        datai.count = fanData.filter(
          (fan) => fan.status && fan.status !== '' && fan.status !== 'OK'
        ).length;
      
        commit('setfanData', fanData);
        commit('setfansTotal', datai);
        commit('setBackplane', res.data.Backplane || 'n/a');
        commit('setProductBoardId', res.data.ProductBoardId || 0);
      })
      .catch((error) => {
        console.log('Thermal data error', error.message);
        throw error;
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

    // Новый метод для получения профиля вентиляторов
    async getFanProfile({ commit }) {
      return api
        .get('/redfish/v1/Managers/bmc')
        .then((res) => {
          const fanConfig = res.data?.Oem?.OpenBmc?.Fan || {};
          commit('setFanProfile', {
            Profile: fanConfig.Profile || 'Performance',
            ManualPwmPercent: fanConfig.ManualPwmPercent || 20,
            AllowableValues: fanConfig['Profile@Redfish.AllowableValues'] || [
              'Acoustic',
              'Performance',
            ],
          });
          return fanConfig;
        })
        .catch((error) => {
          console.error('Error getting fan profile:', error);
          throw new Error(
            i18n.t('pageThermalControl.temperature.toast.errorGetFanProfile')
          );
        });
    },

    // Новый метод для обновления профиля вентиляторов
    async updateFanProfile({ dispatch }, requestData) {
      return api
        .patch('/redfish/v1/Managers/bmc', requestData)
        .then(() => {
          // Обновляем локальное состояние после успешного обновления
          return dispatch('getFanProfile').then(() => {
            return i18n.t(
              'pageThermalControl.temperature.toast.successSaveFanSettings'
            );
          });
        })
        .catch((error) => {
          console.error('Error updating fan profile:', error);
          throw new Error(
            i18n.t('pageThermalControl.temperature.toast.errorSaveFanSettings')
          );
        });
    },
  },
};

export default ThermalControlStore;
