import IconDashboard from '../icons/IconOverview';
import IconTextLinkAnalysis from '../icons/IconLogs';
import IconDataCheck from '../icons/IconHardware';
import IconSettingsAdjust from '../icons/IconOperations';
import IconSettings from '../icons/IconSettings';
import IconSecurity from '../icons/IconSecurity';
import IconChevronUp from '@carbon/icons-vue/es/chevron--up/16';
import IconDataBase from '../icons/IconManagement';
import IconCalendar from '../icons/IconCalendar';
const roles = {
  administrator: 'Administrator',
  operator: 'Operator',
  readonly: 'ReadOnly',
  noaccess: 'NoAccess',
};

const AppNavigationMixin = {
  components: {
    iconOverview: IconDashboard,
    iconLogs: IconTextLinkAnalysis,
    iconHealth: IconDataCheck,
    iconControl: IconSettingsAdjust,
    iconSettings: IconSettings,
    iconSecurityAndAccess: IconSecurity,
    iconExpand: IconChevronUp,
    iconResourceManagement: IconDataBase,
    IconCalendar: IconCalendar,
  },
  data() {
    return {
      navigationItems: [
        {
          id: 'overview',
          label: this.$t('appNavigation.overview'),
          route: '/',
          icon: 'iconOverview',
        },
        {
          id: 'logs',
          label: this.$t('appNavigation.logs'),
          icon: 'iconLogs',
          children: [
            {
              id: 'event-logs',
              label: this.$t('appNavigation.eventLogs'),
              route: '/logs/event-logs',
            },
            {
              id: 'post-code-logs',
              label: this.$t('appNavigation.postCodeLogs'),
              route: '/logs/post-code-logs',
            },
            {
              id: 'dumps',
              label: this.$t('appNavigation.dumps'),
              route: '/logs/dumps',
            },
          ],
        },
        {
          id: 'hardware-status',
          label: this.$t('appNavigation.hardwareStatus'),
          icon: 'iconHealth',
          children: [
            {
              id: 'inventory',
              label: this.$t('appNavigation.inventory'),
              route: '/hardware-status/inventory',
            },
            {
              id: 'sensors',
              label: this.$t('appNavigation.sensors'),
              route: '/hardware-status/sensors',
            },
          ],
        },
        {
          id: 'operations',
          label: this.$t('appNavigation.operations'),
          icon: 'iconControl',
          children: [
            {
              id: 'firmware',
              label: this.$t('appNavigation.firmware'),
              route: '/operations/firmware',
            },
            {
              id: 'kvm',
              label: this.$t('appNavigation.kvm'),
              route: '/operations/kvm',
            },
            {
              id: 'reboot-bmc',
              label: this.$t('appNavigation.rebootBmc'),
              route: '/operations/reboot-bmc',
            },
            {
              id: 'serial-over-lan',
              label: this.$t('appNavigation.serialOverLan'),
              route: '/operations/serial-over-lan',
              exclusiveToRoles: [roles.administrator],
            },
            {
              id: 'server-power-operations',
              label: this.$t('appNavigation.serverPowerOperations'),
              route: '/operations/server-power-operations',
            },
            {
              id: 'virtual-media',
              label: this.$t('appNavigation.virtualMedia'),
              route: '/operations/virtual-media',
              exclusiveToRoles: [roles.administrator],
            },
            {
              id: 'factory-reset',
              label: this.$t('appNavigation.configuration'),
              route: '/operations/configuration',
            },
            {
              id: 'key-clear',
              label: this.$t('appNavigation.keyClear'),
              route: '/operations/key-clear',
            },
          ],
        },
        {
          id: 'resource-management',
          label: this.$t('appNavigation.resourceManagement'),
          icon: 'iconResourceManagement',
          children: [
            {
              id: 'raid-management',
              label: this.$t('appNavigation.raidManagement'),
              route: '/resource-management/raid-management',
            },
            {
              id: 'fan-control',
              label: this.$t('appNavigation.fanControl'),
              route: '/resource-management/fan-control',
            },
            {
              id: 'syslog',
              label: this.$t('appNavigation.syslog'),
              route: '/resource-management/syslog',
            },
            {
              id: 'power-restore-policy',
              label: this.$t('appNavigation.powerRestorePolicy'),
              route: '/resource-management/power-restore-policy',
            },
            {
              id: 'power',
              label: this.$t('appNavigation.power'),
              route: '/resource-management/power',
            },
          ],
        },
        {
          id: 'settings',
          label: this.$t('appNavigation.settings'),
          icon: 'iconSettings',
          children: [
            {
              id: 'date-time',
              label: this.$t('appNavigation.dateTime'),
              route: '/settings/date-time',
            },
            {
              id: 'network',
              label: this.$t('appNavigation.network'),
              route: '/settings/network',
            },
            {
              id: 'user-management',
              label: this.$t('appNavigation.userManagement'),
              route: '/settings/user-management',
              exclusiveToRoles: [roles.administrator],
            },
            {
              id: 'snmp',
              label: this.$t('appNavigation.snmp'),
              route: '/settings/snmp',
            },
            {
              id: 'smtp',
              label: this.$t('appNavigation.smtp'),
              route: '/settings/smtp',
            },
          ],
        },
        {
          id: 'security-and-access',
          label: this.$t('appNavigation.securityAndAccess'),
          icon: 'iconSecurityAndAccess',
          children: [
            {
              id: 'sessions',
              label: this.$t('appNavigation.sessions'),
              route: '/security-and-access/sessions',
            },
            {
              id: 'ldap',
              label: this.$t('appNavigation.ldap'),
              route: '/security-and-access/ldap',
            },
            {
              id: 'policies',
              label: this.$t('appNavigation.policies'),
              route: '/security-and-access/policies',
            },
            {
              id: 'certificates',
              label: this.$t('appNavigation.certificates'),
              route: '/security-and-access/certificates',
            },
          ],
        },
      ],
    };
  },
};

export default AppNavigationMixin;
