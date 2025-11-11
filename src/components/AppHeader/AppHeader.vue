<template>
  <div>
    <header id="page-header">
      <a
        class="link-skip-nav btn btn-light"
        href="#main-content"
        @click="setFocus"
      >
        {{ $t('appHeader.skipToContent') }}
      </a>

      <b-navbar :aria-label="$t('appHeader.applicationHeader')">
        <!-- Left aligned nav items -->
        <div class="d-flex nav-wrapper">
          <b-button
            id="app-header-trigger"
            class="nav-trigger"
            aria-hidden="true"
            type="button"
            variant="link"
            :class="{ open: isNavigationOpen }"
            @click="toggleNavigation"
          >
            <icon-close
              v-if="isNavigationOpen"
              :title="$t('appHeader.titleHideNavigation')"
            />
            <icon-menu
              v-if="!isNavigationOpen"
              :title="$t('appHeader.titleShowNavigation')"
            />
          </b-button>

            <!-- <div v-if="isNavTagPresent" :key="routerKey" class="pl-2 nav-tags">
            <span>|</span>
            <span class="pl-3 asset-tag">{{ assetTag }}</span>
            <span class="pl-3">{{ modelType }}</span>
            <span class="pl-3">{{ serialNumber }}</span>
          </div> -->
          </b-navbar-nav>
        </div>
        <div class="d-flex nav-items-wrapper w-100">
          <b-navbar-nav class="info-menu">
            <li
              v-if="isNavTagPresent"
              :key="routerKey"
              class="nav-item nav-text"
            >
              <h3 class="text-model responsive-text">{{ modelType }}</h3>
              <p class="text-muted responsive-text">{{ serialNumber }}</p>
            </li>
            <b-nav-item
              :class="healthStatusIcon"
              class="nav-item-link"
              to="/logs/event-logs"
              data-test-id="appHeader-container-health"
            >
              <status-color :status="healthStatusIcon" />
              <template v-if="windowWidth < 768">
                <span>
                  {{ $t('appHeader.healthMobile') }}
                </span>
              </template>
              <template v-else>
                <span v-if="healthStatus === 'OK'">
                  {{ $t('appHeader.health') }}</span
                >
                <span v-else>
                  {{ allEvents }} {{ $tc('appHeader.eventLogs', allEvents) }}
                </span>
              </template>
            </b-nav-item>
            <li class="nav-item">
              <b-dropdown
                id="app-header-power"
                variant="link"
                data-test-id="appHeader-container-power"
              >
                <template #button-content>
                  <status-color :status="serverStatusIcon" />
                  <template v-if="windowWidth < 768">
                    <span>
                      <span v-if="serverStatus === 'on'">{{
                        $t('appHeader.powerOnMobile')
                      }}</span>
                      <span v-else-if="serverStatus === 'off'">{{
                        $t('appHeader.powerOffMobile')
                      }}</span>
                      <span v-else>{{ serverStatus }}</span>
                    </span>
                  </template>
                  <template v-else>
                    <span>
                      <span v-if="serverStatus === 'on'">{{
                        $t('appHeader.powerOn')
                      }}</span>
                      <span v-else-if="serverStatus === 'off'">{{
                        $t('appHeader.powerOff')
                      }}</span>
                      <span v-else>{{ serverStatus }}</span>
                    </span>
                  </template>
                </template>
                <b-dropdown-item
                  v-if="serverStatus === 'off'"
                  data-test-id="appHeader-container-power"
                  @click="powerOn"
                >
                  <status-color status="success" />
                  {{ $t('appHeader.powerOn') }}
                </b-dropdown-item>
                <b-dropdown-item
                  v-if="serverStatus === 'on'"
                  data-test-id="appHeader-container-power"
                  @click="powerOff"
                >
                  <status-color status="danger" />
                  {{ $t('appHeader.powerOff') }}
                </b-dropdown-item>
                <b-dropdown-item
                  data-test-id="appHeader-container-power"
                  @click="rebootServer"
                >
                  <status-color status="secondary" />
                  {{ $t('appHeader.powerCycle') }}
                </b-dropdown-item>
              </b-dropdown>
            </li>
            <li class="nav-item">
              <b-button
                ref="nmiButton"
                class="nmi-button"
                variant="link"
                @click="onNmiClick"
              >
                <template v-if="windowWidth < 768">
                  {{ $t('appHeader.nmiMobile') }}
                </template>
                <template v-else>
                  {{ $t('appHeader.nmi') }}
                </template>
              </b-button>
            </li>
            <li class="nav-item nav-refresh">
              <b-button
                id="app-header-refresh"
                variant="link"
                data-test-id="appHeader-button-refresh"
                @click="refresh"
              >
                <icon-renew :title="$t('appHeader.titleRefresh')" />
              </b-button>
            </li>
            <!-- <li v-if="stateRaid[0]" class="nav-item">
              <b-dropdown variant="link">
                <template #button-content>
                  {{ $t('appHeader.titleUpdate') }}</template
                >
                <b-dropdown-item
                  v-for="raid in raids"
                  :key="raid.id"
                  to="/operations/raid-management"
                >
                  {{ raid.model }} {{ raid.progress }}%</b-dropdown-item
                >
              </b-dropdown>
            </li> -->
          </b-navbar-nav>
          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto helper-menu">
            <!-- Using LI elements instead of b-nav-item to support semantic button elements -->
            <li class="nav-item">
              <b-dropdown
                id="app-header-user"
                variant="link"
                data-test-id="appHeader-container-user"
              >
                <template #button-content>
                  <span class="icon-box">
                    <status-color
                      class="status-profile"
                      :status="profileStatus"
                    />
                  </span>
                  <span class="responsive-text">{{ username }}</span>
                </template>
                <b-dropdown-item
                  to="/profile-settings"
                  data-test-id="appHeader-link-profile"
                >
                  <status-color :status="settingStatus" />
                  {{ $t('appHeader.profileSettings') }}
                </b-dropdown-item>
              </b-dropdown>
            </li>
            <li class="nav-item">
              <b-button
                id="app-header-logout"
                variant="link"
                data-test-id="appHeader-link-logout"
                @click="logout"
              >
                <span class="icon-box">
                  <icon-logout :title="$t('appHeader.titleLogout')" />
                </span>
                <span class="responsive-text">{{
                  $t('appHeader.logOut')
                }}</span>
              </b-button>
            </li>
          </b-navbar-nav>
        </div>
      </b-navbar>
    </header>
    <loading-bar />
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconClose from '@carbon/icons-vue/es/close/20';
import IconMenu from '@carbon/icons-vue/es/menu/20';
import IconRenew from '@carbon/icons-vue/es/renew/20';
import StatusColor from '@/components/Global/StatusColor';
import IconLogout from '@carbon/icons-vue/es/logout/20';
import LoadingBar from '@/components/Global/LoadingBar';
import { mapState } from 'vuex';

