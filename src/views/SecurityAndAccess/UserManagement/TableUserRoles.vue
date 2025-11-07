<template>
  <div>
    <b-row>
      <b-col sm="2" class="align-content-center">
        <h2>{{ $t('pageUserManagement.roles') }}</h2>
      </b-col>
      <b-col sm="10" class="btn-secondary-container">
        <b-button variant="secondary" @click="initModalRole(null)">
          {{ $t('pageUserManagement.addRole') }}
          <icon-add />
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="12">
        <div class="table-container">
          <b-table
            ref="table"
            responsive="md"
            selectable
            show-empty
            sticky-header
            no-select-on-click
            hover
            :busy="isBusy"
            :fields="fields"
            :items="tableItems"
            :empty-text="$t('global.table.emptyMessage')"
            @row-selected="onRowSelected($event, tableItems.length)"
          >
            <!-- table actions column -->
            <template #cell(actions)="{ item }">
              <table-row-action
                v-for="(action, index) in item.actions"
                :key="index"
                :value="action.value"
                :enabled="action.enabled"
                :title="action.title"
                @click-table-action="onTableRowAction($event, item)"
              >
                <template #icon>
                  <icon-trashcan
                    v-if="action.value === 'delete'"
                    :data-test-id="`userManagement-tableRowAction-delete-${index}`"
                  />
                </template>
              </table-row-action>
            </template>
          </b-table>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import IconAdd from '@/components/icons/IconAdd';
import IconTrashcan from '@/components/icons/IconTrashcan';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableRowAction from '@/components/Global/TableRowAction';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  components: { IconAdd, IconTrashcan, TableRowAction },
  mixins: [BVTableSelectableMixin, BVToastMixin, LoadingBarMixin],
  data() {
    return {
      isBusy: true,
      fields: [
        {
          key: 'roleId',
          label: this.$t('pageUserManagement.table.roleId'),
        },
        {
          key: 'assignedPrivileges',
          label: this.$t('pageUserManagement.table.assignedPrivileges'),
        },
        {
          key: 'oemPrivileges',
          label: this.$t('pageUserManagement.table.oemPrivileges'),
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      tableToolbarActions: [
        {
          value: 'delete',
          label: this.$t('global.action.delete'),
        },
        {
          value: 'enable',
          label: this.$t('global.action.enable'),
        },
        {
          value: 'disable',
          label: this.$t('global.action.disable'),
        },
      ],
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
    };
  },
  computed: {
    allRoles() {
      return this.$store.getters['userManagement/allAccountRoles'];
    },
    tableItems() {
      return this.allRoles.map((role) => {
        return {
          roleId: role.RoleId,
          assignedPrivileges: role.AssignedPrivileges.toString()
            .split(',')
            .join(', '),
          oemPrivileges: role.OemPrivileges.toString().split(',').join(', '),
          actions: [
            {
              value: 'delete',
              enabled:
                role.RoleId === 'Administrator'
                  ? false
                  : true && role.RoleId === 'Operator'
                    ? false
                    : true && role.RoleId === 'ReadOnly'
                      ? false
                      : true,
              title: this.$tc('pageUserManagement.deleteUser'),
            },
          ],
          ...role,
        };
      });
    },
  },
  created() {
    this.$store.dispatch('userManagement/getAccountRoles').finally(() => {
      this.isBusy = false;
    });
  },
  methods: {
    editEnable(role) {
      if (
        role.RoleId === 'Administrator' ||
        role.RoleId === 'Operator' ||
        role.RoleId === 'ReadOnly'
      ) {
        return false;
      } else {
        return true;
      }
    },
    deleteRoles({ roleId }) {
      this.startLoader();
      this.$store
        .dispatch('userManagement/deleteRoles', roleId)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    initModalRole() {
      this.$bvModal.show('modal-role');
    },
    initModalDeleteRoles(role) {
      console.log(role.RoleId);
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageUserManagement.modal.deleteConfirmMessageRoles', {
            role: role.RoleId,
          }),
          {
            title: this.$tc('pageUserManagement.deleteRoles'),
            okTitle: this.$tc('pageUserManagement.deleteRoles'),
            cancelTitle: this.$t('global.action.cancel'),
            centered: true,
          },
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.deleteRoles(role);
          }
        });
    },
    onTableRowAction(action, row) {
      switch (action) {
        case 'edit':
          this.initModalRole(row);
          break;
        case 'delete':
          this.initModalDeleteRoles(row);
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.btn-secondary {
  margin-bottom: 20px;
  padding: clamp(0.625rem, 0.1131rem + 0.6349vw, 0.875rem)
    clamp(1rem, -0.0238rem + 1.2698vw, 1.5rem);

  @media (max-width: 1110px) {
    font-size: 0.7rem;
    padding: 0.6rem;
  }

  svg {
    margin-left: 1.25rem;
    margin-right: 0;

    @media (max-width: 1110px) {
      margin-left: 1rem;
    }
  }
}

.btn-secondary-container {
  flex-wrap: wrap;
  @include media-breakpoint-down(sm) {
    justify-content: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    font-size: 0.6rem;
    width: 100%;
    max-width: unset !important;
    flex: 0 0 100% !important;

    .btn-secondary {
      margin-bottom: 0;
    }
  }
}
</style>
