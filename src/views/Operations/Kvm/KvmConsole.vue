<template>
  <div :class="marginClass">
    <div ref="toolbar" class="kvm-toolbar">
      <b-row class="justify-content-start m-0">
        <b-col class="d-flex flex-column justify-content-end" cols="2">
          <dl class="mb-2" sm="2" md="2">
            <dt class="d-inline mr-1">{{ $t('pageKvm.status') }}</dt>
            <dd class="d-inline">
              <status-color :status="serverStatusColor" />
              <span class="d-none d-md-inline ml-1"> {{ serverStatus }}</span>
            </dd>
          </dl>
        </b-col>
        <b-col class="d-flex justify-content-end p-0 flex-wrap ml-2">
          <b-button
            v-if="sessionsReady && !userHasControl"
            variant="link"
            type="button"
            :disabled="controlRequested"
            @click="requestControl"
          >
            <span>{{ $t('pageKvm.requestControl') }}</span>
          </b-button>
          <b-dropdown variant="link">
            <template #button-content>
              <span>
                {{ $t('pageKvm.users') }}
                <b-badge>{{ kvmUsers.length }}</b-badge></span
              >
            </template>
            <b-dropdown-item v-for="user in kvmUsers" :key="user.sessionID">
              {{ user.username }}
              <small class="ml-1">({{ user.ipAddress }})</small>
              <template v-if="user.isCurrent">
                <b-badge
                  :variant="controlEnabled ? 'success' : 'secondary'"
                  class="ml-2"
                >
                  {{
                    controlEnabled
                      ? $t('pageKvm.controlOwner')
                      : $t('pageKvm.controlObserver')
                  }}
                </b-badge>
              </template>
            </b-dropdown-item>
          </b-dropdown>
          <b-dropdown variant="link">
            <template #button-content>
              <span> {{ $t('pageKvm.power') }}</span>
            </template>
            <template v-if="serverPower === 'off'">
              <b-dropdown-item @click="powerOn">
                {{ $t('pageKvm.powerOn') }}</b-dropdown-item
              >
            </template>
            <template v-else>
              <b-dropdown-item @click="powerOff">{{
                $t('pageKvm.powerOff')
              }}</b-dropdown-item>
              <b-dropdown-item @click="rebootServer">{{
                $t('pageKvm.rebootServer')
              }}</b-dropdown-item>
            </template>
          </b-dropdown>
          <b-dropdown v-if="isConnected" variant="link">
            <template #button-content
              ><span> {{ $t('pageKvm.sendKeys') }}</span></template
            >
            <b-dropdown-item @click="sendCtrlAltDel">
              {{ $t('pageKvm.buttonCtrlAltDelete') }}
            </b-dropdown-item>
            <b-dropdown-item @click="sendF1">{{
              $t('pageKvm.buttonF1')
            }}</b-dropdown-item>
            <b-dropdown-item @click="sendF2">{{
              $t('pageKvm.buttonF2')
            }}</b-dropdown-item>
            <b-dropdown-item @click="sendF3">{{
              $t('pageKvm.buttonF3')
            }}</b-dropdown-item>
            <b-dropdown-item @click="sendAltLeft">{{
              $t('pageKvm.buttonAltLeft')
            }}</b-dropdown-item>
            <b-dropdown-item @click="sendCtrlLeft">{{
              $t('pageKvm.buttonCtrlLeft')
            }}</b-dropdown-item>
            <b-dropdown-item @click="sendMetaLeft">{{
              $t('pageKvm.buttonWindowsKeyLeft')
            }}</b-dropdown-item>
            <b-dropdown-item @click="sendAltRight">{{
              $t('pageKvm.buttonAltRight')
            }}</b-dropdown-item>
            <b-dropdown-item @click="sendCtrlRight">{{
              $t('pageKvm.buttonCtrlRight')
            }}</b-dropdown-item>
            <b-dropdown-item @click="sendMetaRight">{{
              $t('pageKvm.buttonWindowsKeyRight')
            }}</b-dropdown-item>
            <b-dropdown-item @click="sendMenu">{{
              $t('pageKvm.buttonMenu')
            }}</b-dropdown-item>
            <b-dropdown-item @click="sendPrintSc">{{
              $t('pageKvm.buttonPrint')
            }}</b-dropdown-item>
          </b-dropdown>

          <b-button
            v-if="!isFullWindow"
            variant="link"
            type="button"
            @click="openConsoleWindow()"
          >
            <span>
              {{ $t('pageKvm.openNewTab') }}
            </span>
            <icon-launch class="ml-1" />
          </b-button>

          <b-button
            v-if="isConnected"
            variant="link"
            type="button"
            @click="toggleRecording"
          >
            <span v-if="!isRecording">{{ $t('pageKvm.startRecording') }}</span>
            <span v-else>{{ $t('pageKvm.stopRecording') }}</span>
            <span class="recording-icon" :class="{ blinking: isRecording }">
              <icon-record class="ml-1" />
            </span>
          </b-button>
        </b-col>
      </b-row>
    </div>
    <div id="terminal-kvm" ref="panel" :class="terminalClass"></div>
  </div>
