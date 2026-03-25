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
          const fans = res.data.Fans;
          const fanMap = new Map(); // Используем Map для группировки по номеру вентилятора
          const fanData = [];
          // Вспомогательный метод для определения местоположения
          const getFanLocation = (fanNumber, type) => {
            const locationMap = {
              1: 'Front',
              2: 'Front',
              3: 'Rear',
              4: 'Rear',
            };
            const baseLocation = locationMap[fanNumber] || `Position ${fanNumber}`;
            if (type === 'F') return `${baseLocation} (Front)`;
            if (type === 'R') return `${baseLocation} (Rear)`;
            return baseLocation;
          };
          // Сначала собираем все PWM значения
          const pwmMap = new Map();
          fans.forEach((fan) => {
            let fanNumber = null;
            // Извлекаем номер вентилятора из PWM
            if (fan.MemberId && fan.MemberId.includes('PWM')) {
              const pwmMatch = fan.MemberId.match(/FAN(\d+)_PWM/);
              if (pwmMatch) {
                fanNumber = pwmMatch[1];
                pwmMap.set(fanNumber, fan.Reading || 0);
              }
            } else if (fan.Name && fan.Name.includes('PWM')) {
              const pwmMatch = fan.Name.match(/FAN(\d+)\s+PWM/);
              if (pwmMatch) {
                fanNumber = pwmMatch[1];
                pwmMap.set(fanNumber, fan.Reading || 0);
              }
            }
          });
          // Обрабатываем только Speed вентиляторы (F и R)
          fans.forEach((fan) => {
            // Извлекаем номер вентилятора и тип из MemberId или Name
            let fanNumber = null;
            let fanType = null; // 'F' или 'R'
            // Пытаемся извлечь из MemberId
            if (fan.MemberId) {
              const memberMatch = fan.MemberId.match(/FAN(\d+)_([FR])_Speed/);
              if (memberMatch) {
                fanNumber = memberMatch[1];
                fanType = memberMatch[2];
              }
            }
            // Если не нашли в MemberId, пробуем из Name
            if (!fanNumber && fan.Name) {
              const nameMatch = fan.Name.match(/FAN(\d+)\s+([FR])\s+Speed/);
              if (nameMatch) {
                fanNumber = nameMatch[1];
                fanType = nameMatch[2];
              }
            }
            if (!fanNumber || !fanType) return;
            // Создаем уникальный ID для каждой записи
            const uniqueId = `${fanNumber}_${fanType}`;
            // Формируем название для отображения
            const displayName = `FAN${fanNumber} ${fanType === 'F' ? 'Front' : 'Rear'}`;
            // Получаем PWM значение для этого вентилятора
            const pwmValue = pwmMap.get(fanNumber) || 0;
            // Создаем запись для вентилятора
            const fanEntry = {
              id: uniqueId,
              name: displayName,
              fanNumber: parseInt(fanNumber),
              type: fanType,
              speed: fan.Reading || 0,
              unit: 'RPM',
              dutyRatio: pwmValue, // Добавляем PWM значение
              status: fan.Status?.Health || '',
              model: fan.Model || '',
              location: getFanLocation(parseInt(fanNumber), fanType),
              memberId: fan.MemberId || '',
            };
            fanData.push(fanEntry);
          });
          // Сортируем данные: сначала по номеру вентилятора, затем по типу (F, R)
          const typeOrder = { 'F': 1, 'R': 2 };
          fanData.sort((a, b) => {
            if (a.fanNumber !== b.fanNumber) {
              return a.fanNumber - b.fanNumber;
            }
            return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
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
