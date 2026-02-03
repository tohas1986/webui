<template>
  <div class="fan-settings">
    <b-container fluid>
      <b-row>
        <b-col>
          <h1 class="mb-4">{{ $t('pageFanSettings.title') }}</h1>
          <b-alert v-model="showAlert" variant="danger" dismissible>
            {{ alertMessage }}
          </b-alert>
        </b-col>
      </b-row>

      <!-- Режим управления -->
      <b-row class="mb-4">
        <b-col>
          <b-card :title="$t('pageFanSettings.controlMode')">
            <b-form-group>
              <b-form-radio-group
                v-model="controlMode"
                :options="modeOptions"
                buttons
                button-variant="outline-primary"
                @change="onModeChange"
              ></b-form-radio-group>
            </b-form-group>
            
            <b-alert v-if="controlMode === 'manual'" variant="info" show>
              {{ $t('pageFanSettings.manualModeWarning') }}
            </b-alert>
          </b-card>
        </b-col>
      </b-row>

      <!-- Настройки вручную -->
      <b-row v-if="controlMode === 'manual'">
        <b-col>
          <b-card :title="$t('pageFanSettings.manualControl')">
            <!-- Общий PWM для всех вентиляторов -->
            <b-form-group
              :label="$t('pageFanSettings.globalPwm')"
              label-for="global-pwm"
              :description="$t('pageFanSettings.pwmDescription')"
            >
              <b-form-input
                id="global-pwm"
                v-model="globalPwm"
                type="range"
                min="0"
                max="100"
                :disabled="controlMode !== 'manual'"
                @change="setGlobalPwm"
              ></b-form-input>
              <div class="mt-2">
                <b-badge variant="primary">{{ globalPwm }}%</b-badge>
                <b-button
                  variant="outline-secondary"
                  size="sm"
                  class="ml-2"
                  :disabled="controlMode !== 'manual'"
                  @click="setGlobalPwm(50)"
                >
                  {{ $t('pageFanSettings.setTo50') }}
                </b-button>
                <b-button
                  variant="outline-secondary"
                  size="sm"
                  class="ml-1"
                  :disabled="controlMode !== 'manual'"
                  @click="setGlobalPwm(100)"
                >
                  {{ $t('pageFanSettings.setTo100') }}
                </b-button>
              </div>
            </b-form-group>

            <!-- Индивидуальные настройки вентиляторов -->
            <b-form-group
              v-if="fans.length > 0"
              :label="$t('pageFanSettings.individualFans')"
              class="mt-4"
            >
              <b-table
                :items="fans"
                :fields="fanFields"
                striped
                responsive
              >
                <template #cell(name)="data">
                  <span class="fan-name">{{ data.value }}</span>
                </template>
                <template #cell(speed)="data">
                  <span :class="getSpeedClass(data.item.speed)">
                    {{ data.value }} RPM
                  </span>
                </template>
                <template #cell(pwm)="data">
                  <b-form-input
                    v-model="data.item.pwm"
                    type="range"
                    min="0"
                    max="100"
                    :disabled="controlMode !== 'manual'"
                    @change="setFanPwm(data.item.id, data.item.pwm)"
                  ></b-form-input>
                  <b-badge variant="info">{{ data.item.pwm }}%</b-badge>
                </template>
              </b-table>
            </b-form-group>
          </b-card>
        </b-col>
      </b-row>

      <!-- Информация о состоянии -->
      <b-row class="mt-4">
        <b-col>
          <b-card :title="$t('pageFanSettings.systemStatus')">
            <b-row>
              <b-col md="6">
                <b-list-group>
                  <b-list-group-item>
                    <strong>{{ $t('pageFanSettings.currentMode') }}:</strong>
                    <b-badge :variant="controlMode === 'auto' ? 'success' : 'warning'" class="ml-2">
                      {{ controlMode === 'auto' ? $t('pageFanSettings.auto') : $t('pageFanSettings.manual') }}
                    </b-badge>
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>{{ $t('pageFanSettings.totalFans') }}:</strong>
                    <span class="ml-2">{{ fans.length }}</span>
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>{{ $t('pageFanSettings.systemHealth') }}:</strong>
                    <b-badge :variant="systemHealth === 'OK' ? 'success' : 'danger'" class="ml-2">
                      {{ systemHealth }}
                    </b-badge>
                  </b-list-group-item>
                </b-list-group>
              </b-col>
              <b-col md="6">
                <b-list-group>
                  <b-list-group-item>
                    <strong>{{ $t('pageFanSettings.avgSpeed') }}:</strong>
                    <span class="ml-2">{{ averageSpeed }} RPM</span>
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>{{ $t('pageFanSettings.avgPwm') }}:</strong>
                    <span class="ml-2">{{ averagePwm }}%</span>
                  </b-list-group-item>
                  <b-list-group-item>
                    <strong>{{ $t('pageFanSettings.lastUpdate') }}:</strong>
                    <span class="ml-2">{{ lastUpdate }}</span>
                  </b-list-group-item>
                </b-list-group>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { throttle } from 'lodash';

