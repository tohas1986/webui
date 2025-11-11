<template>
  <div class="section-container">
    <page-section>
      <h3>{{ $t('pageNetwork.ipv4') }}</h3>
      <b-row class="mb-4">
        <b-col lg="2" md="6">
          <dl>
            <dt>{{ $t('pageNetwork.dhcp') }}</dt>
            <dd>
              <b-form-checkbox
                id="dhcpSwitch"
                v-model="dhcpEnabledState"
                data-test-id="networkSettings-switch-dhcpEnabled"
                switch
                @change="changeDhcpEnabledState"
              >
                <span v-if="dhcpEnabledState">
                  {{ $t('global.status.enabled') }}
                </span>
                <span v-else>{{ $t('global.status.disabled') }}</span>
              </b-form-checkbox>
            </dd>
          </dl>
        </b-col>
      </b-row>
      <b-row class="btn-wrapper">
        <b-col>
          <h3>
            {{ $t('pageNetwork.ipv4Addresses') }}
          </h3>
        </b-col>
        <b-col class="btn-block">
          <b-button @click="initAddIpv4Address()">
            {{ $t('pageNetwork.table.addIpv4Address') }}
            <icon-add />
          </b-button>
        </b-col>
      </b-row>
      <div class="table-container">
        <b-table
          responsive="md"
          hover
          :fields="ipv4TableFields"
          :items="form.ipv4TableItems"
          :empty-text="$t('global.table.emptyMessage')"
          class="mb-0"
          show-empty
        >
          <template #cell(actions)="{ item, index }">
            <table-row-action
              v-for="(action, actionIndex) in filteredActions(item)"
              :key="actionIndex"
              :value="action.value"
              :title="action.title"
              :enabled="action.enabled"
              @click-table-action="onIpv4TableAction(action, $event, index)"
            >
              <template #icon>
                <icon-edit v-if="action.value === 'edit'" />
                <icon-trashcan v-if="action.value === 'delete'" />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </div>
    </page-section>
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconAdd from '@/components/icons/IconAdd';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconTrashcan from '@/components/icons/IconTrashcan';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import PageSection from '@/components/Global/PageSection';
import TableRowAction from '@/components/Global/TableRowAction';
import { mapState } from 'vuex';

export default {
  name: 'Ipv4Table',
  components: {
    IconAdd,
    IconEdit,
    IconTrashcan,
    PageSection,
    TableRowAction,
  },
  mixins: [BVToastMixin, LoadingBarMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      form: {
        ipv4TableItems: [],
      },
      actions: [
        {
          value: 'edit',
          title: this.$t('global.action.edit'),
        },
        {
          value: 'delete',
          title: this.$t('global.action.delete'),
        },
      ],
      ipv4TableFields: [
        {
          key: 'Address',
          label: this.$t('pageNetwork.table.ipAddress'),
        },
        {
          key: 'Gateway',
          label: this.$t('pageNetwork.table.gateway'),
        },
        {
          key: 'SubnetMask',
          label: this.$t('pageNetwork.table.subnet'),
        },
        {
          key: 'AddressOrigin',
          label: this.$t('pageNetwork.table.addressOrigin'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
    selectedInterface() {
      return this.$store.getters['network/selectedInterfaceIndex'];
    },
    dhcpEnabledState: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][
          this.selectedInterface
        ].dhcpEnabled;
      },
      set(newValue) {
        return newValue;
      },
    },
    filteredActions() {
      return (item) => {
        if (item.AddressOrigin === 'DHCP') {
          return item.actions.filter((action) => action.value !== 'delete');
        } else {
          return item.actions;
        }
      };
    },
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
      this.getIpv4TableItems();
    },
    ethernetData() {
      this.getIpv4TableItems();
    },
  },
  created() {
    this.getIpv4TableItems();
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('network-table-ipv4-complete');
    });
  },
  methods: {
    getIpv4TableItems() {
      const index = this.tabIndex;
      const addresses = this.ethernetData[index].IPv4Addresses || [];
      this.form.ipv4TableItems = addresses.map((ipv4) => {
        return {
          Address: ipv4.Address,
          SubnetMask: ipv4.SubnetMask,
          Gateway: ipv4.Gateway,
          AddressOrigin: ipv4.AddressOrigin,
          actions: [
            {
              value: 'delete',
              title: this.$t('pageNetwork.table.deleteIpv4'),
            },
          ],
        };
      });
    },
    onIpv4TableAction(action, $event, index) {
      if ($event === 'delete') {
        this.deleteIpv4TableRow(index);
      }
    },
    deleteIpv4TableRow(index) {
      this.form.ipv4TableItems.splice(index, 1);
      const newIpv4Array = this.form.ipv4TableItems.map((ipv4) => {
        const { Address, SubnetMask, Gateway } = ipv4;
        return {
          Address,
          SubnetMask,
          Gateway,
        };
      });
      this.$store
        .dispatch('network/editIpv4Address', newIpv4Array)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    initAddIpv4Address() {
      this.$bvModal.show('modal-add-ipv4');
    },
    changeDhcpEnabledState(state) {
      this.$bvModal
        .msgBoxConfirm(
          state
            ? this.$t('pageNetwork.modal.confirmEnableDhcp')
            : this.$t('pageNetwork.modal.confirmDisableDhcp'),
          {
            title: this.$t('pageNetwork.modal.dhcpConfirmTitle', {
              dhcpState: state
                ? this.$t('global.action.enable')
                : this.$t('global.action.disable'),
            }),
            okTitle: state
              ? this.$t('global.action.enable')
              : this.$t('global.action.disable'),
            okVariant: 'danger',
            cancelTitle: this.$t('global.action.cancel'),
          },
        )
        .then((dhcpEnableConfirmed) => {
          if (dhcpEnableConfirmed) {
            this.$store
              .dispatch('network/saveDhcpEnabledState', state)
              .then((message) => this.successToast(message))
              .catch(({ message }) => this.errorToast(message));
          } else {
            let onDhcpCancel = document.getElementById('dhcpSwitch');
            onDhcpCancel.checked = !state;
          }
        });
    },
  },
};
</script>

<style lang="scss" scoped>
h3 {
  margin-bottom: 40px;
}

dd {
  margin-top: 12px;
}

.btn-secondary {
  margin-bottom: 20px;
  padding: clamp(0.625rem, 0.1131rem + 0.6349vw, 0.875rem)
    clamp(1rem, -0.0238rem + 1.2698vw, 1.5rem);

  svg {
    margin-left: 1.25rem;
    margin-right: 0;
  }
}

h3 {
  margin-bottom: 40px;
  @include media-breakpoint-down(sm) {
    margin-bottom: 0.5rem !important;
  }
}

.btn-wrapper {
  @include media-breakpoint-down(sm) {
    flex-direction: column;

    .btn-secondary {
      font-size: clamp(0.7rem, 0.1071rem + 0.9524vw, 1.125rem);
    }
  }
}

.btn-block {
  text-align: right;
  @include media-breakpoint-down(sm) {
    text-align: left;
  }
}
</style>
