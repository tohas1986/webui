<template>
  <b-container fluid>
    <b-row class="mb-4">
      <b-col md="12">
        <page-section :section-title="$t('pageKvm.virtualMediaSubTitleFirst')">
          <b-row>
            <b-col
              v-for="(dev, $index) in proxyDevices"
              :key="$index"
              sm="12"
              md="6"
              class="wrapper mb-4"
            >
              <template v-if="dev.id != 'Directory'">
                <div class="section-container">
                  <b-form-group :label="dev.id" class="mb-0 form-vm">
                    <form-file
                      v-if="!dev.isActive"
                      :id="concatId(dev.id)"
                      v-model="dev.file"
                      class=""
                    >
                      <template #invalid>
                        <b-form-invalid-feedback role="alert">
                          {{ $t('global.form.required') }}
                        </b-form-invalid-feedback>
                      </template>
                    </form-file>
                    <div v-if="dev.imageName" class="vm-image-running">
                      <dl>
                        <dd>{{ dev.imageName }}</dd>
                      </dl>
                    </div>
                  </b-form-group>
                </div>
                <b-button
                  v-if="!dev.isActive"
                  variant="primary"
                  class="btn-block"
                  :disabled="!dev.file"
                  @click="startVM(dev)"
                >
                  {{ $t('pageKvm.start') }}
                </b-button>
                <b-button
                  v-if="dev.isActive"
                  variant="primary"
                  class="btn-block"
                  :disabled="!dev.file"
                  @click="stopVM(dev)"
                >
                  {{ $t('pageKvm.stop') }}
                </b-button>
              </template>
              <template v-if="dev.id == 'Directory'">
                <div class="section-container">
                  <b-form-group :label="dev.id" class="mb-0 form-vm">
                    <div class="uploader-wrapper">
                      <div class="uploader-buttons">
                        <button
                          v-if="!dev.isActive"
                          class="add-file-btn btn btn-primary"
                          @click="openFilePicker"
                        >
                          <span class="icon-box">
                            <icon-import />
                          </span>
                          {{ $t('pageKvm.selectFolder') }}
                        </button>
                        <div
                          v-if="files.length && !dev.isActive"
                          class="clear-selected-file px-3 py-2 mb-0"
                        >
                          {{ selectedFolderName }}
                          <button
                            v-if="!dev.isActive"
                            type="button"
                            class="btn btn-link px-2 ml-auto"
                            title="$t('pageRaidManagement.btnClear')"
                            @click="clearFiles"
                          >
                            <icon-close />
                            <span class="sr-only">{{
                              $t('pageRaidManagement.btnClear')
                            }}</span>
                          </button>
                        </div>
                        <div
                          v-if="dev.imageName && dev.isActive"
                          class="vm-image-running"
                        >
                          <dl>
                            <dd>{{ selectedFolderName }}</dd>
                          </dl>
                        </div>
                        <button
                          v-if="files.length && !dev.isActive"
                          class="add-file-btn btn btn-primary"
                          @click="generateFatForDirectory"
                        >
                          <span v-if="!fatBlob">{{
                            $t('pageKvm.createFatImage')
                          }}</span>
                          <span v-else>{{ $t('pageKvm.fatImageReady') }}</span>
                        </button>
                      </div>
                      <ul
                        v-if="files.length && !dev.isActive"
                        class="files-preview"
                        data-simplebar
                      >
                        <li
                          v-for="file in files"
                          :key="file.webkitRelativePath || file.name"
                        >
                          {{ file.name }}
                        </li>
                      </ul>
                    </div>
                  </b-form-group>
                </div>
                <b-button
                  v-if="!dev.isActive"
                  variant="primary"
                  class="btn-block"
                  :disabled="!dev.file && !fatBlob"
                  @click="startVM(dev)"
                >
                  {{ $t('pageKvm.start') }}
                </b-button>
                <b-button
                  v-if="dev.isActive"
                  variant="primary"
                  class="btn-block"
                  :disabled="!dev.file"
                  @click="stopVM(dev)"
                >
                  {{ $t('pageKvm.stop') }}
                </b-button>
              </template>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <b-row v-if="loadImageFromExternalServer" class="mb-4">
      <b-col md="12">
        <page-section :section-title="$t('pageKvm.virtualMediaSubTitleSecond')">
          <b-row>
            <b-col
              v-for="(device, $index) in legacyDevices"
              :key="$index"
              sm="12"
              md="6"
              class="wrapper mb-4"
            >
              <div class="section-container">
                <b-form-group
                  :label="device.id"
                  :label-for="device.id"
                  class="mb-0 form-vm"
                >
                  <b-button
                    variant="primary"
                    :disabled="device.isActive"
                    class="btn-block"
                    @click="configureConnection(device)"
                  >
                    {{ $t('pageKvm.configureConnection') }}
                  </b-button>
                </b-form-group>
              </div>
              <b-button
                v-if="!device.isActive"
                variant="primary"
                class="btn-block"
                :disabled="!device.serverUri"
                @click="startLegacy(device)"
              >
                {{ $t('pageKvm.start') }}
              </b-button>
              <b-button
                v-if="device.isActive"
                variant="primary"
                class="btn-block"
                @click="stopLegacy(device)"
              >
                {{ $t('pageKvm.stop') }}
              </b-button>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <modal-configure-connection
      :connection="modalConfigureConnection"
      @ok="saveConnection"
    />
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import ModalConfigureConnection from './ModalConfigureConnection';
import NbdServer from '@/utilities/NBDServer';
import FormFile from '@/components/Global/FormFile';
import 'simplebar/dist/simplebar.min.css';
import 'simplebar';
import IconClose from '@carbon/icons-vue/es/close/20';
import IconImport from '../../../components/icons/IconImport.vue';
import 'simplebar/dist/simplebar.min.css';
import 'simplebar';
import { generateFat } from '@/utilities/GenerateFat';

