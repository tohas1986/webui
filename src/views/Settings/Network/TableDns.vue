<template>
  <div class="section-container">
    <page-section>
      <h3>{{ $t('pageNetwork.staticDns') }}</h3>
      <b-row class="btn-wrapper">
        <b-col>
          <div class="btn-block">
            <b-button @click="initDnsModal()">
              {{ $t('pageNetwork.table.addDnsAddress') }}
              <icon-add />
            </b-button>
          </div>
          <div class="table-container">
            <b-table
              responsive="md"
              hover
              :fields="dnsTableFields"
              :items="form.dnsStaticTableItems"
              :empty-text="$t('global.table.emptyMessage')"
              class="mb-0"
              show-empty
            >
              <template #cell(actions)="{ item, index }">
                <table-row-action
                  v-for="(action, actionIndex) in item.actions"
                  :key="actionIndex"
                  :value="action.value"
                  :title="action.title"
                  :enabled="action.enabled"
                  @click-table-action="onDnsTableAction(action, $event, index)"
                >
                  <template #icon>
                    <icon-edit v-if="action.value === 'edit'" />
                    <icon-trashcan v-if="action.value === 'delete'" />
                  </template>
                </table-row-action>
              </template>
            </b-table>
          </div>
        </b-col>
      </b-row>
    </page-section>
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconAdd from '@/components/icons/IconAdd';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconTrashcan from '@/components/icons/IconTrashcan';
import PageSection from '@/components/Global/PageSection';
import TableRowAction from '@/components/Global/TableRowAction';
import { mapState } from 'vuex';

export default {
  name: 'DNSTable',
  components: {
    IconAdd,
    IconEdit,
    IconTrashcan,
    PageSection,
    TableRowAction,
  },
  mixins: [BVToastMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      form: {
        dnsStaticTableItems: [],
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
      dnsTableFields: [
        {
          key: 'address',
          label: this.$t('pageNetwork.table.ipAddress'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
      this.getStaticDnsItems();
    },
    ethernetData() {
      this.getStaticDnsItems();
    },
  },
  created() {
    this.getStaticDnsItems();
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('network-table-dns-complete');
    });
  },
  methods: {
    getStaticDnsItems() {
      const index = this.tabIndex;
      const dns = this.ethernetData[index].StaticNameServers || [];
      this.form.dnsStaticTableItems = dns.map((server) => {
        return {
          address: server,
          actions: [
            {
              value: 'edit',
              title: this.$t('pageNetwork.table.editDns'),
            },
            {
              value: 'delete',
              title: this.$t('pageNetwork.table.deleteDns'),
            },
          ],
        };
      });
    },
    onDnsTableAction(action, $event, index) {
      if ($event === 'delete') {
        this.deleteDnsTableRow(index);
      }
      if ($event === 'edit') {
        this.editDnsTableRow(index);
      }
    },
    editDnsTableRow(index) {
      const dnsItem = this.form.dnsStaticTableItems[index].address;
      this.$root.$emit('start-edit-dns', dnsItem, index);
      this.$bvModal.show('modal-dns');
    },
    deleteDnsTableRow(index) {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageNetwork.modal.deleteMessage'), {
          title: this.$t('pageNetwork.modal.deleteTitle'),
          okTitle: this.$t('global.action.delete'),
          okVariant: 'danger',
          cancelTitle: this.$t('global.action.cancel'),
          size: 'lg',
          centered: true,
        })
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.form.dnsStaticTableItems.splice(index, 1);
            const newDnsArray = this.form.dnsStaticTableItems.map((dns) => {
              return dns.address;
            });
            this.$store
              .dispatch('network/editDnsAddress', newDnsArray)
              .then((message) => this.successToast(message))
              .catch(({ message }) => this.errorToast(message));
          }
        });
    },
    initDnsModal() {
      this.$bvModal.show('modal-dns');
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
    align-items: flex-start;

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
