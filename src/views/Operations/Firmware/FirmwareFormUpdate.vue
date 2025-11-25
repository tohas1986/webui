<template>
  <div id="firmwareUpdate">
    <div class="p-3">
      <b-form inline @submit.prevent="onSubmitUpload">
        <!-- <b-form-group
          v-if="isTftpUploadAvailable"
          :label="$t('pageFirmwareUpdate.updateFirmware.form.updateFirmware.fileSource')"
          :disabled="isPageDisabled" label-align="right"
        >
          <b-form-radio v-model="isWorkstationSelected" :value="true">
            {{ $t('pageFirmwareUpdate.updateFirmware.form.updateFirmware.workstation') }}
          </b-form-radio>
          <b-form-radio v-model="isWorkstationSelected" :value="false">
            {{ $t('pageFirmwareUpdate.updateFirmware.form.updateFirmware.tftpServer') }}
          </b-form-radio>
        </b-form-group> -->
        <b-form-group
          :label="$t('pageFirmwareUpdate.updateFirmware.form.firmwareType')"
          label-for="FirmwareType-select"
          label-align="right"
        >
          <b-form-select
            id="FirmwareType-select"
            v-model="form.selectedFiletypeIndex"
            size="sm"
            :options="filetypeSelectOptions"
            class="mb-0 thisSelect"
          >
          </b-form-select>
        </b-form-group>

        <!-- <b-form-group label="Upgrade Partition" label-for="Partition-select" label-align="right" >
            <b-form-radio-group id="Partition-select" v-model="form.Partition">
                <b-form-radio name="Partition" :value="1">Primary Partition</b-form-radio>
                <b-form-radio name="Partition" :value="0">Backup Partition</b-form-radio>
            </b-form-radio-group>
        </b-form-group> -->

        <b-form-group
          v-show="
            form.selectedFiletypeIndex == 'BMC' ||
            form.selectedFiletypeIndex == 'bios'
          "
          :label="$t('pageFirmwareUpdate.updateFirmware.form.retainConfig')"
          label-for="Retain-Config"
          label-align="right"
        >
          <b-form-radio-group id="Retain-Config" v-model="form.RetainConfig">
            <b-form-radio name="Retain-Config" :value="false">{{
              $t('pageFirmwareUpdate.updateFirmware.form.yes')
            }}</b-form-radio>
            <b-form-radio name="Retain-Config" :value="true">{{
              $t('pageFirmwareUpdate.updateFirmware.form.no')
            }}</b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <b-form-group
          v-show="form.selectedFiletypeIndex == 'psu'"
          :label="$t('pageFirmwareUpdate.updateFirmware.form.selectpsu')"
          label-for="PowerPot"
          label-align="right"
          class="is-required"
        >
          <b-form-checkbox-group
            v-show="powerPst.MaxPsuNumber != null"
            id="PowerPot"
            v-model="form.Selectedpower"
            name="Power-Pot"
            :disabled="powerPst.PsuPresentNumber == 1"
          >
            <b-form-checkbox
              v-for="(id, idx) in getPSUonbit"
              :key="idx"
              :value="id"
            >
              {{ $t('pagePowerSupply.serverPowerOperations.power') }} {{ id }}
            </b-form-checkbox>
            <template>
              <i
                v-show="
                  powerPst.PsuPresentNumber > 1 &&
                  form.Selectedpower.length == 0
                "
                class="inii"
                >{{
                  $t(
                    'pageFirmwareUpdate.updateFirmware.verifyInfo.psuselectnone'
                  )
                }}</i
              >
              <i v-show="powerPst.PsuPresentNumber == 1" class="inii">
                {{
                  $t('pageFirmwareUpdate.updateFirmware.verifyInfo.psuonlyone')
                }}</i
              >
              <i v-show="powerPst.PsuPresentNumber < 1" class="inii">
                {{
                  $t('pageFirmwareUpdate.updateFirmware.verifyInfo.psuerror')
                }}</i
              >
            </template>
          </b-form-checkbox-group>
        </b-form-group>
        <div role="group" class="form-group is-required">
          <label for="image-file" class="d-block text-right" @click.prevent>{{
            $t('pageFirmwareUpdate.updateFirmware.form.firmwareImage')
          }}</label>
          <form-file
            id="image-file"
            v-model="file"
            :disabled="isPageDisabled || disablenextbtn"
            :is-secondary="true"
            :state="getValidationState($v.file)"
            aria-describedby="image-file-help-block"
            @input="$v.file.$touch()"
          >
            <template #invalid>
              <b-form-invalid-feedback role="alert">
                {{ $t('global.form.required') }}
              </b-form-invalid-feedback>
            </template>
          </form-file>
        </div>

        <!-- <b-form-group label="Action After Firmware Upgrade" label-for="ResetBmc" label-align="right" >
            <b-form-radio-group id="ResetBmc" name="Reset-Bmc" v-model="form.ResetBmc">
                <b-form-radio :value="1">Yes</b-form-radio>
                <b-form-radio :value="0">No</b-form-radio>
            </b-form-radio-group>
        </b-form-group> -->

        <b-form-group
          :label="$t('pageFirmwareUpdate.updateFirmware.form.progress')"
          label-for="UploadProgress"
          label-align="right"
        >
          <div id="UploadProgress" class="ProgressInline svgbox">
            <b-progress
              :value="uplondProgress"
              :max="100"
              :animated="uplondProgress != '100'"
              :class="{ success: uplondProgress == '100' }"
            ></b-progress>
            <icon-checkmark
              v-if="uplondProgress == '100'"
              class="ml-2 svg-success"
            />
          </div>
        </b-form-group>
        <div class="center-in mt-4">
          <b-btn
            id="StartUpdate"
            type="submit"
            variant="primary"
            :disabled="isPageDisabled || disablenextbtn"
          >
            {{ $t('pageFirmwareUpdate.updateFirmware.form.next') }}
          </b-btn>
        </div>
      </b-form>
    </div>
    <!-- Modals -->
    <modal-update-firmware @ok="updateFirmware" />
  </div>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