export default {
  name: 'VirtualMedia',
  components: {
    PageSection,
    ModalConfigureConnection,
    FormFile,
    IconClose,
    IconImport,
  },
  mixins: [BVToastMixin, LoadingBarMixin],
  data() {
    return {
      modalConfigureConnection: null,
      loadImageFromExternalServer:
        process.env.VUE_APP_VIRTUAL_MEDIA_LIST_ENABLED === 'true'
          ? true
          : false,
      files: [],
      fileTree: null,
      fatBlob: null,
    };
  },
  computed: {
    proxyDevices() {
      return this.$store.getters['virtualMedia/proxyDevices'];
    },
    legacyDevices() {
      return this.$store.getters['virtualMedia/legacyDevices'];
    },
    selectedFolderName() {
      if (!this.files.length) return '';
      const relPath = this.files[0].webkitRelativePath || this.files[0].name;
      return relPath.split('/')[0] || relPath;
    },
  },
  created() {
    this.$store.dispatch('global/getSystemInfo');
    if (this.proxyDevices.length > 0 || this.legacyDevices.length > 0) return;
    this.startLoader();
    this.$store
      .dispatch('virtualMedia/getData')
      .finally(() => this.endLoader());
  },
  methods: {
    startVM(device) {
      if (device.id == 'Directory') {
        device.imageName = this.selectedFolderName;
        device.file = this.fatBlob;
        device.imageName = this.selectedFolderName;
      } else {
        device.imageName = device.file.name;
      }

      let data = {};
      data.ImageName = device.imageName;
      if (device.id == 'Directory') {
        data.MountAsCD = false;
      } else {
        data.MountAsCD = true;
      }
      data.WriteProtected = true;
      this.$store.dispatch('virtualMedia/mountImage', {
        id: device.id,
        data: data,
      });

      const token = this.$store.getters['authentication/token'];
      if (device.nbd) {
        device.nbd.stop();
      }
      if (device.id == 'Directory') {
        device.nbd = new NbdServer(
          `wss://${window.location.host}${device.websocket}`,
          this.fatBlob,
          device.id,
          token,
        );
      } else {
        device.nbd = new NbdServer(
          `wss://${window.location.host}${device.websocket}`,
          device.file,
          device.id,
          token,
        );
      }
      device.nbd.socketStarted = () =>
        this.successToast(this.$t('pageVirtualMedia.toast.serverRunning'));
      device.nbd.errorReadingFile = () =>
        this.errorToast(this.$t('pageVirtualMedia.toast.errorReadingFile'));
      device.nbd.socketClosed = (code) => {
        if (code === 1000) {
          if (device.id == 'Directory') {
            this.fatBlob = null;
          }
          this.successToast(
            this.$t('pageVirtualMedia.toast.serverClosedSuccessfully'),
          );
        } else
          this.errorToast(
            this.$t('pageVirtualMedia.toast.serverClosedWithErrors'),
          );
        device.file = null;
        device.isActive = false;
        device.imageName = '';
      };

      device.nbd.start();
      device.isActive = true;
    },
    stopVM(device) {
      device.nbd.stop();
      if (device.id == 'Directory') {
        this.fatBlob = null;
        this.files = [];
        this.fileTree = null;
      }
    },
    startLegacy(connectionData) {
      var data = {};
      data.Image = connectionData.serverUri;
      data.UserName = connectionData.username;
      data.Password = connectionData.password;
      data.WriteProtected = !connectionData.isRW;
      data.MountAsCD = connectionData.isCD;
      this.startLoader();
      this.$store
        .dispatch('virtualMedia/mountImage', {
          id: connectionData.id,
          data: data,
        })
        .then(() => {
          this.successToast(
            this.$t('pageVirtualMedia.toast.serverConnectionEstablished'),
          );
          connectionData.isActive = true;
        })
        .catch(() => {
          this.errorToast(this.$t('pageVirtualMedia.toast.errorMounting'));
          this.isActive = false;
        })
        .finally(() => this.endLoader());
    },
    stopLegacy(connectionData) {
      this.$store
        .dispatch('virtualMedia/unmountImage', connectionData.id)
        .then(() => {
          this.successToast(
            this.$t('pageVirtualMedia.toast.serverClosedSuccessfully'),
          );
          connectionData.isActive = false;
        })
        .catch(() =>
          this.errorToast(this.$t('pageVirtualMedia.toast.errorUnmounting')),
        )
        .finally(() => this.endLoader());
    },
    saveConnection(connectionData) {
      this.modalConfigureConnection.serverUri = connectionData.serverUri;
      this.modalConfigureConnection.username = connectionData.username;
      this.modalConfigureConnection.password = connectionData.password;
      this.modalConfigureConnection.isRW = connectionData.isRW;
      this.modalConfigureConnection.isCD = connectionData.isCD;
    },
    configureConnection(connectionData) {
      this.modalConfigureConnection = connectionData;
      this.$bvModal.show('configure-connection');
    },
    concatId(val) {
      return val.split(' ').join('_').toLowerCase();
    },
    async openFilePicker() {
      this.files = [];
      const { directoryOpen } = await import('browser-fs-access');
      try {
        const files = await directoryOpen({ recursive: true });
        const totalSize = files.reduce((sum, f) => sum + f.size, 0);
        const maxDirectorySize = 1.5 * 1024 * 1024 * 1024;
        if (totalSize > maxDirectorySize) {
          console.error(this.$t('pageKvm.toast.directorySizeExceeded'));
          return;
        }
        this.files = files;
        this.fileTree = this.buildTreeFromFiles(files);
        this.fatBlob = null;
      } catch (error) {
        console.error(error);
      }
    },
    buildTreeFromFiles(files) {
      const root = { name: '/', kind: 'directory', children: [] };
      for (const file of files) {
        const relPath =
          file._relativePath || file.webkitRelativePath || file.name;
        const parts = relPath.split('/').filter(Boolean);
        let current = root;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (i === parts.length - 1) {
            current.children.push({
              name: part,
              kind: 'file',
              file,
            });
          } else {
            let dir = current.children.find(
              (c) => c.kind === 'directory' && c.name === part,
            );
            if (!dir) {
              dir = { name: part, kind: 'directory', children: [] };
              current.children.push(dir);
            }
            current = dir;
          }
        }
      }
      return root;
    },
    async generateFatForDirectory() {
      this.fatBlob = await generateFat(this.fileTree);
    },
    clearFiles() {
      this.files = [];
      this.fileTree = null;
      this.fatBlob = null;
    },
  },
};
</script>

