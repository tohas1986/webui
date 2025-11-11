<template>
  <div class="search-container">
    <b-row class="align-items-end header-search m-0">
      <b-col class="p-0">
        <search
          :placeholder="$t('appNavigation.search.inputText')"
          :is-nav-search="true"
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
        <div v-if="searchFilter" class="d-flex flex-column links">
          <b-link
            v-for="(link, index) in filteredLinks"
            :key="index"
            :to="link.to"
            :class="{ disabled: !link.to }"
            class="card-info search-link"
            @click="resetSearchFilter"
          >
            <dl>
              {{ link.text }}
            </dl>
            <template v-if="link.details">
              <dl
                v-for="(detail, detailIndex) in link.details"
                :key="detailIndex"
              >
                <dt>{{ detail.label }}</dt>
                <dd>{{ detail.value }}</dd>
              </dl>
            </template>
          </b-link>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Search from '@/components/Global/Search';

export default {
  name: 'Information',
  components: { Search },
  data() {
    return {
      searchFilter: null,
    };
  },
  computed: {
    linksData() {
      return [
        ...Object.keys(this.networkSettings).map((interfaceName) => ({
          text: interfaceName,
          to: '/settings/network',
          details: [
            {
              label: `${this.$t('appNavigation.search.ethName')}: `,
              value: interfaceName,
            },
            {
              label: `${this.$t('appNavigation.search.macAddress')}: `,
              value: this.networkSettings[interfaceName].macAddress,
            },
            {
              label: `${this.$t('appNavigation.search.ipAddress')}: `,
              value: this.networkSettings[interfaceName].dhcpAddress,
            },
            {
              label: `${this.$t('appNavigation.search.serverName')}: `,
              value: this.networkSettings[interfaceName].nameServers,
            },
          ],
        })),
        ...Object.keys(this.chassis).map((id) => ({
          text: `${this.chassis[id].id}`,
          to: '/hardware-status/inventory',
          details: [
            {
              label: `${this.$t('appNavigation.search.chassisModel')}: `,
              value: this.chassis[id].model,
            },
          ],
        })),
        {
          text: `${this.$t('appNavigation.search.serialNumberLabel')}: `,
          to: '/hardware-status/inventory',
          details: [
            {
              label: `${this.$t('appNavigation.search.serialNumber')}: `,
              value: this.serialNumber,
            },
          ],
        },
        {
          text: `${this.$t('appNavigation.search.modelType')}: `,
          to: '/hardware-status/inventory',
          details: [
            {
              label: `${this.$t('appNavigation.search.model')}: `,
              value: this.modelType,
            },
          ],
        },
        {
          text: this.$t('appNavigation.search.sensors'),
          to: '/hardware-status/sensors',
        },
        {
          text: this.$t('appNavigation.search.eth'),
          to: '/settings/network',
        },
        {
          text: this.$t('appNavigation.search.logs'),
          to: '/logs/event-logs',
        },
        {
          text: this.$t('appNavigation.search.rebootBmc'),
          to: '/operations/reboot-bmc',
        },
        {
          text: this.$t('appNavigation.search.raidManagement'),
          to: '/resource-management/raid-management',
        },
        {
          text: this.$t('appNavigation.search.network'),
          to: '/settings/network',
        },
        {
          text: this.$t('appNavigation.search.snmp'),
          to: '/settings/snmp',
        },
        {
          text: this.$t('appNavigation.search.smtp'),
          to: '/settings/smtp',
        },
        {
          text: this.$t('appNavigation.search.fans'),
          to: '/hardware-status/inventory',
        },
        {
          text: this.$t('appNavigation.search.fansSettings'),
          to: '/resource-management/fan-control',
        },
        {
          text: this.$t('appNavigation.search.processors'),
          to: '/hardware-status/inventory',
        },
        {
          text: this.$t('appNavigation.search.chassis'),
          to: '/hardware-status/inventory',
        },
        {
          text: this.$t('appNavigation.search.storage'),
          to: '/hardware-status/inventory',
        },
        {
          text: this.$t('appNavigation.search.led'),
          to: '/hardware-status/inventory',
        },
        {
          text: this.$t('appNavigation.search.sessions'),
          to: '/security-and-access/sessions',
        },
        {
          text: this.$t('appNavigation.search.firmware'),
          to: '/operations/firmware',
        },
        {
          text: this.$t('appNavigation.search.console'),
          to: '/console/kvm',
        },
        {
          text: this.$t('appNavigation.search.kvm'),
          to: '/operations/kvm',
        },
        {
          text: this.$t('appNavigation.search.sol'),
          to: '/operations/serial-over-lan',
        },
        {
          text: this.$t('appNavigation.search.power'),
          to: '/operations/server-power-operations',
        },
        {
          text: this.$t('appNavigation.search.virtualMedia'),
          to: '/operations/virtual-media',
        },
        {
          text: this.$t('appNavigation.search.factoryReset'),
          to: '/operations/configuration',
        },
        {
          text: this.$t('appNavigation.search.backupAndRestore'),
          to: '/operations/configuration',
        },
        {
          text: this.$t('appNavigation.search.keyClear'),
          to: '/operations/key-clear',
        },
        {
          text: this.$t('appNavigation.search.date'),
          to: '/settings/date-time',
          details: [
            {
              label: `${this.$t('appNavigation.search.date')}: `,
              value: this.time,
            },
          ],
        },
        {
          text: this.$t('appNavigation.search.ldap'),
          to: '/security-and-access/ldap',
        },
        {
          text: this.$t('appNavigation.search.userManagement'),
          to: '/settings/user-management',
        },
        {
          text: this.$t('appNavigation.search.policies'),
          to: '/security-and-access/policies',
        },
        {
          text: this.$t('appNavigation.search.certificates'),
          to: '/security-and-access/certificates',
        },
        {
          text: this.$t('appNavigation.search.powerAll'),
          to: '/resource-management/power',
        },
        {
          text: this.$t('appNavigation.search.language'),
          to: '/profile-settings',
        },
      ];
    },
    filteredLinks() {
      if (!this.searchFilter) return this.linksData;

      const filtered = this.linksData.filter((link) => {
        const text = link.text?.toLowerCase();
        const detailsText = link.details
          ? link.details
              .map(
                (detail) =>
                  `${detail.label?.toLowerCase()} ${detail.value?.toLowerCase()}`,
              )
              .join(' ')
          : '';
        return (
          text.includes(this.searchFilter.toLowerCase()) ||
          detailsText.includes(this.searchFilter.toLowerCase())
        );
      });

      if (filtered.length === 0) {
        return [
          {
            text: this.$t('appNavigation.search.nothingFound'),
            to: null,
            details: [],
          },
        ];
      }

      return filtered;
    },

    serialNumber() {
      return this.$store.getters['global/serialNumber'];
    },
    modelType() {
      return this.$store.getters['global/modelType'];
    },
    time() {
      return String(this.$store.getters['global/bmcTime']);
    },
    networkSettings() {
      const networkSettingsStore =
        this.$store.getters['network/globalNetworkSettings'];

      const result = {};

      networkSettingsStore.forEach((item) => {
        const interfaceName = item.id;

        result[interfaceName] = {
          macAddress: item.macAddress,
          dhcpAddress: item.dhcpAddress[0]?.Address,
          nameServers: item.nameServers[0],
        };
      });

      return result;
    },
    chassis() {
      return this.$store.getters['chassis/chassis'].map((item) => ({
        id: item.id,
        model: item.model,
      }));
    },
  },
  mounted() {
    document.addEventListener('click', this.closeLinksOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeLinksOutside);
  },
  methods: {
    closeLinksOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.searchFilter = false;
      }
    },
    resetSearchFilter() {
      this.searchFilter = null;
    },
    onChangeSearchInput(searchValue) {
      this.searchFilter = searchValue?.toLowerCase();
    },
    onClearSearchInput() {
      this.searchFilter = null;
    },
  },
};
</script>
<style lang="scss" scoped>
.search-container {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: $menu-color;
  padding-top: clamp(1.25rem, -0.2857rem + 1.9048vw, 2rem);
}
.header-search {
  position: relative;
  margin-bottom: clamp(0.5rem, -0.933rem + 1.778vw, 1.2rem) !important;
}
.links {
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  border-radius: 5px;
  position: absolute;
  top: calc(100%);
  left: 0.5rem;
  width: calc(100% - 1rem);
  max-height: 200px;
  padding: 0 9px;
  overflow-y: auto;
  z-index: 1;
}

.links::-webkit-scrollbar {
  width: 8px;
  border-radius: 5px;
}
.links::-webkit-scrollbar-thumb {
  background-color: #f0f0f0;
  background-color: rgba(0, 0, 0, 0.15) !important;
  border-radius: 5px !important;
}
.links::-webkit-scrollbar-button {
  display: none !important;
}
.links::-webkit-scrollbar-track {
  background-color: #f0f0f0;
  border-radius: 5px !important;
}

.search-link {
  cursor: pointer;
  padding: 8px 0;
  font-size: 12px;
  color: black;
  border-bottom: 1px solid #c8c9ca;
}

.search-link:hover {
  text-decoration: none;
  opacity: 0.7;
}
.disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
  text-decoration: none;
}

.search-link:last-of-type {
  border-bottom: none;
}

.search-link dl * {
  display: inline;
}
</style>
