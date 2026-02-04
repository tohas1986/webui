<template>
  <div>
    <b-form inline>
      <b-form-group
        :label="$t('pageThermalControl.temperature.heatmap')"
        label-for="Heatmap"
        label-align="right"
      >
        <b-form-checkbox id="Heatmap" v-model="heatmap" switch>
        </b-form-checkbox>
      </b-form-group>
    </b-form>
    <div id="inrev">
      <img
        ref="heatMapImg"
        :src="heatmapSource"
        alt=""
        @load="triggerEvent('img-load-complete')"
      />
      <div id="heatRadiation"></div>
      <div v-show="heatmap" id="heatRadiation2"></div>
      <div v-show="thisPointData.length > 0 && showTip == 1" id="pointhover">
        <div class="card-shadow">
          <div class="title">
            <div class="titlecon">{{ thisPointData[5] || 'N/A' }}</div>
            <div>
              <status-icon :status="statusIcon(thisPointData[2])" />
              {{ thisPointData[2] || 'N/A' }}
            </div>
          </div>
          <div class="readnum">
            <span>
              {{ $t('pageThermalControl.temperature.reading') }}:
              {{ thisPointData[3] || 'N/A' }}℃</span
            >
            <b-progress
              :value="thisPointData[3]"
              :max="150"
              :class="['progress-box', thisPointData[2]]"
            ></b-progress>
          </div>
          <div class="foot">
            {{ this.$t('pageSensors.table.unc') }}:
            {{ thisPointData[8] || 'N/A' }}℃ ;
            {{ this.$t('pageSensors.table.ucr') }}:
            {{ thisPointData[7] || 'N/A' }}℃
          </div>
        </div>
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
import StatusIcon from '@/components/Global/StatusIcon';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
// import * as echarts from 'echarts';
export default {
  components: {
    StatusIcon,
  },
  mixins: [DataFormatterMixin],
  props: {
    BoardID: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      heatmap: false,
      thisPointData: [],
      mash: [],
      mesh_data: [],
      showTip: 0,
    };
  },
  computed: {
    pointArray() {
      return this.$store.getters['ThermalControl/pointData'] || [];
    },
    meshdata() {
      return this.$store.getters['ThermalControl/meshdata'] || [];
    },
    Backplane() {
      return this.$store.getters['ThermalControl/Backplane'];
    },
    productBoardId() {
      return this.$store.getters['ThermalControl/productBoardId'];
    },
    heatmapSource() {
      const serverHeatmapSrcMap = {
        '0x40064101': this.getHeatmapImgSrcForBoard(this.Backplane), //G7460-X6
        '0x40052201': this.getHeatmapImgSrcForProductBoard(), //R7260 X5
        '0x40054101': this.getHeatmapImgSrcForBoard(this.Backplane), //G7466 X5
      };

      return serverHeatmapSrcMap[this.BoardID] || '/img/haetContent.png';
    },
  },
  watch: {},
  //生命周期 - 创建完成（访问当前this实例）
  created() {
    this.$store.dispatch('ThermalControl/getThermalInfo').then(() => {
      this.triggerEvent('thermal-info-complete');
    });
  },
  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {
    this.$root.$on('hideinfo', () => {
      this.showTip = this.showTip - 1;
    });
    const imgLoad = new Promise((resolve) => {
      this.$on('img-load-complete', () => resolve());
    });
    const thermalInfo = new Promise((resolve) => {
      this.$on('thermal-info-complete', () => resolve());
    });
    Promise.all([imgLoad, thermalInfo]).finally(() => {
      this.start(this.meshdata);
      this.drawpoint(this.pointArray);
    });
  },
  beforeDestroy() {
    this.$off('img-load-complete');
    this.$off('thermal-info-complete');
  },
  methods: {
    // EGS 4U10GPU 和 ICX 4U
    getHeatmapImgSrcForBoard(boardType) {
      const heatMapSources = {
        straightBoard: '/img/straightBoard.webp',
        switchBoard: '/img/switchBoard.webp',
      };
      return heatMapSources[boardType] || '/img/haetContent.png';
    },
    // ICX B03
    getHeatmapImgSrcForProductBoard() {
      const ICXHeatMap = {
        40052201: '/img/heatMap_40052201.webp',
        40052301: '/img/heatMap_40052301.webp',
      };
      const boardId = this.productBoardId.toString(16).toUpperCase();
      return ICXHeatMap[boardId] || '/img/haetContent.png';
    },

    mesh_init(width, height) {
      var x, y;

      var mesh = new Array(height);
      for (y = 0; y < height; y++) {
        mesh[y] = new Array(width);
        for (x = 0; x < width; x++) {
          var m = new Object();
          m.fixed = false;
          m.value = 20;
          m.reading = 20;
          mesh[y][x] = m;
        }
      }
      return mesh;
    },
    mesh_compute(mesh) {
      var height = mesh.length;
      var width = mesh[0].length;
      var x, y;

      for (y = 1; y < height - 1; y++) {
        for (x = 1; x < width - 1; x++) {
          var pt = mesh[y][x];
          if (pt.fixed) continue;
          var p0 = mesh[y - 1][x - 1].value,
            p1 = mesh[y - 1][x].value,
            p2 = mesh[y - 1][x + 1].value,
            p3 = mesh[y][x - 1].value,
            p4 = mesh[y][x + 1].value,
            p5 = mesh[y + 1][x - 1].value,
            p6 = mesh[y + 1][x].value,
            p7 = mesh[y + 1][x + 1].value;
          var avg = (pt.value + p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7) / 9.0;

          pt.value = Math.abs(avg);
        }
      }
    },
    getMeshdata(allarrdata) {
      let data = [];
      for (let i = 0; i < allarrdata.length; i++) {
        for (let j = 0; j < allarrdata[0].length; j++) {
          if (allarrdata[i][j].value?.toFixed(0) > 20) {
            if (allarrdata[i][j].value > 20 && allarrdata[i][j].value <= 23) {
              data.push([j, i, 1]);
            } else if (
              allarrdata[i][j].value > 23 &&
              allarrdata[i][j].value <= 26
            ) {
              data.push([j, i, 2]);
            } else if (
              allarrdata[i][j].value > 26 &&
              allarrdata[i][j].value <= 29
            ) {
              data.push([j, i, 3]);
            } else if (
              allarrdata[i][j].value > 29 &&
              allarrdata[i][j].value <= 32
            ) {
              data.push([j, i, 4]);
            } else if (
              allarrdata[i][j].value > 32 &&
              allarrdata[i][j].value <= 38
            ) {
              data.push([j, i, 5]);
            } else if (allarrdata[i][j].value > 38) {
              data.push([j, i, 6]);
            }
          }
        }
      }

      this.mash = data;
    },
    start(opjson) {
      this.mesh_data = this.mesh_init(16, 16);

      for (let i = 0; i < opjson.length; i++) {
        this.mesh_data[opjson[i].y][opjson[i].x] = opjson[i];
      }

      this.mesh_compute(this.mesh_data);
      this.mesh_compute(this.mesh_data);
      this.mesh_compute(this.mesh_data);
      this.mesh_compute(this.mesh_data);

      this.getMeshdata(this.mesh_data);

      this.drawheatmap(this.mash);
    },
    drawpoint(val) {
      var chartDom = document.getElementById('heatRadiation');
      var myChart = this.$echarts.init(chartDom);
      var option;

      option = {
        dataset: {
          source: val,
        },
        xAxis: [
          {
            axisLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            min: 0,
            max: 16,
            interval: 1,
          },
        ],
        yAxis: [
          {
            axisLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            min: 0,
            max: 16,
            interval: 1,
            inverse: true,
          },
        ],
        grid: {
          top: 12,
          bottom: 12,
          right: 20,
          left: 15,
          show: true,
        },
        visualMap: [
          {
            min: 0,
            max: 10,
            show: false,
            dimension: 2,
            seriesIndex: 0,
            pieces: [
              {
                value: 'OK',
                color: '#6DD400',
              },
              {
                value: 'Warning',
                color: '#FAC03D',
              },
              {
                value: 3,
                color: '#FA7B11',
              },
              {
                value: 'Critical',
                color: '#FF2828',
              },
            ],
          },
        ],

        series: [
          {
            stack: '1',
            type: 'scatter',
            xAxisIndex: 0,
            yAxisIndex: 0,
            symbolSize: 12,
            itemStyle: {
              borderColor: '#555',
              opacity: 1,
            },
            encode: {
              x: 0,
              y: 1,
            },
            selectedMode: true,
            select: {
              itemStyle: {
                borderWidth: 4,
                borderColor: 'rgba(10,10,10,0.7)',
                shadowColor: 'rgba(209,225,123)',
                shadowBlur: 5,
                borderJoin: 'round',
              },
            },
          },
        ],
      };

      option && myChart.setOption(option);
      myChart.off('click');
      myChart.on('click', (params) => {
        this.showTip = 2;
        this.thisPointData = params.data;
      });
    },
    drawheatmap(val) {
      var chartDom = document.getElementById('heatRadiation2');
      chartDom.style.width = this.$refs.heatMapImg.width + 'px';
      chartDom.style.height = this.$refs.heatMapImg.height + 'px';
      var myChart = this.$echarts.init(chartDom);
      var option;

      option = {
        dataset: {
          source: val,
        },
        xAxis: [
          {
            type: 'category',
            axisLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitArea: {
              show: true,
            },
            data: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16],
          },
        ],
        yAxis: [
          {
            type: 'category',
            axisLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitArea: {
              show: true,
            },
            inverse: true,
            data: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16],
          },
        ],
        grid: {
          top: 12,
          bottom: 12,
          right: 20,
          left: 15,
          show: true,
          backgroundColor: 'rgba(109,212,0,0.5)',
        },
        visualMap: [
          {
            show: false,
            dimension: 2,
            pieces: [
              {
                value: 1,
                color: '#dfd400',
              },
              {
                value: 2,
                color: '#e4b702',
              },
              {
                value: 3,
                color: '#faa811',
              },
              {
                value: 4,
                color: '#ff9b28',
              },
              {
                value: 5,
                color: '#ff7100',
              },
              {
                value: 6,
                color: '#ff6000',
              },
            ],
          },
        ],

        series: [
          {
            stack: '1',
            type: 'heatmap',
            xAxisIndex: 0,
            yAxisIndex: 0,
            label: {
              show: false,
            },
            emphasis: {
              disabled: true,
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            encode: {
              x: 0,
              y: 1,
            },
            itemStyle: {
              opacity: 0.7,
            },
          },
        ],
      };
      option && myChart.setOption(option);
    },
    triggerEvent(emitMessage) {
      this.$emit(emitMessage);
    },
  },
};
</script>
<style lang="scss" scoped>
#inrev {
  display: inline-block;
  position: relative;
  min-width: 500px;
  min-height: 300px;
  img {
    user-select: none;
  }
}
#heatRadiation {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}
#heatRadiation2 {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  z-index: 1;
}
#pointhover {
  position: absolute;
  width: 250px;
  box-shadow: 0 0 10px 2px rgba(187, 187, 187, 0.774);
  top: 0px;
  left: 600px;
  border-radius: 5px;
  .card-shadow {
    padding: 15px 10px;
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .titlecon {
        font-size: 15px;
        font-weight: 600;
      }
      padding-bottom: 5px;
    }
    .progress.progress-box {
      &.OK {
        ::v-deep .progress-bar {
          background-color: #6dd400;
        }
      }
      &.Warning {
        ::v-deep .progress-bar {
          background-color: #fac03d;
        }
      }
      &.Critical {
        ::v-deep .progress-bar {
          background-color: #ff2828;
        }
      }
    }
  }
  .readnum {
    width: 100%;
    span {
      font-size: 16px;
      color: #004fa3;
    }
    .progress-box {
      margin-top: 2px;
      height: 10px;
      border-radius: 5px;
    }
  }
  .foot {
    padding-top: 5px;
    font-size: 12px;
    color: $gray-700;
  }
  .sa {
    color: #bfd400;
    color: #c4b702;
    color: #faa811;
    color: #ff9b28;
    color: #d47100;
    color: #d46000;
    color: #d46600;
  }
}
</style>