<style lang="scss">
.vm-image-running {
  padding: clamp(0.5rem, -0.0119rem + 0.6349vw, 0.75rem)
    clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  border-radius: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  background-color: rgba($success-color, 0.1);
}
.wrapper:not(:last-child) {
  @include media-breakpoint-down(sm) {
    margin-bottom: 1rem;
  }
}

.uploader-wrapper {
  display: flex;
  align-items: flex-start;
}

.uploader-buttons {
  display: grid;
  gap: 1rem;
  button {
    max-height: 52px;
  }
}

.files-preview {
  list-style-type: none;
  border: 1px solid #c8c9ca;
  border-radius: 20px;
  max-height: 300px;
  flex: 1;
  overflow-y: scroll;
  margin-left: 2rem;
  padding: 1rem;
  box-sizing: border-box;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.icon-box {
  margin-right: clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem);
}

.uploader-wrapper .add-file-btn {
  min-height: 52px;
  position: relative;
  width: 100%;
  max-width: 222px;
  padding: clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem)
    clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem)
    clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem)
    clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem);
  font-size: clamp(0.875rem, 0.3631rem + 0.6349vw, 1.125rem);
  background-color: $btn-background;
  border-radius: 20px;
  color: #272b32;
  margin-bottom: 0;

  &:hover {
    background-color: $main-color;
    color: $white;
  }

  &.disabled {
    border-color: gray('400');
    background-color: gray('400');
    color: gray('600');
    box-shadow: none !important;
  }
}

.clear-selected-file {
  display: flex;
  align-items: center;
  background-color: theme-color('light');
  border-radius: 15px;
  font-size: clamp(0.875rem, 0.3631rem + 0.6349vw, 1.125rem);
  margin-bottom: 10px;
  margin-top: -5px;
  .btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;

    &:focus {
      box-shadow: inset 0 0 0 2px theme-color('primary');
    }
  }
}
</style>