export default {
  name: 'AppHeader',
  components: {
    IconClose,
    IconMenu,
    IconRenew,
    StatusColor,
    LoadingBar,
    IconLogout,
  },
  mixins: [BVToastMixin],
  props: {
    routerKey: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      profileStatus: 'success',
      settingStatus: 'secondary',
      isNavigationOpen: false,
      altLogo: process.env.VUE_APP_COMPANY_NAME || 'OYLogo',
      isUpdating: true,
      windowWidth: 0,
    };
  },
  computed: {
    ...mapState('authentication', ['consoleWindow']),
    isNavTagPresent() {
      return this.assetTag || this.modelType || this.serialNumber;
    },
    assetTag() {
      return this.$store.getters['global/assetTag'];
    },
    modelType() {
      return this.$store.getters['global/modelType'];
    },
    serialNumber() {
      return this.$store.getters['global/serialNumber'];
    },
    isAuthorized() {
      return this.$store.getters['global/isAuthorized'];
    },
    userPrivilege() {
      return this.$store.getters['global/userPrivilege'];
    },
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    healthStatus() {
      return this.$store.getters['eventLog/healthStatus'];
    },
    serverStatusIcon() {
      switch (this.serverStatus) {
        case 'on':
          return 'success';
        case 'off':
          return 'danger';
        case 'diagnosticMode':
          return 'warning';
        default:
          return 'secondary';
      }
    },
    healthStatusIcon() {
      switch (this.healthStatus) {
        case 'OK':
          return 'success';
        case 'Warning':
          return 'warning';
        case 'Critical':
          return 'danger';
        default:
          return 'secondary';
      }
    },
    username() {
      return this.$store.getters['global/username'];
    },
    eventLogData() {
      return this.$store.getters['eventLog/allEvents'];
    },
    criticalEvents() {
      return this.eventLogData
        .filter(
          (log) =>
            log.severity === 'Critical' && log.filterByStatus === 'Unresolved',
        )
        .map((log) => {
          return log;
        });
    },
    warningEvents() {
      return this.eventLogData
        .filter(
          (log) =>
            log.severity === 'Warning' && log.filterByStatus === 'Unresolved',
        )
        .map((log) => {
          return log;
        });
    },
    allEvents() {
      return this.criticalEvents.length + this.warningEvents.length;
    },
    // stateRaid() {
    //   return this.$store.getters['raid/stateRaid'];
    // },
    // raids() {
    //   return this.$store.getters['raid/raids'];
    // },
  },
  watch: {
    consoleWindow() {
      if (this.consoleWindow === false) this.$eventBus.$consoleWindow.close();
    },
    isAuthorized(value) {
      if (value === false) {
        this.errorToast(this.$t('global.toast.unAuthDescription'), {
          title: this.$t('global.toast.unAuthTitle'),
        });
      }
    },
  },
  created() {
    // Reset auth state to check if user is authenticated based
    // on available browser cookies
    this.$store.dispatch('authentication/resetStoreState');
    this.getSystemInfo();
    this.getEvents();
    // this.getRaids();
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
    this.$root.$on(
      'change-is-navigation-open',
      (isNavigationOpen) => (this.isNavigationOpen = isNavigationOpen),
    );
  },
  beforeDestroy() {
    this.stopUpdatingRaid();
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    onResize() {
      this.windowWidth = window.innerWidth;
    },
    getSystemInfo() {
      this.$store.dispatch('global/getSystemInfo');
    },
    getEvents() {
      this.$store.dispatch('eventLog/getEventLogData');
    },
    getRaids() {
      this.$store.dispatch('raid/getData');
    },
    refresh() {
      this.$emit('refresh');
    },
    logout() {
      this.$store.dispatch('authentication/logout');
    },
    toggleNavigation() {
      this.$root.$emit('toggle-navigation');
    },
    setFocus(event) {
      event.preventDefault();
      this.$root.$emit('skip-navigation');
    },
    powerOn() {
      this.$store.dispatch('controls/serverPowerOn');
    },
    powerOff() {
      const modalMessage = this.$t('appHeader.modal.confirmShutdownMessage');
      const modalOptions = {
        title: this.$t('appHeader.modal.confirmShutdownTitle'),
        okTitle: this.$t('global.action.confirm'),
        cancelTitle: this.$t('global.action.cancel'),
        centered: true,
      };

      this.$bvModal
        .msgBoxConfirm(modalMessage, modalOptions)
        .then((confirmed) => {
          if (confirmed) {
            this.$store.dispatch('controls/serverHardPowerOff');
            this.infoToast(this.$t('appHeader.toast.operationInProgress'));
          }
        });
    },
    rebootServer() {
      const modalMessage = this.$t('appHeader.modal.confirmRebootMessage');
      const modalOptions = {
        title: this.$t('appHeader.modal.confirmRebootTitle'),
        okTitle: this.$t('global.action.confirm'),
        cancelTitle: this.$t('global.action.cancel'),
        centered: true,
      };

      this.$bvModal
        .msgBoxConfirm(modalMessage, modalOptions)
        .then((confirmed) => {
          if (confirmed) {
            this.$store.dispatch('controls/serverHardReboot');
            this.infoToast(this.$t('appHeader.toast.operationInProgress'));
          }
        });
    },
    toggleUpdating() {
      if (this.isUpdating) {
        this.startUpdatingRaid();
      } else {
        this.stopUpdatingRaid();
      }
    },
    startUpdatingRaid() {
      this.intervalId = setInterval(() => {
        if (this.isUpdating) {
          this.getRaids();
        } else {
          this.stopUpdatingRaid();
        }
      }, 10000);
    },
    stopUpdatingRaid() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
    onNmiClick() {
      this.$store
        .dispatch('system/runNmi')
        .then(() => {
          this.infoToast(this.$t('appHeader.toast.nmiRunning'), {
            title: this.$t('appHeader.success'),
            timestamp: true,
          });
        })
        .catch((message) => {
          console.log(message);
          this.errorToast(this.$t('appHeader.toast.errorGenerateNmi'), {
            title: this.$t('appHeader.error'),
            timestamp: true,
          });
        });
    },
  },
};
</script>

