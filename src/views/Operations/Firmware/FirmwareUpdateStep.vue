<!-- Step -->
<template>
  <div class="Step-group">
    <div
      :class="{ Step: true, active: stepNamber == 1, actived: stepNamber > 1 }"
      class="Step"
    >
      <div class="StepTip mr-2">
        <div class="Step-tipBorder">
          <span v-if="stepNamber <= 1">1</span>
          <span v-else>✓</span>
        </div>
      </div>
      <div class="StepMsg">
        <span>{{ $t("pageFirmwareUpdate.updateFirmware.prepare") }}</span>
      </div>
    </div>
    <div :class="{ Stephr: true, ined: stepNamber >= 1 }"></div>
    <div
      :class="{ Step: true, active: stepNamber == 2, actived: stepNamber > 2 }"
    >
      <div class="StepTip mr-2">
        <div class="Step-tipBorder">
          <!-- {{stepNamber<2}} -->
          <span v-if="stepNamber <= 2">2</span>
          <span v-else>✓</span>
        </div>
      </div>
      <div class="StepMsg">
        <span>{{ $t("pageFirmwareUpdate.updateFirmware.verify") }}</span>
      </div>
    </div>
    <div :class="{ Stephr: true, ined: stepNamber >= 2 }"></div>
    <div
      :class="{ Step: true, active: stepNamber == 3, actived: stepNamber > 3 }"
    >
      <div class="StepTip mr-2">
        <div class="Step-tipBorder">
          <span v-if="stepNamber <= 3">3</span>
          <span v-else>✓</span>
        </div>
      </div>
      <div class="StepMsg">
        <span>{{
          $t("pageFirmwareUpdate.updateFirmware.completeUpgrade")
        }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["stepNamber"],
  data() {
    return {
      // stepNamber:1,
      status: "NotActive",
    };
  },
  computed: {},
  //生命周期 - 创建完成（访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {},
  methods: {},
};
</script>
<style lang="scss" scoped>
/* @import url(); 引入css类 */

.Step-group {
  display: flex;
  justify-content: center;
  .Stephr {
    width: 150px;
    height: 2px;
    background-color: gray('400');
    margin: 13px 20px;
    &.ined {
      background-color: gray('400');
    }
  }
}
.Step {
  display: flex;
  color: $gray-400;
  font-size: 16px;
  .StepTip {
    .Step-tipBorder {
      border: $gray-400 2px solid;
      width: 25px;
      height: 25px;
      border-radius: 15px;
      text-align: center;
      line-height: 25px;
      box-sizing: content-box;
    }
  }
  &.active {
    .Step-tipBorder {
      border: gray('400') 2px solid;
      background-color: gray('400');
      color: $white;
    }
    .StepMsg {
      color: gray('400');
    }
  }
  &.actived {
    .Step-tipBorder {
      border: gray('400') 2px solid;
      color: gray('400');
    }
    .StepMsg {
      color: gray('400');
    }
  }
}
</style>
