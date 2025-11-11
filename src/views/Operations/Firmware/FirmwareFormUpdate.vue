<template>
  <b-row>
    <b-alert
      v-if="fileType === '2'"
      :show="dismissCountDown"
      variant="warning"
      @dismissed="dismissCountDown = 0"
      @dismiss-count-down="countDownChanged"
    >
      <p>
        {{ $t('pageFirmware.form.updateFirmware.firmwareUp') }}
      </p>
      <p>Until completion {{ convertSeconds(dismissCountDown) }} minutes...</p>
      <b-progress
        :max="dismissSecs"
        :value="dismissCountDown"
        height="6px"
        animated
      ></b-progress>
    </b-alert>

    <b-col sm="12" md="6">
      <b-form class="form-firmware" @submit.prevent="onSubmitUpload">
        <div class="section-container">
          <div class="form-firmware-group">
            <b-form-group
              v-if="isTftpUploadAvailable"
              :label="$t('pageFirmware.form.updateFirmware.fileSource')"
              :disabled="isPageDisabled"
            >
              <b-form-radio v-model="isWorkstationSelected" :value="true">
                {{ $t('pageFirmware.form.updateFirmware.workstation') }}
              </b-form-radio>
              <b-form-radio v-model="isWorkstationSelected" :value="false">
                {{ $t('pageFirmware.form.updateFirmware.tftpServer') }}
              </b-form-radio>
            </b-form-group>

            <!-- Workstation Upload -->
            <template v-if="isWorkstationSelected">
              <b-btn
                variant="secondary"
                class="add-file-btn"
                @click="openModalToUploadImage"
              >
                {{ $t('pageFirmware.form.updateFirmware.uploadFile') }}
                <icon-add />
              </b-btn>
              <b-modal id="modal-update-image" size="lg" centered>
                <template #modal-title>
                  {{ $t('pageFirmware.modal.updateTitle') }}
                </template>
                <b-form-group>
                  <b-row class="mb-3">
                    <b-col sm="5">
                      <label for="firmware-type">
                        {{ $t('pageFirmware.form.updateFirmware.imageType') }}
                      </label>
                    </b-col>
                    <b-col sm="7">
                      <b-form-group>
                        <b-select
                          id=""
                          v-model="fileType"
                          :options="optionsTypesFile"
                        >
                          <template #first>
                            <b-form-select-option :value="null" disabled>
                              {{ $t('global.form.selectAnOption') }}
                            </b-form-select-option>
                          </template>
                        </b-select>
                        <b-form-invalid-feedback
                          role="alert"
                          :state="isValidForm"
                        >
                          {{ $t('global.form.required') }}
                        </b-form-invalid-feedback>
                      </b-form-group>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col sm="5">
                      <label label-for="image-file">
                        {{ $t('pageFirmware.form.updateFirmware.imageFile') }}
                      </label>
                    </b-col>
                    <b-col sm="7">
                      <b-form-group>
                        <form-file
                          id="image-file"
                          :disabled="isPageDisabled"
                          :state="getValidationState($v.file)"
                          class="btn-mt"
                          aria-describedby="image-file-help-block"
                          @input="onFileUpload($event)"
                        >
                          <template #invalid>
                            <b-form-invalid-feedback role="alert">
                              {{ $t('global.form.required') }}
                            </b-form-invalid-feedback>
                          </template>
                        </form-file>
                      </b-form-group>
                    </b-col>
                  </b-row>
                </b-form-group>
                <template #modal-footer>
                  <b-btn
                    size="sm"
                    variant="primary"
                    type="submit"
                    @click="onSubmitUpload"
                  >
                    {{ $t('pageFirmware.form.updateFirmware.startUpdate') }}
                  </b-btn>
                  <b-btn
                    size="sm"
                    class="me-2 btn-mt"
                    data-test-id="firmware-button-startUpdate"
                    type="button"
                    :disabled="isPageDisabled"
                    @click="$bvModal.hide('modal-update-image')"
                  >
                    {{ $t('global.form.cancel') }}
                  </b-btn>
                </template>
              </b-modal>
            </template>

            <!-- TFTP Server Upload -->
            <template v-else>
              <b-form-group
                :label="$t('pageFirmware.form.updateFirmware.fileAddress')"
                label-for="tftp-address"
                class="mb-0"
              >
                <b-form-input
                  id="tftp-address"
                  v-model="tftpFileAddress"
                  type="text"
                  :state="getValidationState($v.tftpFileAddress)"
                  :disabled="isPageDisabled"
                  @input="$v.tftpFileAddress.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  {{ $t('global.form.fieldRequired') }}
                </b-form-invalid-feedback>
              </b-form-group>
            </template>
          </div>
        </div>
        <b-btn
          v-if="!isWorkstationSelected"
          data-test-id="firmware-button-startUpdate"
          type="submit"
          variant="primary"
          class="btn-mt"
          :disabled="isPageDisabled"
        >
          {{ $t('pageFirmware.form.updateFirmware.startUpdate') }}
        </b-btn>
      </b-form>
    </b-col>

    <!-- Modals -->
    <modal-update-firmware :is-bmc="fileType === '2'" @ok="updateFirmware" />

    <transition name="fade">
      <div v-if="updateFirmwareOverlay" class="nav-overlay"></div>
    </transition>
  </b-row>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

