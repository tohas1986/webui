const DataFormatterMixin = {
  methods: {
    dataFormatter(value) {
      if (value === undefined || value === null || value === '') {
        return '--';
      } else if (typeof value === 'number') {
        return parseFloat(value.toFixed(3));
      } else {
        return value;
      }
    },
    statusIcon(status) {
      switch (status) {
        case 'OK':
          return 'success';
        case 'Warning':
          return 'warning';
        case 'Critical':
          return 'danger';
        default:
          return '';
      }
    },
    dataFormatterArray(value) {
      return value.join(', ');
    },
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) {
        return '0';
      } else {
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = [
          this.$t('global.sizes.bytes'),
          this.$t('global.sizes.kb'),
          this.$t('global.sizes.mb'),
          this.$t('global.sizes.gb'),
          this.$t('global.sizes.tb'),
        ];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
          parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
        );
      }
    },
    mbToGb(mb) {
      if (mb === null || mb === undefined || mb === '' || isNaN(mb)) {
        return '--';
      }
      const toGb = Number(mb) / 1024;
      return `${toGb} ${this.$t('global.sizes.gb')}`;
    },
    extractCpuFrequency(cpuString) {
      const match = cpuString.match(/(\d+(?:\.\d+)?)[\s]*([GM]?)Hz/i);
      if (!match) return '--';

      const value = parseFloat(match[1]);
      const unit = match[2].toUpperCase() || 'G';

      if (unit === 'G') {
        const formattedValue = value.toFixed(3);
        return formattedValue;
      } else {
        const formattedValue = (value / 1000).toFixed(3);
        return formattedValue;
      }
    },
    formatCpu(cpu) {
      if (typeof cpu !== 'number' || isNaN(cpu)) {
        return '--';
      }
      if (cpu >= 1000) {
        const cpuString = cpu.toString();
        return cpuString.replace(/^(\d)(\d{3}).*$/, '$1.$2');
      } else {
        const ghzValue = cpu / 1000;
        return ghzValue.toFixed(3);
      }
    },
  },
};

export default DataFormatterMixin;
