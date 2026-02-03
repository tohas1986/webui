import api from '@/store/api';

const FanStore = {
  namespaced: true,
  state: {
    controlMode: 'auto',
    fans: [],
    systemHealth: 'OK'
  },
  getters: {
    getControlMode: (state) => state.controlMode,
    getFans: (state) => state.fans,
    getSystemHealth: (state) => state.systemHealth
  },
  mutations: {
    setControlMode: (state, mode) => {
      state.controlMode = mode;
    },
    setFans: (state, fans) => {
      state.fans = fans;
    },
    setSystemHealth: (state, health) => {
      state.systemHealth = health;
    },
    updateFanPwm: (state, { fanId, pwm }) => {
      const fan = state.fans.find(f => f.id === fanId);
      if (fan) {
        fan.pwm = pwm;
      }
    }
  },
  actions: {
    async getControlMode() {
      try {
        return await api.get('/xyz/openbmc_project/control/fan/enumerate');
      } catch (error) {
        console.error('Error getting fan control mode:', error);
        throw error;
      }
    },
    
    async setControlMode({ commit }, mode) {
      try {
        const payload = {
          data: { Mode: mode === 'auto' ? 'Automatic' : 'Manual' }
        };
        const response = await api.post(
          '/xyz/openbmc_project/control/fan/mode',
          payload
        );
        commit('setControlMode', mode);
        return response;
      } catch (error) {
        console.error('Error setting fan control mode:', error);
        throw error;
      }
    },
    
    async getFans({ commit }) {
      try {
        // Примерный API endpoint для получения данных вентиляторов
        const response = await api.get('/xyz/openbmc_project/sensors/fan/enumerate');
        const fans = Object.keys(response.data).map(key => ({
          id: key,
          name: response.data[key].Name || `FAN ${key}`,
          speed: response.data[key].Speed || 0,
          pwm: response.data[key].PWM || 0,
          status: response.data[key].Status || 'Unknown'
        }));
        commit('setFans', fans);
        return { data: fans };
      } catch (error) {
        console.error('Error getting fans:', error);
        // Возвращаем тестовые данные для демонстрации
        const mockFans = [
          { id: 'fan0', name: 'System Fan 1', speed: 2500, pwm: 50, status: 'OK' },
          { id: 'fan1', name: 'System Fan 2', speed: 2400, pwm: 50, status: 'OK' },
          { id: 'fan2', name: 'CPU Fan 1', speed: 3200, pwm: 60, status: 'OK' },
          { id: 'fan3', name: 'PSU Fan 1', speed: 1800, pwm: 40, status: 'OK' }
        ];
        commit('setFans', mockFans);
        return { data: mockFans };
      }
    },
    
    async setFanPwm({ commit }, { fanId, pwm }) {
      try {
        const payload = {
          data: { PWM: parseInt(pwm) }
        };
        const response = await api.post(
          `/xyz/openbmc_project/control/fan/${fanId}/pwm`,
          payload
        );
        commit('updateFanPwm', { fanId, pwm });
        return response;
      } catch (error) {
        console.error('Error setting fan PWM:', error);
        throw error;
      }
    },
    
    async getSystemHealth() {
      try {
        const response = await api.get('/xyz/openbmc_project/state/fan/enumerate');
        // Простая логика определения здоровья системы
        const health = response.data.OverallStatus === 'OK' ? 'OK' : 'Degraded';
        return { data: health };
      } catch (error) {
        console.error('Error getting system health:', error);
        return { data: 'Unknown' };
      }
    }
  }
};

export default FanStore;
