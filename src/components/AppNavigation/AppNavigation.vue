<template>
  <div>
    <div class="nav-container" :class="{ open: isNavigationOpen }">
      <nav ref="nav" :aria-label="$t('appNavigation.primaryNavigation')">
        <b-nav vertical class="mb-4">
          <global-search></global-search>
          <template v-for="(navItem, index) in navigationItems">
            <!-- Navigation items with no children -->
            <b-nav-item
              v-if="!navItem.children"
              :key="index"
              :to="navItem.route"
              :data-test-id="`nav-item-${navItem.id}`"
            >
              <div class="d-flex align-items-center justify-content-start">
                <component :is="navItem.icon" />
                <span class="w-75">{{ navItem.label }}</span>
              </div>
            </b-nav-item>

            <!-- Navigation items with children -->
            <li v-else :key="navItem.index" class="nav-item">
              <b-button
                v-b-toggle="`${navItem.id}`"
                variant="link"
                :data-test-id="`nav-button-${navItem.id}`"
              >
                <div class="d-flex align-items-center justify-content-between">
                  <component :is="navItem.icon" />
                  <span class="w-75">{{ navItem.label }}</span>
                  <icon-expand class="icon-expand" />
                </div>
              </b-button>
              <b-collapse
                :id="navItem.id"
                tag="ul"
                class="nav-item__nav"
                :visible="isSubmenuActive(navItem)"
              >
                <li class="nav-item">
                  <router-link
                    v-for="(subNavItem, i) of filteredNavItem(navItem.children)"
                    :key="i"
                    :to="subNavItem.route"
                    :data-test-id="`nav-item-${subNavItem.id}`"
                    class="nav-link"
                  >
                    {{ subNavItem.label }}
                  </router-link>
                </li>
              </b-collapse>
            </li>
          </template>
        </b-nav>
      </nav>

      <div class="d-flex justify-content-center">
        <div v-if="liveBmcTime" class="nav-time">
          <icon-calendar />
          <div>
            <div class="d-flex">
              <p class="m-0 nav-time-text">
                {{ liveBmcTime | formatTime }}
              </p>
              <span class="nav-time-color">|</span>
              <p class="m-0">
                {{ liveBmcTime | formatDate }}
              </p>
            </div>
            <div>
              <p class="nav-time-zone m-0">({{ timezone }})</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <transition name="fade">
      <div
        v-if="isNavigationOpen"
        id="nav-overlay"
        class="nav-overlay"
        @click="toggleIsOpen"
      ></div>
    </transition>
  </div>
</template>

<script>
//Do not change Mixin import.
//Exact match alias set to support
//dotenv customizations.
import AppNavigationMixin from './AppNavigationMixin';
import GlobalSearch from '@/components/Global/GlobalSearch';
import LiveBmcClockMixin from '@/components/Mixins/LiveBmcClockMixin';
import LocalTimezoneLabelMixin from '@/components/Mixins/LocalTimezoneLabelMixin';

export default {
  name: 'AppNavigation',
  components: { GlobalSearch },
  mixins: [AppNavigationMixin, LiveBmcClockMixin, LocalTimezoneLabelMixin],
  data() {
    return {
      isNavigationOpen: false,
      currentUserRole: null,
    };
  },
  computed: {
    isUtcDisplay() {
      return this.$store.getters['global/isUtcDisplay'];
    },
    timezone() {
      return this.localOffset(this.isUtcDisplay);
    },
  },
  watch: {
    $route: function () {
      this.isNavigationOpen = false;
    },
    isNavigationOpen: function (isNavigationOpen) {
      this.$root.$emit('change-is-navigation-open', isNavigationOpen);
    },
  },
  mounted() {
    this.getPrivilege();
    this.$root.$on('toggle-navigation', () => this.toggleIsOpen());
  },
  methods: {
    toggleIsOpen() {
      this.isNavigationOpen = !this.isNavigationOpen;
    },
    getPrivilege() {
      this.currentUserRole = this.$store?.getters['global/userPrivilege'];
    },
    filteredNavItem(navItem) {
      if (this.currentUserRole) {
        return navItem.filter(({ exclusiveToRoles }) => {
          if (!exclusiveToRoles?.length) return true;
          return exclusiveToRoles.includes(this.currentUserRole);
        });
      } else return navItem;
    },
    isSubmenuActive(navItem) {
      return navItem.children.some((child) =>
        this.$route.path.startsWith(child.route),
      );
    },
  },
};
</script>

<style scoped lang="scss">
svg {
  fill: currentColor;
  height: clamp(1.125rem, 0.1012rem + 1.2698vw, 1.625rem);
  width: clamp(1.125rem, 0.1012rem + 1.2698vw, 1.625rem);
  margin-left: 0 !important; //!important overriding button specificity
  vertical-align: text-bottom;
  opacity: 0.4;
  &:not(.icon-expand) {
    margin-right: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  }
}

.nav {
  flex-wrap: nowrap;
  max-height: 85vh;
  overflow-y: auto;

  @include media-breakpoint-down('xl') {
    max-height: 75vh;
  }
}