</template>

<script>
import RFB from '@novnc/novnc/core/rfb';
import StatusColor from '@/components/Global/StatusColor';
import IconLaunch from '@carbon/icons-vue/es/launch/20';
import IconRecord from '@carbon/icons-vue/es/video/20';
import { throttle } from 'lodash';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { mapGetters, mapActions } from 'vuex';

const Connecting = 0;
const Connected = 1;
const Disconnected = 2;
const keyAlt = 0xffe9;

export default {
  name: 'KvmConsole',
  components: { StatusColor, IconLaunch, IconRecord },
  mixins: [BVToastMixin],
  props: {
    isFullWindow: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      rfb: null,
      isConnected: false,
      terminalClass: this.isFullWindow ? 'full-window' : '',
      marginClass: this.isFullWindow ? 'margin-left-full-window' : '',
      status: Connecting,
      resizeKvmWindow: null,
      isRecording: false,
      mediaRecorder: null,
      recordedChunks: [],
      sessionPollingInterval: null,
      refreshIntervalId: null,
      websocket: null,
      controlRequested: false,
      awaitingControl: false,
      hasControlFlag: false,
      kvmSessionsObj: {},
      currentKvmSessionId: null,
      controlEnabled: false,
      sessionsReady: false,
      isTransferModalOpen: false,
      lastControlAskedSessionId: null,
      wasControlAskedProcessed: false,
    };
  },
  computed: {
    ...mapGetters('sessions', ['allConnections', 'getKvmSessionId']),
    kvmSessions() {
      return Object.values(this.kvmSessionsObj).sort((a, b) => {
        if (a.Control && !b.Control) return -1;
        if (!a.Control && b.Control) return 1;
        return 0;
      });
    },
    userHasControl() {
      return this.controlEnabled === true;
    },
    kvmUsers() {
      return this.allConnections
        .filter((conn) => conn.sessionType === 'KVMIP')
        .map((conn) => {
          const session = this.kvmSessionsObj[conn.sessionID] || {};
          return {
            ...conn,
            Control: !!session.Control,
            isCurrent: conn.sessionID === this.currentKvmSessionId,
          };
        })
        .sort((a, b) => {
          // Управляющие сверху, потом наблюдатели
          if (a.Control && !b.Control) return -1;
          if (!a.Control && b.Control) return 1;
          return 0;
        });
    },
    serverStatusColor() {
      if (this.status === Connected) {
        return 'success';
      } else if (this.status === Disconnected) {
        return 'danger';
      }
      return 'secondary';
    },
    serverStatus() {
      if (this.status === Connected) {
        return this.$t('pageKvm.connected');
      } else if (this.status === Disconnected) {
        return this.$t('pageKvm.disconnected');
      }
      return this.$t('pageKvm.connecting');
    },
    serverPower() {
      return this.$store.getters['global/serverStatus'];
    },
    isOperationInProgress() {
      return this.$store.getters['controls/isOperationInProgress'];
    },
  },
  created() {
    this.$store.dispatch('global/getSystemInfo');
  },
  mounted() {
    this.initSessionData();
    this.connectWebSocket();
    this.openTerminal();

    this.refreshIntervalId = setInterval(this.initSessionData, 5000);
  },
  beforeDestroy() {
    this.kvmSessionsObj = {};
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    window.removeEventListener('resize', this.resizeKvmWindow);
    this.closeTerminal();
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  },
  methods: {
    ...mapActions('sessions', ['getSessionsData', 'getSessionService']),
    async requestControl() {
      if (this.controlRequested) return;

      this.controlRequested = true;
      try {
        await this.$store.dispatch('sessions/requestKvmControl');
        this.infoToast(this.$t('pageKvm.toast.requestControlSent'));
      } catch (error) {
        this.errorToast(this.$t('pageKvm.toast.requestControlFailed'));
        this.controlRequested = false;
      }
    },
    releaseControl() {
      this.$store.dispatch('sessions/releaseKvmControl');
    },

    handleSessionProperties(props) {
      if ('Control' in props) {
        const hasControlNow = props.Control === true;
        this.hasControlFlag = hasControlNow;

        // Если контроль получен, сбрасываем флаг запроса
        if (hasControlNow) {
          this.controlRequested = false;
          this.infoToast(this.$t('pageKvm.toast.controlGranted'));
        }
      }

      if ('ControlReq' in props) {
        this.awaitingControl = props.ControlReq === true;
      }
      console.log('1111', props);
      this.updateSession(this.currentKvmSessionId, props);
    },
    handleGlobalKvmProperties(props) {
      if ('ControlAsked' in props) {
        if (props.ControlAsked === false) {
          this.wasControlRequestHandled = false;
          return;
        }

        if (props.ControlAsked === true && this.wasControlRequestHandled)
          return;

        const controlOwner = this.kvmSessions.find((s) => s.Control);
        if (
          controlOwner &&
          controlOwner.sessionID === this.currentKvmSessionId
        ) {
          this.wasControlRequestHandled = true;
          this.showControlTransferModal();
        }
      }
    },
    showControlTransferModal() {
      if (this.isTransferModalOpen) return;
      this.isTransferModalOpen = true;

      this.$bvModal
        .msgBoxConfirm(this.$t('pageKvm.modal.controlTransferRequestMessage'), {
          title: this.$t('pageKvm.modal.controlTransferRequestTitle'),
          okTitle: this.$t('pageKvm.modal.transferControl'),
          cancelTitle: this.$t('pageKvm.modal.ignore'),
          centered: true,
          size: 'lg',
        })
        .then((confirmed) => {
          if (confirmed) {
            this.releaseControl();
            this.infoToast(this.$t('pageKvm.toast.controlTransferred'));
          }
        })
        .finally(() => {
          this.isTransferModalOpen = false;
        });
    },
    async initSessionData() {
      try {
        await this.$store.dispatch('sessions/getSessionsData');
        await this.$store.dispatch('sessions/getSessionService');

        this.currentKvmSessionId =
          this.$store.getters['sessions/getKvmSessionId'];
        this.controlEnabled =
          this.$store.getters['sessions/getKvmControlEnabled'];

        this.allConnections
          .filter((conn) => conn.sessionType === 'KVMIP')
          .forEach((conn) => {
            const sessionID = conn.sessionID;
            this.updateSession(sessionID, {
              Username: conn.username,
              IpAddr: conn.ipAddress,
            });
          });

        this.subscribeToActiveKvmSessions();
        this.sessionsReady = true;
      } catch (error) {
        console.error('Ошибка при инициализации KVM-сессий:', error);
      }
    },
    subscribeToActiveKvmSessions() {
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket не готов для подписки на активные сессии');
        return;
      }

      const sessionIDs = this.allConnections
        .filter((conn) => conn.sessionType === 'KVMIP')
        .map((conn) => conn.sessionID);

      const paths = sessionIDs.map(
        (id) => `/xyz/openbmc_project/kvm/sessions/${id}`,
      );
      const uniquePaths = [...new Set(paths)];

      this.websocket.send(
        JSON.stringify({
          paths: uniquePaths,
        }),
      );
    },
    updateSession(sessionID, props = {}) {
      if (props.Control === true) {
        for (const id in this.kvmSessionsObj) {
          if (id !== sessionID && this.kvmSessionsObj[id].Control) {
            this.$set(this.kvmSessionsObj[id], 'Control', false);
          }
        }
      }

      if (!this.kvmSessionsObj[sessionID]) {
        this.$set(this.kvmSessionsObj, sessionID, {
          sessionID,
          ...props,
        });
      } else {
        for (const [key, value] of Object.entries(props)) {
          this.$set(this.kvmSessionsObj[sessionID], key, value);
        }
      }
    },
    connectWebSocket() {
      const token = this.$store.getters['authentication/token'];
      const ws = new WebSocket(
        `wss://${window.location.host}/subscribe`,
        token,
      );

      ws.onopen = () => {
        console.log('WebSocket connected');

        const paths = ['/xyz/openbmc_project/kvm'];

        if (this.currentKvmSessionId) {
          paths.push(
            `/xyz/openbmc_project/kvm/sessions/${this.currentKvmSessionId}`,
          );
        }

        ws.send(
          JSON.stringify({
            paths,
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (
            msg.event === 'PropertiesChanged' &&
            typeof msg.path === 'string'
          ) {
            if (msg.path === '/xyz/openbmc_project/kvm') {
              this.handleGlobalKvmProperties(msg.properties);
              console.log(msg);
            } else if (
              msg.path ===
              `/xyz/openbmc_project/kvm/sessions/${this.currentKvmSessionId}`
            ) {
              this.handleSessionProperties(msg.properties);
            } else if (
              msg.path.startsWith('/xyz/openbmc_project/kvm/session/')
            ) {
              // Обработка других сессий
              const sessionID = msg.path.split('/').pop();
              const props = msg.properties || {};
              this.updateSession(sessionID, props);
            }
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error', e);
      };

      ws.onclose = () => {
        console.warn('WebSocket closed. Trying to reconnect...');
        setTimeout(this.connectWebSocket, 5000);
      };

      this.websocket = ws;
    },
    sendCtrlAltDel() {
      this.rfb.sendCtrlAltDel();
    },
    closeTerminal() {
      this.rfb.disconnect();
      this.rfb = null;
    },
    openTerminal() {
      const token = this.$store.getters['authentication/token'];
      this.rfb = new RFB(
        this.$refs.panel,
        `wss://${window.location.host}/kvm/0`,
        { wsProtocols: [token] },
      );

      this.rfb.scaleViewport = true;
      this.rfb.clipViewport = true;
      const that = this;

      this.resizeKvmWindow = throttle(() => {
        setTimeout(that.setWidthToolbar, 0);
      }, 1000);
      window.addEventListener('resize', this.resizeKvmWindow);

      this.rfb.addEventListener('connect', () => {
        that.isConnected = true;
        that.status = Connected;
        that.setWidthToolbar();
      });

      this.rfb.addEventListener('disconnect', () => {
        this.isConnected = false;
        that.status = Disconnected;
      });
    },
    setWidthToolbar() {
      if (
        this.$refs.panel.children &&
        this.$refs.panel.children.length > 0 &&
        this.$refs.panel.children[0].children.length > 0
      ) {
        this.$refs.toolbar.style.width =
          this.$refs.panel.children[0].children[0].clientWidth - 10 + 'px';
      }
    },
    openConsoleWindow() {
      // If consoleWindow is not null
      // Check the newly opened window is closed or not
      if (this.$eventBus.$consoleWindow) {
        // If window is not closed set focus to new window
        // If window is closed, do open new window
        if (!this.$eventBus.$consoleWindow.closed) {
          this.$eventBus.$consoleWindow.focus();
          return;
        } else {
          this.openNewWindow();
        }
      } else {
        // If consoleWindow is null, open new window
        this.openNewWindow();
      }
    },
    openNewWindow() {
      this.$eventBus.$consoleWindow = window.open(
        '#/console/kvm',
        'kvmConsoleWindow',
        'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=700,height=550',
      );
    },
    powerOn() {
      this.$store.dispatch('controls/serverPowerOn');
      this.infoToast(this.$t('pageKvm.toast.operationInProgress'));
    },
    powerOff() {
      const modalMessage = this.$t('pageKvm.modal.confirmShutdownMessage');
      const modalOptions = {
        title: this.$t('pageKvm.modal.confirmShutdownTitle'),
        okTitle: this.$t('global.action.confirm'),
        cancelTitle: this.$t('global.action.cancel'),
        centered: true,
      };

      this.$bvModal
        .msgBoxConfirm(modalMessage, modalOptions)
        .then((confirmed) => {
          if (confirmed) {
            this.$store.dispatch('controls/serverHardPowerOff');
            this.infoToast(this.$t('pageKvm.toast.operationInProgress'));
          }
        });
    },
    rebootServer() {
      const modalMessage = this.$t('pageKvm.modal.confirmRebootMessage');
      const modalOptions = {
        title: this.$t('pageKvm.modal.confirmRebootTitle'),
        okTitle: this.$t('global.action.confirm'),
        cancelTitle: this.$t('global.action.cancel'),
        centered: true,
      };

      this.$bvModal
        .msgBoxConfirm(modalMessage, modalOptions)
        .then((confirmed) => {
          if (confirmed) {
            this.$store.dispatch('controls/serverHardReboot');
            this.infoToast(this.$t('pageKvm.toast.operationInProgress'));
          }
        });
    },
    sendF1() {
      const keyF1 = 0xff91;
      this.rfb.sendKey(keyAlt, 'AltLeft', true);
      this.rfb.sendKey(keyF1, 'F1', true);
      this.rfb.sendKey(keyF1, 'F1', false);
      this.rfb.sendKey(keyAlt, 'AltLeft', false);
    },
    sendF2() {
      const keyF2 = 0xff92;
      this.rfb.sendKey(keyAlt, 'AltLeft', true);
      this.rfb.sendKey(keyF2, 'F2', true);
      this.rfb.sendKey(keyF2, 'F2', false);
      this.rfb.sendKey(keyAlt, 'AltLeft', false);
    },
    sendF3() {
      const keyF3 = 0xff93;
      this.rfb.sendKey(keyAlt, 'AltLeft', true);
      this.rfb.sendKey(keyF3, 'F3', true);
      this.rfb.sendKey(keyF3, 'F3', false);
      this.rfb.sendKey(keyAlt, 'AltLeft', false);
    },
    sendPrintSc() {
      const keyPrintSc = 0xff61;
      this.rfb.sendKey(keyPrintSc, 'PrtSc', true);
      this.rfb.sendKey(keyPrintSc, 'PrtSc', false);
    },
    sendMenu() {
      const keyMenu = 0xff67;
      this.rfb.sendKey(keyMenu, 'Menu', true);
      this.rfb.sendKey(keyMenu, 'Menu', false);
    },
    sendMetaLeft() {
      const keyMetaLeft = 0xffe7;
      this.rfb.sendKey(keyMetaLeft, 'MetaLeft', true);
      this.rfb.sendKey(keyMetaLeft, 'MetaLeft', false);
    },
    sendMetaRight() {
      const keyMetaRight = 0xffe8;
      this.rfb.sendKey(keyMetaRight, 'MetaRight', true);
      this.rfb.sendKey(keyMetaRight, 'MetaRight', false);
    },
    sendAltLeft() {
      const keyAltLeft = 0xffe9;
      this.rfb.sendKey(keyAltLeft, 'AltLeft', true);
      this.rfb.sendKey(keyAltLeft, 'AltLeft', false);
    },
    sendAltRight() {
      const keyAltRight = 0xffea;
      this.rfb.sendKey(keyAltRight, 'AltRight', true);
      this.rfb.sendKey(keyAltRight, 'AltRight', false);
    },
    sendCtrlLeft() {
      const keyCtrlLeft = 0xffe3;
      this.rfb.sendKey(keyCtrlLeft, 'CtrlLeft', true);
      this.rfb.sendKey(keyCtrlLeft, 'CtrlLeft', false);
    },
    sendCtrlRight() {
      const keyCtrlRight = 0xffe4;
      this.rfb.sendKey(keyCtrlRight, 'CtrlRight', true);
      this.rfb.sendKey(keyCtrlRight, 'CtrlRight', false);
    },
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
      this.isRecording = !this.isRecording;
    },

    startRecording() {
      const canvas = this.$refs.panel.querySelector('canvas');
      if (!canvas) {
        console.error('Canvas not found!');
        return;
      }

      const stream = canvas.captureStream(25);
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9',
      });

      this.recordedChunks = [];
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      this.successToast(this.$t('pageKvm.toast.recordingStarted'));
    },
    stopRecording() {
      if (!this.mediaRecorder) return;

      this.mediaRecorder.stop();
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `kvm-recording-${new Date().toISOString()}.webm`;
        a.click();

        this.successToast(this.$t('pageKvm.toast.recordingSaved'));
      };
    },
  },
};
</script>

<style scoped lang="scss">
.button-ctrl-alt-delete {
  float: right;
}

.kvm-status {
  padding-top: $spacer / 2;
  padding-left: $spacer / 4;
  display: inline-block;
}

.margin-left-full-window {
  padding: 0 15px;
}

.recording-icon.blinking {
  animation: blink 1s infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}

.card-users {
  position: absolute;
  right: 0;
  top: 35px;
}
</style>