import FormFile from '@/components/Global/FormFile';
import ModalUpdateFirmware from './FirmwareModalUpdateFirmware';
import IconCheckmark from '@carbon/icons-vue/es/checkmark--filled/16';

export default {
  components: { FormFile, ModalUpdateFirmware, IconCheckmark },
  mixins: [BVToastMixin, LoadingBarMixin, VuelidateMixin],
  props: {
    isPageDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
    isServerOff: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      aa: 10,
      loading,
      isWorkstationSelected: true,
      file: null,
      tftpFileAddress: null,
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
      filetypeSelectOptions: [
        { value: 'BMC', text: 'BMC' },
        { value: 'bios', text: 'BIOS' },
        { value: 'cpld', text: 'CPLD' },
        // { value: 'psu', text: 'PSU' },
      ],
      form: {
        selectedFiletypeIndex: 'BMC',
        Partition: '',
        ResetBmc: '',
        RetainConfig: false,
        Selectedpower: [],
      },
      Selectedpower: [],
      progressNum: 0,
      timein: null,
      disablenextbtn: false,
      // psuMap: [],
      //   powerModeSettinginfo: null
    };
  },
  computed: {
    isTftpUploadAvailable() {
      return this.$store.getters['firmware/isTftpUploadAvailable'];
    },
    progressError() {
      return this.$store.getters['firmware/progressError'];
    },
    userRole() {
      return this.$store.getters['global/userRole'];
    },
    uplondProgress() {
      // console.log("PP",this.$store.getters['firmware/uplondProgress'])
      return this.$store.getters['firmware/uplondProgress'];
    },
    powerPst() {
      return this.$store.getters['firmware/powerPst'];
    },
    getPSUonbit() {
      const psuMap = [];
      let mask = 0x00;
      for (let i = 0; i < this.powerPst?.MaxPsuNumber; i++) {
        mask = 1 << i;
        if (mask & this.powerPst?.PsuPresentMap) {
          psuMap.push(mask & this.powerPst?.PsuPresentMap);
        }
      }
      return psuMap;
    },
  },
  watch: {
    isWorkstationSelected: function () {
      this.$v.$reset();
      this.file = null;
      this.tftpFileAddress = null;
    },

    progressError() {
      if (this.progressError == true) {
        this.errorToast(
          this.$t('pageFirmwareUpdate.updateFirmware.toast.erroroccurred'),
          {
            noAutoHide: true,
          }
        );
        this.$store.commit('firmware/progressError', false);
      }
    },
  },
  validations() {
    return {
      file: {
        required: requiredIf(function () {
          return this.isWorkstationSelected;
        }),
      },
      tftpFileAddress: {
        required: requiredIf(function () {
          return !this.isWorkstationSelected;
        }),
      },
    };
  },
  created() {
    this.startLoader();
    this.$store.commit('firmware/setUplondProgress', 0);
    this.$store
      .dispatch('firmware/getUpdateServiceSettings')
      .then(() => {
        this.$store.commit('firmware/setprogressnum', 0);
      })
      .finally(() => this.endLoader());
  },

  methods: {
    updateFirmware() {
      //   console.log("ee1",this.$store.getters['global/getUploadstep'])
      //   this.$store.commit('firmware/setUploadstep',2)
      //   return

      this.startLoader();
      this.$store.commit('firmware/setprogressnum', 0);
      this.disablenextbtn = true;

      let timeout = 360000;
      if (this.form.selectedFiletypeIndex == 'bios') {
        timeout = 1000 * 60 * 5.5;
      } else if (this.form.selectedFiletypeIndex == 'cpld') {
        timeout = 1000 * 30;
      }

      const timerId = setTimeout(() => {
        // //   if(this.form.selectedFiletypeIndex != "cpld"){
        //         this.infoToast(this.$t('pageFirmwareUpdate.updateFirmware.toast.verifyUpdateMessage'), {
        //             title: this.$t('pageFirmwareUpdate.updateFirmware.toast.verifyUpdate'),
        //             refreshAction: true,
        //         });
        // //   }
        this.endLoader();
      }, timeout);

      this.$store.dispatch('firmware/getFirmwareTask').then((res) => {
        if (res == true) {
          this.infoToast(
            this.$t(
              'pageFirmwareUpdate.updateFirmware.toast.updateStartedMessage'
            ),
            {
              title: this.$t(
                'pageFirmwareUpdate.updateFirmware.toast.updateStarted'
              ),
              timestamp: true,
              noAutoHide: true,
            }
          );
          if (this.isWorkstationSelected) {
            this.dispatchWorkstationUpload(timerId);
          } else {
            this.dispatchTftpUpload(timerId);
          }
        } else {
          this.disablenextbtn = false;
          this.endLoader();
          clearTimeout(timerId);
          this.errorToast(
            this.$t('pageFirmwareUpdate.updateFirmware.toast.updatataskison'),
            {
              noAutoHide: true,
            }
          );
        }
      });
    },

    dispatchWorkstationUpload(timerId) {
      let obj = this;
      let firmwareurl = 'firmware/uploadOtherFirmware';
      let updatatype = this.form.selectedFiletypeIndex;
      // console.log("ee11",updatatype)
      let fw = obj.file.name.split('.').pop();
      const black = () => {
        setTimeout(() => {
          this.disablenextbtn = false;
          obj.endLoader();
          clearTimeout(timerId);
        }, 1000);
      };
      let setdata = {
        image: this.file,
        type: updatatype,
      };
      if (updatatype == 'cpld') {
        setdata['seconddata'] = {
          Oem: {
            Public: {
              ImageType: 'cpld',
            },
          },
        };
      } else if (
        updatatype == 'BMC' ||
        updatatype == 'bios' ||
        updatatype == 'psu'
      ) {
        firmwareurl = 'firmware/uploadFirmware';
        if (!(fw == 'bin')) {
          black();
          return;
        }
        setdata['fristdata'] = {
          Oem: {
            ApplyOptions: {
              ClearConfig: this.form.RetainConfig,
            },
          },
        };
        setdata['seconddata'] = {
          Oem: {
            Public: {
              ImageType: 'bios',
            },
          },
        };
        if (updatatype == 'BMC') {
          setdata['seconddata'] = {
            Oem: {
              Public: {
                ImageType: 'bmc',
              },
            },
          };
        }
        // console.log("ee",this.form.Selectedpower)
        if (updatatype == 'psu') {
          setdata['fristdata'] = {
            PsuUpdConfig: {
              UpdateMap: this.getPSUbit(this.form.Selectedpower),
            },
          };
          setdata['seconddata'] = {
            Oem: {
              Public: {
                ImageType: 'psu',
              },
            },
          };
        }
      }
      this.$store.commit('firmware/setConfirmInfo', {
        Type: updatatype.toUpperCase(),
      });
      // console.log("ee2453",updatatype)
      // return
      this.$store
        .dispatch(firmwareurl, setdata)
        .then(() => {
          // console.log("ee",updatatype)
          this.$store.commit('firmware/confirmInfo', {
            Type: updatatype.toUpperCase(),
          });
          this.$store.commit('firmware/setUploadstep', 2);
          this.endLoader();
        })
        .catch(({ message }) => {
          // console.log("p1212",this.$store.getters['firmware/confirmInfo'])
          this.disablenextbtn = false;
          this.endLoader();
          this.errorToast(message, {
            noAutoHide: true,
          });
          clearTimeout(timerId);
        });
    },

    dispatchTftpUpload(timerId) {
      this.$store
        .dispatch('firmware/uploadFirmwareTFTP', this.tftpFileAddress)
        .catch(({ message }) => {
          this.endLoader();
          this.errorToast(message, {
            noAutoHide: true,
          });
          clearTimeout(timerId);
        });
    },
    onSubmitUpload() {
      // console.log(this.getPSUbit(this.form.Selectedpower))
      // return

      this.$v.$touch();
      if (this.$v.$invalid) return;
      if (
        this.form.selectedFiletypeIndex == 'psu' &&
        this.form.Selectedpower.length < 1
      )
        return;
      if (this.userRole == 'ReadOnly') {
        this.errorToast(
          this.$t(
            'pageFirmwareUpdate.updateFirmware.alert.insufficientprivilege'
          ),
          {
            noAutoHide: true,
          }
        );
        return;
      }
      let text = this.$tc(
        'pageFirmwareUpdate.updateFirmware.modal.updateBMCFirmwareInfoDefault'
      );
      if (this.form.selectedFiletypeIndex == 'BMC') {
        text = this.$tc(
          'pageFirmwareUpdate.updateFirmware.modal.updateBMCFirmwareInfoDefault'
        );
      } else if (this.form.selectedFiletypeIndex == 'bios') {
        text = this.$tc(
          'pageFirmwareUpdate.updateFirmware.modal.updateBIOSFirmwareInfoDefault'
        );
      } else if (this.form.selectedFiletypeIndex == 'cpld') {
        text = this.$tc(
          'pageFirmwareUpdate.updateFirmware.modal.updateCPLDFirmwareInfoDefault'
        );
      } else if (this.form.selectedFiletypeIndex == 'psu') {
        text = this.$tc(
          'pageFirmwareUpdate.updateFirmware.modal.updatePSUFirmwareInfoDefault'
        );
      }
      this.$bvModal
        .msgBoxConfirm(text, {
          title: this.$tc(
            'pageFirmwareUpdate.updateFirmware.sectionTitleUpdateFirmware'
          ),
          okTitle: this.$t(
            'pageFirmwareUpdate.updateFirmware.form.startUpdate'
          ),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((deleteConfirmed) => {
          if (deleteConfirmed) this.updateFirmware();
        });
      return;
      // this.$bvModal.show("modal-update-firmware");
    },
    getPSUbit(arrnum) {
      // console.log("444",arrnum)
      let num = 0x00,
        numi = 0x00;
      for (let i = 0; i < arrnum.length; i++) {
        numi = 1 << (arrnum[i] - 1);
        // console.log(numi,num)
        num = num | numi;
      }
      // console.log(num.toString(2).padStart(8, '0'))
      // console.log(num)
      return num;
    },
  },
};
</script>
<style lang="scss">
#firmwareUpdate {
  .form-inline {
    display: block;
    #FirmwareType-select {
      width: 160px;
    }
    .form-group {
      height: 50px;
    }
    .d-block {
      width: 48%;
      padding-right: 30px;
      // box-sizing: border-box;
      &::after {
        content: ' :';
      }
    }
  }
  .success.progress {
    .progress-bar {
      background-color: $success;
    }
  }
  .center-in {
    display: flex;
    justify-content: center;
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
  .inii,
  i {
    font-style: normal;
    font-size: 0.875rem;
    color: $red-500;
  }
}
</style>