export default {
  name: 'FanSettings',
  data() {
    return {
      controlMode: 'auto',
      globalPwm: 50,
      fans: [],
      systemHealth: 'OK',
      lastUpdate: '',
      showAlert: false,
      alertMessage: '',
      
      modeOptions: [
        { text: this.$t('pageFanSettings.autoMode'), value: 'auto' },
        { text: this.$t('pageFanSettings.manualMode'), value: 'manual' }
      ],
      
      fanFields: [
        { key: 'id', label: this.$t('pageFanSettings.fanId'), sortable: true },
        { key: 'name', label: this.$t('pageFanSettings.fanName'), sortable: true },
        { key: 'speed', label: this.$t('pageFanSettings.currentSpeed'), sortable: true },
        { key: 'pwm', label: this.$t('pageFanSettings.pwmControl'), sortable: true }
      ]
    };
  },
  computed: {
    averageSpeed() {
      if (this.fans.length === 0) return 0;
      const sum = this.fans.reduce((acc, fan) => acc + fan.speed, 0);
      return Math.round(sum / this.fans.length);
    },
    averagePwm() {
      if (this.fans.length === 0) return 0;
      const sum = this.fans.reduce((acc, fan) => acc + fan.pwm, 0);
      return Math.round(sum / this.fans.length);
    }
  },
  mounted() {
    this.loadFanData();
    // Обновляем данные каждые 5 секунд
    this.pollingInterval = setInterval(this.loadFanData, 5000);
  },
  beforeDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  },
  methods: {
    async loadFanData() {
      try {
        // Загружаем текущий режим управления
        const modeResponse = await this.$store.dispatch('fan/getControlMode');
        this.controlMode = modeResponse.data;
        
        // Загружаем данные вентиляторов
        const fansResponse = await this.$store.dispatch('fan/getFans');
        this.fans = fansResponse.data;
        
        // Загружаем статус системы
        const healthResponse = await this.$store.dispatch('fan/getSystemHealth');
        this.systemHealth = healthResponse.data;
        
        this.lastUpdate = new Date().toLocaleTimeString();
      } catch (error) {
        this.showError(this.$t('pageFanSettings.errorLoadingData'));
      }
    },
    
    async onModeChange(mode) {
      try {
        await this.$store.dispatch('fan/setControlMode', mode);
        this.showSuccess(this.$t('pageFanSettings.modeChanged'));
        
        if (mode === 'auto') {
          // При переключении в авто-режим сбрасываем PWM
          this.globalPwm = 50;
          await this.loadFanData();
        }
      } catch (error) {
        this.controlMode = this.controlMode === 'auto' ? 'manual' : 'auto';
        this.showError(this.$t('pageFanSettings.errorChangingMode'));
      }
    },
    
    setGlobalPwm: throttle(async function(pwm) {
      if (typeof pwm !== 'number') {
        pwm = this.globalPwm;
      }
      
      try {
        if (this.controlMode !== 'manual') {
          this.showError(this.$t('pageFanSettings.switchToManualFirst'));
          return;
        }
        
        // Устанавливаем PWM для всех вентиляторов
        await Promise.all(
          this.fans.map(fan => 
            this.$store.dispatch('fan/setFanPwm', {
              fanId: fan.id,
              pwm: pwm
            })
          )
        );
        
        // Обновляем локальные данные
        this.fans = this.fans.map(fan => ({
          ...fan,
          pwm: pwm
        }));
        
        this.showSuccess(this.$t('pageFanSettings.globalPwmSet', { pwm }));
      } catch (error) {
        this.showError(this.$t('pageFanSettings.errorSettingPwm'));
      }
    }, 1000),
    
    async setFanPwm(fanId, pwm) {
      try {
        if (this.controlMode !== 'manual') {
          this.showError(this.$t('pageFanSettings.switchToManualFirst'));
          return;
        }
        
        await this.$store.dispatch('fan/setFanPwm', { fanId, pwm });
        this.showSuccess(this.$t('pageFanSettings.fanPwmSet', { fanId, pwm }));
      } catch (error) {
        this.showError(this.$t('pageFanSettings.errorSettingFanPwm'));
      }
    },
    
    getSpeedClass(speed) {
      if (speed < 1000) return 'speed-low';
      if (speed < 3000) return 'speed-medium';
      return 'speed-high';
    },
    
    showError(message) {
      this.alertMessage = message;
      this.showAlert = true;
    },
    
    showSuccess(message) {
      // Можно использовать тост или временное уведомление
      this.$bvToast.toast(message, {
        title: this.$t('pageFanSettings.success'),
        variant: 'success',
        solid: true
      });
    }
  }
};
</script>

<style scoped>
.fan-settings {
  padding: 20px;
}

.fan-name {
  font-weight: bold;
}

.speed-low {
  color: var(--success);
}

.speed-medium {
  color: var(--warning);
}

.speed-high {
  color: var(--danger);
  font-weight: bold;
}

.card {
  margin-bottom: 20px;
}

.list-group-item {
  border-left: none;
  border-right: none;
}
</style>