import FormFile from '@/components/Global/FormFile';
import ModalUpdateFirmware from './FirmwareModalUpdateFirmware';
import IconAdd from '@/components/icons/IconAdd';

export default {
  components: { FormFile, ModalUpdateFirmware, IconAdd },
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
      dismissSecs: 300,
      dismissCountDown: 0,
      loading,
      isWorkstationSelected: true,
      updateFirmwareOverlay: false,
      file: null,
      tftpFileAddress: null,
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
      optionsTypesFile: [
        { value: '1', text: 'PLDM Image' },
        { value: '2', text: 'BMC Image' },
      ],
      fileType: null,
      isValidForm: true,
    };
  },
  computed: {
    isTftpUploadAvailable() {
      return this.$store.getters['firmware/isTftpUploadAvailable'];
    },
  },
  watch: {
    isWorkstationSelected: function () {
      this.$v.$reset();
      this.file = null;
      this.tftpFileAddress = null;
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
    this.$store.dispatch('firmware/getUpdateServiceSettings');
  },
  methods: {
    updateFirmware() {
      if (this.fileType == '2') {
        this.updateFirmwareOverlay = true;
      }
      this.dismissCountDown = this.dismissSecs;
      const timerId = setTimeout(() => {
        this.infoToast(this.$t('pageFirmware.toast.verifyUpdateMessage'), {
          title: this.$t('pageFirmware.toast.verifyUpdate'),
          refreshAction: true,
        });
        this.updateFirmwareOverlay = false;
      }, 305000);
      this.infoToast(this.$t('pageFirmware.toast.updateStartedMessage'), {
        title: this.$t('pageFirmware.toast.updateStarted'),
        timestamp: true,
      });
      if (this.isWorkstationSelected) {
        this.dispatchWorkstationUpload(timerId);
      } else {
        this.dispatchTftpUpload(timerId);
      }
    },
    dispatchWorkstationUpload(timerId) {
      this.$store
        .dispatch('firmware/uploadFirmware', this.file)
        .catch(({ message }) => {
          this.endLoader();
          this.errorToast(message);
          clearTimeout(timerId);
        });
    },
    dispatchTftpUpload(timerId) {
      this.$store
        .dispatch('firmware/uploadFirmwareTFTP', this.tftpFileAddress)
        .catch(({ message }) => {
          this.endLoader();
          this.errorToast(message);
          clearTimeout(timerId);
        });
    },
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    convertSeconds(sec) {
      let date = new Date(1970, 0, 0, 0, 0, +sec || 0);
      let time = date.toLocaleTimeString('ru');

      return time;
    },
    onSubmitUpload() {
      this.$v.$touch();
      if (this.$v.$invalid || this.fileType === null) {
        this.isValidForm = false;
        return;
      }
      this.isValidForm = true;
      this.$bvModal.hide('modal-update-image');
      this.$bvModal.show('modal-update-firmware');
    },
    openModalToUploadImage(event) {
      event.preventDefault();
      this.$bvModal.show('modal-update-image');
    },
    onFileUpload(file) {
      this.file = file;
      this.$v.file.$touch();
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $zindex-fixed + 1;
  background-color: $black;
  opacity: 0.5;
}

.alert {
  position: fixed;
  top: 35%;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 800px;
  display: block;
  margin: 1.75rem auto;
  padding: clamp(1.625rem, -0.1667rem + 2.2222vw, 2.5rem);
  background-color: $white;
  color: $main-color;
  z-index: $zindex-fixed + 2;
  border-color: $main-color;

  .progress .progress-bar {
    background-color: $purple !important;
  }
}

.add-file-btn {
  padding: clamp(0.625rem, 0.1131rem + 0.6349vw, 0.875rem)
    clamp(1rem, -0.0238rem + 1.2698vw, 1.5rem);

  svg {
    margin-left: 1.25rem;
    margin-right: 0;
  }
}
.btn-open-modal {
  font-size: clamp(0.875rem, 0.3631rem + 0.6349vw, 1.125rem);
}

.col-sm-7 .form-group {
  @include media-breakpoint-down(sm) {
    margin-bottom: 0 !important;
  }
}
</style>
