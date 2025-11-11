<template>
  <b-container fluid>
    <div class="d-flex align-items-center justify-content-between">
      <page-title />
    </div>
    <div class="table-container">
      <b-table
        responsive="md"
        :items="raidItems"
        :fields="fields"
        show-empty
        :empty-text="$t('global.table.emptyMessage')"
        :busy="isBusy || isLocked"
      >
        <!-- Expand chevron icon -->
        <template #cell(expandRow)="row">
          <b-button
            variant="link"
            :title="expandRowLabel"
            class="btn-icon-only"
            :disabled="row.item.state === 'Updating' || isLocked"
            @click="toggleRowDetails(row)"
          >
            <icon-chevron />
            <span class="sr-only">{{ expandRowLabel }}</span>
          </b-button>
        </template>

        <template #cell(state)="{ value, item }">
          <div v-if="value === 'Active'">
            <status-color status="success" />
            <span class="text-status">{{ value }} </span>
          </div>
          <div v-else>
            <status-color status="warning" />
            <span class="text-status">{{ value }}: {{ item.progress }}% </span>
          </div>
        </template>

        <template #cell(actions)="{ value, item }">
          <table-row-action
            v-for="(action, index) in value"
            :key="index"
            :value="action.value"
            :title="action.title"
            :enabled="action.enabled && !isLocked"
            @click-table-action="onTableRowAction($event, item)"
          >
            <template #icon>
              <icon-replace v-if="action.value === 'update'" />
            </template>
          </table-row-action>
        </template>
        <template #cell(eventLogs)="row">
          <b-button
            variant="link"
            class="btn-logs"
            :disabled="isLocked"
            @click="goToEventLogs(row.item)"
          >
            {{ $t('pageRaidManagement.table.show') }}
          </b-button>
        </template>

        <template #row-details="{ item }">
          <b-container fluid>
            <b-row v-if="item.links.Drives != 0">
              <b-col class="mt-4" sm="12">
                <b-row>
                  <b-col sm="12">
                    <h3>{{ $t('pageRaidManagement.table.physicalDrive') }}</h3>
                  </b-col>
                </b-row>
                <div v-for="drive in item.drives" :key="drive.id">
                  <b-card no-body>
                    <b-list-group>
                      <b-list-group-item>
                        <b-row>
                          <b-col sm="12" lg="4">
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.driveId') }}:
                              </dt>
                              <dd>{{ drive.DriveId }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.name') }}:
                              </dt>
                              <dd>{{ drive.Name }}</dd>
                            </dl>
                          </b-col>
                          <b-col sm="12" lg="4">
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.model') }}:
                              </dt>
                              <dd>{{ drive.Model }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.driveState') }}:
                              </dt>
                              <dd>{{ drive.DriveState }}</dd>
                            </dl>
                          </b-col>
                          <b-col
                            sm="12"
                            lg="4"
                            class="d-flex align-items-center"
                          >
                            <b-button
                              v-b-toggle="`collapse-${drive.Id}`"
                              class="m-1 ml-auto"
                              >{{
                                $t('pageRaidManagement.table.moreInfo')
                              }}</b-button
                            >
                          </b-col>
                        </b-row>
                      </b-list-group-item>
                    </b-list-group>
                  </b-card>
                  <div>
                    <b-collapse :id="`collapse-${drive.Id}`">
                      <b-card>
                        <b-row>
                          <b-col sm="6" lg="4">
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.driveId') }}:
                              </dt>
                              <dd>{{ drive.DriveId }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.name') }}:
                              </dt>
                              <dd>{{ drive.Name }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.model') }}:
                              </dt>
                              <dd>{{ drive.Model }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{
                                  $t('pageRaidManagement.table.manufacturer')
                                }}:
                              </dt>
                              <dd>{{ drive.Manufacturer }}</dd>
                            </dl>
                          </b-col>
                          <b-col sm="6" lg="4">
                            <dl>
                              <dt>
                                {{
                                  $t(
                                    'pageRaidManagement.table.firmwareVersion',
                                  )
                                }}:
                              </dt>
                              <dd>{{ drive.FirmwareVersion }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{
                                  $t('pageRaidManagement.table.serialNumber')
                                }}:
                              </dt>
                              <dd>{{ drive.SerialNumber }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.mediaType') }}:
                              </dt>
                              <dd>{{ drive.MediaType }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.capacity') }}:
                              </dt>
                              <dd>{{ formatBytes(drive.CapacityBytes) }}</dd>
                            </dl>
                          </b-col>
                          <b-col sm="6" lg="4">
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.protocol') }}:
                              </dt>
                              <dd>{{ drive.Protocol }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{
                                  $t('pageRaidManagement.table.temperature')
                                }}:
                              </dt>
                              <dd>{{ drive.Temperature }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.driveState') }}:
                              </dt>
                              <dd>{{ drive.DriveState }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.linkSpeed') }}:
                              </dt>
                              <dd>{{ drive.NegotiatedSpeedGbs }}</dd>
                            </dl>
                          </b-col>
                        </b-row>
                      </b-card>
                    </b-collapse>
                  </div>
                </div>
              </b-col>
            </b-row>
            <b-row v-else>
              <b-col class="mt-4" sm="12">
                <b-row>
                  <b-col sm="12">
                    <h3>
                      {{ $t('pageRaidManagement.table.physicalNoDrive') }}
                    </h3>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
            <b-row v-if="item.links.Volumes != 0" class="mt-3">
              <b-col class="mt-4" sm="12">
                <b-row>
                  <b-col sm="12">
                    <b-row>
                      <b-col sm="6" class="d-flex align-items-end">
                        <h3>{{ $t('pageRaidManagement.table.volumes') }}</h3>
                      </b-col>
                      <b-col sm="6" class="btn-raid-container">
                        <b-button @click="addConfig(item)"
                          >{{ $t('pageRaidManagement.table.btnAddConfig') }}
                          <icon-add />
                        </b-button>
                        <b-button @click="clearConfig(item)">
                          {{ $t('pageRaidManagement.table.btnClearConfig') }}
                          <icon-delete />
                        </b-button>
                      </b-col>
                    </b-row>
                  </b-col>
                </b-row>
                <div v-for="volume in item.volumes" :key="volume.id">
                  <b-card no-body>
                    <b-list-group>
                      <b-list-group-item>
                        <b-row>
                          <b-col sm="4">
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.name') }}:
                              </dt>
                              <dd>{{ volume.Name }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.type') }}:
                              </dt>
                              <dd>{{ volume.RAIDType }}</dd>
                            </dl>
                          </b-col>
                          <b-col sm="4">
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.driveState') }}:
                              </dt>
                              <dd>{{ volume.DriveState }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{
                                  $t('pageRaidManagement.table.physicalDrive')
                                }}:
                              </dt>
                              <dd>
                                <b-badge
                                  v-for="name in item.volumeDriveId"
                                  :key="name.id"
                                  pill
                                  variant="primary"
                                  class="mr-1"
                                  >{{ $t('pageRaidManagement.table.driveId') }}
                                  {{ name }}</b-badge
                                >
                              </dd>
                            </dl>
                          </b-col>
                          <b-col sm="4" class="d-flex align-items-center">
                            <b-button
                              v-b-toggle="`collapse-${volume.Id}`"
                              class="m-1 ml-auto"
                              >{{
                                $t('pageRaidManagement.table.moreInfo')
                              }}</b-button
                            >
                          </b-col>
                        </b-row>
                      </b-list-group-item>
                    </b-list-group>
                  </b-card>
                  <div>
                    <b-collapse :id="`collapse-${volume.Id}`">
                      <b-card>
                        <b-row>
                          <b-col sm="4">
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.name') }}:
                              </dt>
                              <dd>{{ volume.Name }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.type') }}:
                              </dt>
                              <dd>{{ volume.RAIDType }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{
                                  $t('pageRaidManagement.table.accessPolicy')
                                }}:
                              </dt>
                              <dd>{{ volume.AccessPolicy }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{
                                  $t(
                                    'pageRaidManagement.table.diskCachePolicy',
                                  )
                                }}:
                              </dt>
                              <dd>{{ volume.DiskCachePolicy }}</dd>
                            </dl>
                          </b-col>
                          <b-col sm="4">
                            <dl>
                              <dt>
                                {{
                                  $t(
                                    'pageRaidManagement.table.readCachePolicy',
                                  )
                                }}:
                              </dt>
                              <dd>{{ volume.ReadCachePolicy }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{
                                  $t('pageRaidManagement.table.cachePolicy')
                                }}:
                              </dt>
                              <dd>{{ volume.IOCachePolicy }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.capacity') }}:
                              </dt>
                              <dd>{{ formatBytes(volume.CapacityBytes) }}</dd>
                            </dl>
                          </b-col>
                          <b-col sm="4">
                            <dl>
                              <dt>
                                {{
                                  $t(
                                    'pageRaidManagement.table.writeCachePolicy',
                                  )
                                }}:
                              </dt>
                              <dd>{{ volume.WriteCachePolicy }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{ $t('pageRaidManagement.table.encrypted') }}:
                              </dt>
                              <dd>{{ volume.Encrypted }}</dd>
                            </dl>
                            <dl>
                              <dt>
                                {{
                                  $t(
                                    'pageRaidManagement.table.logicalDriveState',
                                  )
                                }}:
                              </dt>
                              <dd>{{ volume.DriveState }}</dd>
                            </dl>
                          </b-col>
                        </b-row>
                      </b-card>
                    </b-collapse>
                  </div>
                </div>
              </b-col>
            </b-row>
            <b-row v-else>
              <b-col class="mt-4" sm="12">
                <b-row>
                  <b-col sm="12">
                    <b-row>
                      <b-col sm="6">
                        <h3>
                          {{ $t('pageRaidManagement.table.volumesNo') }}
                        </h3></b-col
                      >
                      <b-col
                        v-if="item.links.Drives != 0"
                        sm="6"
                        class="d-flex align-items-center"
                      >
                        <b-button class="ml-auto" @click="addConfig(item)"
                          >{{ $t('pageRaidManagement.table.btnAddConfig') }}
                          <icon-add
                        /></b-button>
                      </b-col>
                    </b-row>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
          </b-container>
        </template>
      </b-table>
    </div>

    <modal-add-config :config="modalAddConfig" @ok="saveConfig" />
    <modal-update-raid :update="modalUpdate" @ok="onModalOk" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import ModalAddConfig from './ModalAddConfig';
import IconAdd from '@/components/icons/IconAdd';
import IconDelete from '@/components/icons/IconTrashcan';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import ModalUpdateRaid from './ModalUpdateRaid';
import StatusColor from '@/components/Global/StatusColor';
import IconReplace from '@carbon/icons-vue/es/renew/20';
import TableRowAction from '@/components/Global/TableRowAction';

export default {
  name: 'RaidManagement',
  components: {
    PageTitle,
    IconChevron,
    IconAdd,
    IconDelete,
    ModalAddConfig,
    ModalUpdateRaid,
    StatusColor,
    IconReplace,
    TableRowAction,
  },
  mixins: [
    TableRowExpandMixin,
    DataFormatterMixin,
    LoadingBarMixin,
    BVToastMixin,
  ],
  data() {
    return {
      isBusy: true,
      isLocked: false,
      expandRowLabel: expandRowLabel,
      modalAddConfig: null,
      modalUpdate: null,
      isUpdating: true,
      intervalId: null,
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
        },
        {
          key: 'name',
          label: this.$t('pageRaidManagement.table.name'),
          formatter: this.dataFormatter,
        },
        {
          key: 'model',
          label: this.$t('pageRaidManagement.table.model'),
          formatter: this.dataFormatter,
        },
        {
          key: 'serialNumber',
          label: this.$t('pageRaidManagement.table.serialNumber'),
          formatter: this.dataFormatter,
        },
        {
          key: 'firmwareVersion',
          label: this.$t('pageRaidManagement.table.firmwareVersion'),
          formatter: this.dataFormatter,
        },
        {
          key: 'state',
          label: this.$t('pageRaidManagement.table.state'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'eventLogs',
          label: this.$t('pageRaidManagement.table.eventLogs'),
        },
        {
          key: 'actions',
          label: this.$t('pageRaidManagement.table.actions'),
          tdClass: 'text-nowrap',
        },
      ],
    };
  },
  computed: {
    raids() {
      return this.$store.getters['raid/raids'];
    },
    progress() {
      return this.$store.getters['raid/progress'];
    },
    stateRaid() {
      return this.$store.getters['raid/stateRaid'];
    },
    raidItems() {
      return this.raids.map((raid) => {
        return {
          ...raid,
          actions: [
            {
              value: 'update',
              title: this.$t('pageRaidManagement.table.updateRaid'),
              enabled: raid.state === 'Active' ? true : false,
            },
          ],
        };
      });
    },
  },
  watch: {
    stateRaid(value) {
      this.isUpdating = value[0];
    },
  },
  mounted() {
    this.startLoader();
    this.$store.dispatch('raid/getData').finally(() => {
      this.endLoader();
      this.isBusy = false;
    });
    this.toggleUpdating();
  },
  beforeDestroy() {
    this.stopUpdatingRaid();
  },
  methods: {
    addConfig(volumeData) {
      this.modalAddConfig = volumeData;
      this.$bvModal.show('add-config');
    },
    clearConfig(volumeData) {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageRaidManagement.modal.deleteMessage'), {
          title: this.$t('pageRaidManagement.modal.deleteTitle'),
          okTitle: this.$t('global.action.delete'),
          okVariant: 'danger',
          cancelTitle: this.$t('global.action.cancel'),
          size: 'lg',
          centered: true,
        })
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.infoToast(this.$t('pageRaidManagement.toast.deletingVolume'));
            this.isLocked = true;
            this.startLoader();
            this.$store
              .dispatch('raid/clearConfig', volumeData.id)
              .then(() => this.waitUntilVolumesCleared(volumeData.id))
              .then(() => {
                this.successToast(
                  this.$t('pageRaidManagement.toast.clearConfigSuccessfully'),
                );
                return this.$store.dispatch('raid/getData');
              })
              .catch((err) => {
                console.error('[waitUntilVolumesCleared] Failed:', err);
                this.errorToast(
                  this.$t('pageRaidManagement.toast.clearConfigError'),
                );
              })
              .finally(() => {
                this.endLoader();
                this.isLocked = false;
              });
          }
        });
    },
    waitUntilVolumesCleared(controllerId, timeout = 30000, interval = 2000) {
      const startTime = Date.now();

      const poll = async (resolve, reject) => {
        await this.$store.dispatch('raid/getData');

        const controller = this.$store.getters['raid/raids'].find(
          (item) => item.id === controllerId,
        );

        const volumesLinkCount = controller?.links?.Volumes?.length ?? 0;
        const hasDriveRefs = controller?.volumeDriveId?.length ?? 0;

        console.log('Polling RAID controller for cleared volumes:', {
          controllerId,
          volumesLinkCount,
          hasDriveRefs,
          controller,
        });

        if (volumesLinkCount === 0 && hasDriveRefs === 0) {
          resolve();
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for RAID volumes to be cleared.'));
        } else {
          setTimeout(() => poll(resolve, reject), interval);
        }
      };

      return new Promise(poll);
    },
    waitUntilVolumeCreated(controllerId, timeout = 30000, interval = 2000) {
      const startTime = Date.now();

      const poll = async (resolve, reject) => {
        await this.$store.dispatch('raid/getData');

        const controller = this.$store.getters['raid/raids'].find(
          (item) => item.id === controllerId,
        );

        const volumesLinkCount = controller?.links?.Volumes?.length ?? 0;

        console.log('Polling for new volume:', {
          controllerId,
          volumesLinkCount,
          controller,
        });

        if (volumesLinkCount > 0) {
          resolve();
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for new RAID volume to appear.'));
        } else {
          setTimeout(() => poll(resolve, reject), interval);
        }
      };

      return new Promise(poll);
    },
    saveConfig(volumeData, id) {
      this.infoToast(this.$t('pageRaidManagement.toast.creatingVolume'));
      this.isLocked = true;
      this.startLoader();
      this.$store
        .dispatch('raid/addConfig', {
          id: id,
          data: volumeData,
        })
        .then(() => {
          return this.waitUntilVolumeCreated(id);
        })
        .then(() => {
          this.successToast(
            this.$t('pageRaidManagement.toast.addConfigSuccessfully'),
          );
          return this.$store.dispatch('raid/getData');
        })
        .catch((err) => {
          console.error('[waitUntilVolumeCreated] Failed:', err);
          this.errorToast(this.$t('pageRaidManagement.toast.addConfigError'));
        })
        .finally(() => {
          this.endLoader();
          this.isLocked = false;
        });
    },
    onTableRowAction(event, rowItem) {
      switch (event) {
        case 'update':
          this.initModalUpdateRaid(rowItem);
          break;
        default:
          break;
      }
    },
    initModalUpdateRaid(update) {
      this.modalUpdate = update;
      this.$bvModal.show('update-raid');
    },
    onModalOk({ file, type, id }) {
      this.startLoader();
      this.$store
        .dispatch('raid/updateRaid', {
          id,
          type,
          file,
        })
        .then(() => {
          this.successToast(
            this.$t('pageRaidManagement.toast.updateRaidSuccessfully'),
          );
        })
        .catch(() =>
          this.errorToast(this.$t('pageRaidManagement.toast.updateRaidError')),
        )
        .finally(() => this.endLoader());
    },
    updateProgress() {
      return this.raidItems.map((item) => item.progress);
    },
    fetchDataRaid() {
      this.$store.dispatch('raid/getData');
    },
    goToEventLogs(item) {
      const controllerId = item.id;
      this.$router.push({
        name: 'raid-event-logs',
        params: { controllerId },
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
          this.fetchDataRaid();
        } else {
          this.stopUpdatingRaid();
        }
      }, 10000);
    },
    stopUpdatingRaid() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.list-group-item,
.card-body {
  border: 1px solid $border-color;
}

.table .b-table-details td {
  padding-top: 0;
}

.btn-secondary {
  margin-bottom: 20px;
  padding: 0.5rem 1rem;
  text-wrap: nowrap;
  svg {
    margin-left: 1.25rem;
    margin-right: 0;
  }
}

.btn-raid-container {
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
}

.btn-link {
  color: $purple;
  font-weight: 400;
  font-size: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  text-wrap: nowrap;

  &:hover {
    span {
      text-decoration: underline;
    }
  }
}

.btn-logs {
  width: auto !important;
  color: #272b32;
  font-weight: 500;
  font-size: clamp(0.875rem, 0.1071rem + 0.9524vw, 1.25rem);
  text-wrap: nowrap;

  &:hover {
    color: $purple;
  }
}
</style>
