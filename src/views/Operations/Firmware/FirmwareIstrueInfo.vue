<template>
  <div id="firmwareIstrue">
    <b-row class="mt-2 mb-3">
      <b-col class="inline-center">
        <dl>
          <dt>
            {{ $t('pageFirmwareUpdate.updateFirmware.form.firmwareType') }} :
          </dt>
          <dd>
            {{ confirmInfo.Type || '--' }}
          </dd>
        </dl>
        <dl v-if="PartitionOptions.length > 1">
          <dt class="is-required">
            {{ $t('pageFirmwareUpdate.updateFirmware.form.firmwarePosition') }}
            :
          </dt>
          <dd>
            <b-form-select
              v-model="form.Partition"
              :options="PartitionOptions"
              size="sm"
            ></b-form-select>
          </dd>
        </dl>
        <!-- <dl>
          <dt>
            {{ $t('pageFirmwareUpdate.updateFirmware.form.retainConfig') }} :
          </dt>
          <dd>--</dd>
        </dl> -->
        <!-- <dl>
          <dt>
            {{ $t('pageFirmwareUpdate.updateFirmware.verifyInfo.currentVersionOfImageInUse') }} :
          </dt>
          <dd>--</dd>
        </dl> -->
        <!-- <dl>
          <dt>
            {{ $t('pageFirmwareUpdate.updateFirmware.verifyInfo.currentVersionOfImageToUpdate') }} :
          </dt>
          <dd>--</dd>
        </dl> -->
        <dl>
          <dt>
            {{ $t('pageFirmwareUpdate.updateFirmware.form.progress1') }} :
          </dt>
          <dd>
            <div id="UploadProgress" class="ProgressInline svgbox">
              <b-progress
                :value="progressnum"
                :max="100"
                :animated="progressnum != '100'"
                :class="{ success: progressnum == '100' }"
              ></b-progress>
              <icon-checkmark
                v-if="progressnum == '100'"
                class="ml-2 svg-success"
              />
            </div>
          </dd>
        </dl>
        <!-- <dl>
          <dt>
            {{ $t('pageFirmwareUpdate.updateFirmware.verifyInfo.verificationResult') }} :
          </dt>
          <dd>--</dd>
        </dl> -->
      </b-col>
    </b-row>
    <b-row
      v-if="
        confirmInfo.Type != 'BMC' &&
        confirmInfo.Type != 'BIOS' &&
        confirmInfo.Type != 'PSU'
      "
      class="center-in"
    >
      <b-button
        id="StartUpdate"
        type="submit"
        variant="light"
        class="mr-2"
        :disabled="disablebtn"
        @click="setStep(1)"
      >
        {{ $t('pageFirmwareUpdate.updateFirmware.form.previous') }}
      </b-button>
      <b-button
        id="StartUpdate"
        type="submit"
        variant="primary"
        :disabled="
          disablebtn || (form.Partition == '' && PartitionOptions.length > 1)
        "
        @click="setUpload"
      >
        {{ $t('pageFirmwareUpdate.updateFirmware.form.next') }}
      </b-button>
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
      PartitionOptions: [],
      disablebtn: false,
    };
  },
  computed: {
    upgradeData() {
      return this.$store.getters['firmware/upgradeData'];
    },
    confirmInfo() {
      // console.log("212", this.$store.getters["firmware/confirmInfo"]);
      return this.$store.getters['firmware/confirmInfo'];
    },
    progressnum() {
      return this.$store.getters['firmware/progressnum'];
    },
  },
  watch: {
    progressnum() {
      if (this.progressnum == 100) {
        this.$store.commit('firmware/setUploadstep', 3);
        this.disablebtn = false;
        if (
          this.confirmInfo.Type != 'BMC' &&
          this.confirmInfo.Type != 'BIOS' &&
          this.confirmInfo.Type != 'PSU'
        ) {
          this.infoToast(
            this.$t(
              'pageFirmwareUpdate.updateFirmware.toast.verifyUpdateMessageCPLD'
            ),
            {
              title: this.$t(
                'pageFirmwareUpdate.updateFirmware.toast.verifyUpdate'
              ),
              refreshAction: true,
              noAutoHide: true,
            }
          );
        } else if (this.confirmInfo.Type == 'BIOS') {
          this.infoToast(
            this.$t('pageFirmwareUpdate.updateFirmware.toast.hostReboot'),
            {
              title: this.$t(
                'pageFirmwareUpdate.updateFirmware.toast.verifyUpdate'
              ),
              timestamp: true,
            }
          );
        } else {
          this.infoToast(
            this.$t(
              'pageFirmwareUpdate.updateFirmware.toast.verifyUpdateMessage'
            ),
            {
              title: this.$t(
                'pageFirmwareUpdate.updateFirmware.toast.verifyUpdate'
              ),
              refreshAction: true,
              noAutoHide: true,
            }
          );
        }
      }
    },
  },

  created() {
    // console.log("eeset");
  },
  mounted() {
    this.PartitionOptions = this.initOpt(this.confirmInfo.Type_position);
  },
  methods: {
    setStep(val) {
      this.$store.commit('firmware/setUploadstep', val);
    },
    initOpt(val) {
      let opt = [];
      if (val.length > 1) {
        for (let i = 0; i < val.length; i++) {
          opt.push({
            text: val[i].position,
            value: val[i].position,
            disabled: val[i].exist != 1,
          });
        }
      }
      // if(enab == val.length){
      //     this.disablebtn = true;
      // }
      return opt;
    },
    setUpload() {
      let data = this.$store.getters['firmware/upgradeData'],
        pstn =
          this.PartitionOptions.length == 0 ? '' : '-' + this.form.Partition;
      data.Oem.Public.ImageType = 'cpld' + pstn;

      // console.log("123", data);
      //   return
      this.disablebtn = true;
      this.$store
        .dispatch('firmware/setupload', false)
        .then(() => {
          //     this.infoToast(
          //     this.$t(
          //       'pageFirmwareUpdate.updateFirmware.toast.verifyUpdateMessage'
          //     ),
          //     {
          //       title: this.$t(
          //         'pageFirmwareUpdate.updateFirmware.toast.verifyUpdate'
          //       ),
          //       refreshAction: true,
          //       noAutoHide: true,
          //     }
          //   );

          // console.log("ee12");
          this.getUpgradeProgress();
        })
        .catch((error) => {
          // console.log("ee123", error.message);
          let errtext = this.$t(
            'pageFirmwareUpdate.updateFirmware.toast.erroroccurred'
          );
          // this.disablebtn = false;
          if (error.message == 4000) {
            errtext = this.$t(
              'pageFirmwareUpdate.updateFirmware.toast.errorcpldUpdateFirmware'
            );
          }
          this.errorToast(errtext, {
            noAutoHide: true,
          });
        });
    },
    getUpgradeProgress() {
      this.$store.dispatch('firmware/getFirmwareuplondStatus');
    },
  },
};
</script>
<style lang="scss" scoped>
.center-in {
  display: flex;
  justify-content: center;
  margin-left: -100px;
}
.inline-center {
  dl {
    display: flex;
    align-items: baseline;
    line-height: 30px;
  }
}
.ProgressInline {
  width: 300px;
}
#UploadProgress {
  display: flex;
  .progress {
    width: 300px;
    height: 8px;
    border-radius: 5px;
    margin-top: 5px;
  }
}
dt.is-required::before {
  content: '*';
  color: #ff4d4e;
  margin-right: 3px;
}
</style>
