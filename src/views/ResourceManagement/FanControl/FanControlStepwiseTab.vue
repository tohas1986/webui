<template>
  <b-row class="section-container sticky-container">
    <b-col sm="12" lg="6" class="pl-0 mb-5">
      <dt>{{ $t('pageFanControl.steps') }}</dt>
      <b-row class="steps">
        <b-col v-for="(step, idx) in steps" :key="idx" class="pr-0 pl-0" lg="1">
          <label>{{ $t('pageFanControl.form.output') }}-{{ idx + 1 }}</label>
          <b-form-group>
            <b-form-input v-model.number="localOutputs[idx]" type="number" />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="steps">
        <b-col
          v-for="(step, idx) in steps"
          :key="'target-' + idx"
          class="pr-0 pl-0"
          lg="1"
        >
          <label>{{ $t('pageFanControl.form.target') }}-{{ idx + 1 }}</label>
          <b-form-group>
            <b-form-input v-model.number="localTargets[idx]" type="number" />
          </b-form-group>
        </b-col>
      </b-row>
    </b-col>

    <b-col lg="6" class="pr-0">
      <line-chart :chart-data="chartDataComputed" />
    </b-col>

    <b-col sm="12" lg="3" class="pl-0 mt-3 mb-3">
      <dl>
        <dt>{{ $t('pageFanControl.fanControlType') }}</dt>
        <dd>{{ $t('pageFanControl.stepwiseControllers') }}</dd>
      </dl>
    </b-col>

    <b-col sm="12" lg="3" class="mt-3 mb-3">
      <dl>
        <dt>{{ $t('pageFanControl.zone') }}</dt>
        <div class="d-flex">
          <dd v-for="zone in zones" :key="zone['@odata.id']" class="mr-2">
            {{ zoneFormatter(zone) }}
          </dd>
        </div>
      </dl>
    </b-col>

    <b-col sm="12" lg="6" class="pr-0 mt-3 mb-3">
      <dt>{{ $t('pageFanControl.sensors') }}</dt>
      <div class="sensors-container">
        <b-badge v-for="sensor in sensors" :key="sensor" variant="primary" pill>
          {{ sensor }}
        </b-badge>
      </div>
    </b-col>
  </b-row>
</template>

<script>
import LineChart from '@/components/Global/LineChart';
export default {
  name: 'StepwiseFanTab',
  components: { LineChart },
  props: {
    steps: {
      type: Array,
      default: () => [],
    },
    outputs: {
      type: Array,
      default: () => [],
    },
    targets: {
      type: Array,
      default: () => [],
    },
    zones: {
      type: Array,
      default: () => [],
    },
    sensors: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localOutputs: [...this.outputs],
      localTargets: [...this.targets],
    };
  },
  computed: {
    chartDataComputed() {
      return {
        labels: this.localTargets.map((val) => val.toString()),
        datasets: [
          {
            label: this.$t('pageFanControl.steps'),
            data: this.localOutputs,
            backgroundColor: '$main-color',
          },
        ],
      };
    },
  },
  watch: {
    localOutputs: {
      deep: true,
      handler(val) {
        this.$emit('update:outputs', val);
      },
    },
    localTargets: {
      deep: true,
      handler(val) {
        this.$emit('update:targets', val);
      },
    },
    outputs: {
      deep: true,
      immediate: true,
      handler(val) {
        if (JSON.stringify(val) !== JSON.stringify(this.localOutputs)) {
          this.localOutputs = [...val];
        }
      },
    },
    targets: {
      deep: true,
      immediate: true,
      handler(val) {
        if (JSON.stringify(val) !== JSON.stringify(this.localTargets)) {
          this.localTargets = [...val];
        }
      },
    },
  },
  methods: {
    zoneFormatter(zone) {
      return zone['@odata.id'].split('/').pop('');
    },
  },
};
</script>

<style lang="scss" scoped>
.sticky-container {
  overflow-y: auto;
  max-height: calc(100vh - 680px);
  scrollbar-width: thin;

  @include media-breakpoint-down('xl') {
    max-height: calc(100vh - 460px);
  }
}

.sensors-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 5px;
}

.steps {
  gap: 5px;
}

.col-lg-1 {
  flex: 0 0 11% !important;
  max-width: 11% !important;
}
</style>