<style lang="scss">
@mixin focus-box-shadow($padding-color: $navbar-color, $outline-color: $white) {
  box-shadow:
    inset 0 0 0 3px $padding-color,
    inset 0 0 0 5px $outline-color;
}
.app-header {
  .link-skip-nav {
    position: absolute;
    top: -60px;
    left: 0.5rem;
    z-index: $zindex-popover;
    transition: $duration--moderate-01 $exit-easing--expressive;
    &:focus {
      top: 0.5rem;
      transition-timing-function: $entrance-easing--expressive;
    }
  }
  .navbar-text,
  .nav-link,
  .btn-link {
    color: $main-color !important;
    fill: currentColor;
    padding: clamp(0.5rem, -0.0119rem + 0.6349vw, 0.75rem)
      clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem) !important;
    font-size: clamp(0.75rem, -0.0179rem + 0.9524vw, 1.125rem);
    font-weight: 400;
    height: clamp(2.188rem, 0.0134rem + 2.6971vw, 3.25rem);

    @include media-breakpoint-down(md) {
      padding: 0.5rem !important;
    }

    &:hover {
      background-color: $main-color;
      color: $white !important;
    }
    &:active {
      background-color: theme-color-level(light, 9);
    }
    &:focus {
      @include focus-box-shadow;
      outline: 0;
    }
  }

  .nav-item {
    margin-right: clamp(0.209rem, -0.004rem + 0.2641vw, 0.313rem);
  }

  .nav-link {
    white-space: nowrap;
  }

  .nav-link,
  .btn-link {
    background-color: $btn-background;
    border-radius: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  }

  .navbar {
    align-items: flex-end;
    padding: 0;
    background-color: $navbar-color;
    align-items: center;
    @include media-breakpoint-up($responsive-layout-bp) {
      height: $header-height;
    }

    @include media-breakpoint-down(md) {
      align-items: center;
    }

    .info-menu {
      margin-left: clamp(1.25rem, -1.3095rem + 3.1746vw, 2.5rem);
      @include media-breakpoint-down(md) {
        margin: 0;
        gap: 3px 0;
        flex-wrap: wrap;
        padding: 12px 0 0 clamp(1.25rem, -2.5893rem + 4.7619vw, 3.125rem);
        width: 70%;
      }
      @include media-breakpoint-down(sm) {
        padding: 12px 0 12px clamp(1.25rem, -2.5893rem + 4.7619vw, 3.125rem);
      }
    }

    .helper-menu {
      padding: 12px clamp(1.25rem, -2.5893rem + 4.7619vw, 3.125rem) 0 0.5rem;

      @include media-breakpoint-down(md) {
        align-self: flex-start;
        padding-left: 0;
      }

      @include media-breakpoint-only(xs) {
        align-self: flex-start;
      }

      .btn-link {
        padding: clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem)
          clamp(1.375rem, 0.0952rem + 1.5873vw, 2rem)
          clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem)
          clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem) !important;

        svg {
          margin-right: 0;
          fill: $main-color;
        }

        @include media-breakpoint-down(md) {
          padding: 0.5rem !important;
        }
      }

      .status-profile {
        vertical-align: bottom;
        margin-right: 0;
      }
      @include media-breakpoint-down(sm) {
        justify-content: flex-end;

        .nav-link,
        .btn {
          padding: $spacer / 1.125 $spacer / 2;
        }

        .nav-link:focus,
        .btn:focus {
          @include focus-box-shadow($gray-800);
        }
      }
    }
  }

  .navbar-nav {
    align-items: flex-end;

    .navbar-brand,
    .nav-link {
      transition: $focus-transition;
    }
    .nav-tags {
      color: theme-color-level(light, 3);
      @include media-breakpoint-down(xs) {
        @include sr-only;
      }
      .asset-tag {
        @include media-breakpoint-down($responsive-layout-bp) {
          @include sr-only;
        }
      }
    }
  }

  .nav-trigger {
    fill: $white !important;
    width: $header-height;
    height: $header-height;
    transition: none;
    display: inline-flex;
    flex: 0 0 20px;
    align-items: center;
    border-radius: 0;
    background-color: $menu-color;
    color: $white !important;

    @include media-breakpoint-down(md) {
      height: 60px;
      flex: 0 0 8%;
    }

    @include media-breakpoint-down(sm) {
      width: 16%;
      flex: auto;
    }

    svg {
      margin: 0;
    }

    &:hover {
      background-color: $btn-hover;
    }

    @include media-breakpoint-up($responsive-layout-bp) {
      display: none;
    }
  }

  .dropdown-menu {
    margin-top: 0;

    @include media-breakpoint-down(md) {
      left: auto;
      right: 0;
    }
  }

  .navbar-expand {
    @include media-breakpoint-down(md) {
      flex-flow: wrap;
      border: none;
    }

    @include media-breakpoint-down(sm) {
      border-bottom: 1px solid $border-color;
    }
  }

  .text-model {
    padding: 0;
    margin: 0;
  }

  .text-muted {
    padding: 0;
    margin: 0;
    margin-top: 5px;
  }

  .nav-text {
    margin-right: clamp(2rem, -4.9107rem + 8.5714vw, 5.375rem);

    @media (max-width: 1100px) {
      margin-right: 20px;
      display: none;
    }
  }

  .nav-refresh {
    .btn-link {
      padding: clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem) !important;
    }
    svg {
      margin: 0;
      transform: rotate(130deg) scale(-1, 1);
    }
  }

  .icon-box {
    margin-right: clamp(0.625rem, -0.1429rem + 0.9524vw, 1rem);

    @include media-breakpoint-down(md) {
      margin: 0;
    }
  }

  .status-color {
    margin-right: clamp(0.625rem, -0.1429rem + 0.9524vw, 1rem);

    @include media-breakpoint-down(sm) {
      margin-right: 5px;
    }
  }

  .danger .nav-link,
  .warning .nav-link {
    background-color: rgba($error-color, 0.1);

    &:hover {
      background-color: rgba($error-color, 0.3);
    }
  }

  .success .nav-link {
    background-color: rgba($success-color, 0.1);

    &:hover {
      background-color: rgba($success-color, 0.3);
    }
  }
}