.nav-item {
  margin-bottom: clamp(1.25rem, -0.7976rem + 2.5397vw, 2.25rem);
}

.nav-item:first-of-type {
  margin-top: 15px;
}

.nav-item__nav {
  list-style: none;
  padding-left: 0;
  margin-left: 0;

  .nav-item {
    outline: none;
    position: relative;

    &:last-child {
      &::after {
        content: '';
        width: clamp(12.125rem, -0.1607rem + 15.2381vw, 18.125rem);
        position: absolute;
        bottom: -19px;
        left: 10%;
        border-bottom: 1px solid rgba($white, 0.2);

        @include media-breakpoint-up('xl') {
          bottom: -35px;
        }
      }
    }
  }

  .nav-link {
    margin-top: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
    padding-left: clamp(2.8rem, -0.0667rem + 3.5556vw, 4.2rem);
    outline: none;
    color: rgba($white, 0.7);
  }
}

.btn-link {
  display: inline-block;
  width: 100%;
  text-align: left;
  text-decoration: none !important;
  border-radius: 0;

  &.collapsed {
    .icon-expand {
      transform: rotate(180deg);
    }
  }
}

.icon-expand {
  float: right;
  width: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  height: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  margin-top: $spacer / 4;
  margin-left: clamp(0.375rem, -0.1369rem + 0.6349vw, 0.625rem) !important;
}

.btn-link,
.nav-link {
  position: relative;
  font-size: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  font-weight: $headings-font-weight;
  line-height: 1.5rem;
  padding: 0 clamp(0.5rem, -0.5238rem + 1.2698vw, 1rem);
  color: $white;

  &:hover {
    color: $current-link;

    svg {
      opacity: 1;
    }
  }

  &:active {
    background-color: $btn-hover;
    color: $white;
  }
}

.nav-link--current {
  font-weight: $headings-font-weight;
  color: $current-link !important;
  cursor: default;
  box-shadow: none;

  svg {
    opacity: 1;
  }

  &:hover,
  &:focus {
    background-color: $btn-color;
    color: $white;
  }
}

.nav-container {
  position: fixed;
  width: $navigation-width;
  top: $header-height;
  bottom: 0;
  left: 0;
  z-index: $zindex-fixed + 1;
  background-color: $menu-color;
  transform: translateX(-380px);
  transition: transform $exit-easing--productive $duration--moderate-02;
  scrollbar-width: thin;

  @include media-breakpoint-down(md) {
    z-index: $zindex-fixed + 2;
    top: 60px;
  }

  &.open,
  &:focus-within {
    transform: translateX(0);
    transition-timing-function: $entrance-easing--productive;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
    transition-duration: $duration--fast-01;
    transform: translateX(0);
  }
}

.nav::-webkit-scrollbar {
  width: 8px; /* ширина scrollbar */
}

.nav::-webkit-scrollbar-thumb {
  background-color: rgba($white, 0.2);
  border-radius: 5px;
}

// .nav::-webkit-scrollbar {
//   width: 10px;
//   background-color: #f9f9fd;
//   height: 30px;
// }

// .nav::-webkit-scrollbar-thumb {
//   border-radius: 10px;
//   background-color: #18aaaa;
//   height: 30px;
// }

// .nav::-webkit-scrollbar-track {
//   -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
//   border-radius: 10px;
//   background-color: black;
//   height: 30px;
// }

.nav-time {
  display: flex;
  align-items: center;
  position: fixed;
  bottom: 0;
  min-width: clamp(13.375rem, -0.1905rem + 16.8254vw, 20rem);
  margin-bottom: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  padding: clamp(0.625rem, -0.1429rem + 0.9524vw, 1rem)
    clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  font-size: clamp(0.75rem, -0.0179rem + 0.9524vw, 1.125rem);
  background-color: $menu-color;
  color: $white;
  border: 1px solid rgba($white, 0.2);
  border-radius: 20px;

  .nav-time-color {
    color: rgba($white, 0.4);
    margin-right: 8px;
    margin-left: clamp(0.125rem, -0.387rem + 0.635vw, 0.375rem);
  }

  .nav-time-text {
    min-width: clamp(3.375rem, 1.071rem + 2.857vw, 4.5rem);
  }

  .nav-time-zone {
    display: block;
    font-size: clamp(0.625rem, 0.1131rem + 0.6349vw, 0.875rem);
    color: rgba($white, 0.4);
  }
}

.nav-overlay {
  position: fixed;
  top: $header-height;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $zindex-fixed + 1;
  background-color: $black;
  opacity: 0.5;

  &.fade-enter-active {
    transition: opacity $duration--moderate-02 $entrance-easing--productive;
  }

  &.fade-leave-active {
    transition: opacity $duration--fast-02 $exit-easing--productive;
  }

  &.fade-enter, // Remove this vue2 based only class when switching to vue3
  &.fade-enter-from, // This is vue3 based only class modified from 'fade-enter'
  &.fade-leave-to {
    opacity: 0;
  }

  @include media-breakpoint-down(md) {
    top: 60px;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
    display: none;
  }
}
</style>
