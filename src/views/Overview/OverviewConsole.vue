<template>
  <b-card>
    <div class="card-text">
      <div>
        <h3 class="mb-0">{{ $t('pageOverview.kvmConsole') }}</h3>
        <b-link class="card-link" @click.prevent="openConsoleWindow()">
          {{ $t('pageOverview.openNewTab') }}
          <icon-launch />
        </b-link>
      </div>
      <p class="text-muted">
        <status-color :status="consoleColor" />
        {{ serverStatus }}
      </p>
    </div>
    <div ref="panel" class="console-container">
      <b-button
        v-if="isHiddenConsoleBtn"
        class="console-button"
        @click="consoleOn"
      >
        <span class="icon-box">
          <icon-arrow />
        </span>
        {{ $t('pageOverview.kvmStart') }}
      </b-button>
    </div>
  </b-card>
</template>

<script>
import RFB from '@novnc/novnc/core/rfb';
import StatusColor from '@/components/Global/StatusColor';
import IconArrow from '@/components/icons/IconArrowRight';
import IconLaunch from '@/components/icons/IconLaunch';

const Disconnected = 0;
const Connecting = 1;
const Connected = 2;

export default {
  name: 'OverviewConsole',
  components: { StatusColor, IconArrow, IconLaunch },
  data() {
    return {
      isHiddenConsoleBtn: true,
      rfb: null,
      convasRef: null,
      status: Disconnected,
      consoleColor: 'danger',
    };
  },
  computed: {
    serverStatus() {
      if (this.status === Connected) {
        return this.$t('pageKvm.connected');
      } else if (this.status === Disconnected) {
        return this.$t('pageKvm.disconnected');
      } else if (this.status === Connecting) {
        return this.$t('pageKvm.connecting');
      }
      return '';
    },
  },
  created() {
    this.$store.dispatch('global/getSystemInfo');
  },
  beforeDestroy() {
    this.closeTerminal();
  },
  methods: {
    closeTerminal() {
      this.rfb = null;
    },
    consoleOn() {
      const token = this.$store.getters['authentication/token'];
      this.rfb = new RFB(
        this.$refs.panel,
        `wss://${window.location.host}/kvm/0`,
        { wsProtocols: [token] },
      );

      this.status = Connecting;
      this.consoleColor = 'secondary';

      this.rfb.scaleViewport = true;
      this.rfb.clipViewport = true;
      const that = this;

      this.rfb.addEventListener('connect', () => {
        that.isConnected = true;
        that.status = Connected;
        that.consoleColor = 'success';
        that.isHiddenConsoleBtn = false;
      });
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
  },
};
</script>

<style lang="scss" scoped>
.card {
  min-height: clamp(15.063rem, -0.1651rem + 18.8876vw, 22.5rem);
  border-radius: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);

  @media (max-width: 1100px) {
    min-height: unset;
    height: auto;
  }

  @include media-breakpoint-down(md) {
    min-height: clamp(15.063rem, -0.1651rem + 18.8876vw, 22.5rem);
  }

  @include media-breakpoint-down(sm) {
    min-height: unset;
    height: auto;
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: clamp(1.625rem, -0.1667rem + 2.2222vw, 2.5rem);
  padding-left: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  padding-right: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  padding-bottom: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
}

.card-text {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding-left: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  padding-right: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
}

.status-color {
  margin-right: 5px;
}

.console-container {
  position: relative;
  height: 216px;
  background-color: $black;
  border: 1px solid $gray-border;
  border-radius: 20px;

  @include media-breakpoint-down('xl') {
    height: 144px;
  }
}

.console-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding-right: 15px;
  padding-left: 4px;
  padding-top: 4px;
  padding-bottom: 4px;
  background-color: $gray-light;
  color: $main-color;
  border: none;
  border-radius: 20px;
  font-size: clamp(0.625rem, 0.1131rem + 0.6349vw, 0.875rem);

  &:hover {
    background-color: $main-color;
    color: $white;
  }
}

.icon-box {
  background-color: $main-color;
  margin-right: 15px;

  svg {
    margin-right: 0;
    fill: $white;
  }
}
</style>