.nav-wrapper {
  @include media-breakpoint-down(md) {
    width: 100%;
  }
}

.nav-items-wrapper {
  align-self: center;
  margin-bottom: -1px;
}

.navbar-logo {
  position: relative;
  padding: 0 $spacer;
  min-width: $navigation-width;
  background-color: $menu-color;

  @include media-breakpoint-down(md) {
    width: 92%;
  }

  @include media-breakpoint-down(sm) {
    border-radius: 0;
    width: 84%;
    padding: 0 $spacer 0 0;
  }
}

.header-logo {
  @include media-breakpoint-down(md) {
    width: 100%;
    height: 38px;
  }
}

.navbar-brand {
  padding: clamp(1.25rem, -0.0298rem + 1.5873vw, 1.875rem) 0;
  height: $header-height;
  line-height: 1;

  @include media-breakpoint-down(md) {
    height: 60px;
    padding: 0.5rem;
  }
}

.responsive-text {
  @include media-breakpoint-down(md) {
    @include sr-only;
  }
}

.nav-item .icon-box {
  @include media-breakpoint-down(xs) {
    width: 22px;
  }
}

.nmi-button:focus {
  box-shadow: none !important;
}

.nav-item-link .nav-link {
  display: flex !important;
  align-items: center;
}
</style>
