export default {
  data() {
    return {
      bmcLocalTime: null,
      bmcClockTimer: null,
      bmcSyncTimer: null,
      lastUpdateTimestamp: null,
    };
  },
  computed: {
    // Возвращает локальное время, если оно установлено, иначе берёт из Vuex
    liveBmcTime() {
      return this.bmcLocalTime || this.$store.getters['global/bmcTime'];
    },
    // Прокси для отслеживания времени из Vuex
    storeBmcTime() {
      return this.$store.getters['global/bmcTime'];
    },
  },
  watch: {
    // Наблюдение за изменением времени в Vuex через вычисляемое свойство
    storeBmcTime: {
      handler(newVal) {
        if (newVal) {
          this.bmcLocalTime = new Date(newVal);
          this.lastUpdateTimestamp = Date.now();
        }
      },
      immediate: true,
    },
  },
  methods: {
    startLiveClock() {
      // Первоначальная синхронизация и запуск таймеров
      this.$store.dispatch('global/getBmcTime').then(() => {
        const fetchedTime = this.$store.getters['global/bmcTime'];
        this.bmcLocalTime = new Date(fetchedTime);
        this.lastUpdateTimestamp = Date.now();

        // Обновление каждую секунду
        this.bmcClockTimer = setInterval(() => {
          const now = Date.now();
          const diff = now - this.lastUpdateTimestamp;
          this.bmcLocalTime = new Date(this.bmcLocalTime.getTime() + diff);
          this.lastUpdateTimestamp = now;
        }, 1000);

        // Синхронизация с сервером каждые 5 минут
        this.bmcSyncTimer = setInterval(
          () => {
            this.$store.dispatch('global/getBmcTime').then(() => {
              this.bmcLocalTime = new Date(
                this.$store.getters['global/bmcTime'],
              );
              this.lastUpdateTimestamp = Date.now();
            });
          },
          5 * 60 * 1000,
        );
      });
    },
    stopLiveClock() {
      clearInterval(this.bmcClockTimer);
      clearInterval(this.bmcSyncTimer);
    },
  },
  mounted() {
    this.startLiveClock();
  },
  beforeDestroy() {
    this.stopLiveClock();
  },
};
