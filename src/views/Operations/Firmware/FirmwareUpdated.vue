<template>
  <div id="Uploadprogressend">
    <b-row class="mt-3">
      <!-- <b-col class="inline-center">
        <dl>
          <dt>{{ $t('pageFirmwareUpdate.updateFirmware.form.upgrading') }}</dt>
          <dd>
            <div id="Uploading" class="ProgressInline">
              <b-progress :value="20" :max="100"></b-progress>
            </div>
          </dd>
        </dl>
      </b-col> -->
    </b-row>
    <b-row id="Uploadprogressended" class="mt-5">
      <b-col class="center mt-3">
        <div class="svg mb-4">
          <svg-icon
            data-icon-name="firmwareUploaded"
            class-name="firmwareUploaded"
          ></svg-icon>
        </div>
        <div class="msg mb-3">
          <span class="tip">
            {{
              $t('pageFirmwareUpdate.updateFirmware.toast.upgradeSuccessful')
            }}
          </span>
          <span class="tip-dir">
            {{
              $t('pageFirmwareUpdate.updateFirmware.toast.upgradeSuccessful')
            }}
          </span>
        </div>
        <!-- <div class="button-center">
          <b-button
            id="StartUpdate"
            class="mr-3"
            type="submit"
            variant="primary"
            size="sm"
            >{{ $t('pageFirmwareUpdate.updateFirmware.rebootBMC') }}</b-button
          >
          <b-button
            id="StartUpdate"
            type="submit"
            variant="primary"
            size="sm"
            >{{ $t('pageFirmwareUpdate.updateFirmware.reUpgrade') }}</b-button
          >
        </div> -->
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';

export default {
  components: {},
  mixins: [BVToastMixin, LoadingBarMixin],
  data() {
    return {
      loading,
      form: {
        selectedFiletypeIndex: 'BMC',
        Partition: '',
        ResetBmc: '',
      },
    };
  },
  computed: {},
  watch: {},

  created() {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.center-in {
  display: flex;
  justify-content: center;
  margin-left: -100px;
}
#Uploading {
  width: 300px;
  .progress {
    height: 8px;
    border-radius: 5px;
    margin-top: 8px;
  }
}
#Uploadprogressended {
  .svg {
    width: 120px;
    height: 120px;
    svg {
      width: 100%;
      height: 100%;
    }
  }
  .center.col {
    display: flex;
    flex-direction: column;
    align-items: center;
    .msg {
      text-align: center;
      .tip {
        display: block;
        color: rgba(0, 0, 0, 0.9);
        font-size: 20px;
      }
      .tip-dir {
        display: block;
        color: rgba(0, 0, 0, 0.5);
        font-size: 15px;
      }
      .button-center {
      }
    }
  }
}
</style>
