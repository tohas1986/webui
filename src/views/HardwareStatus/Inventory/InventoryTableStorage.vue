<template>
  <page-section :section-title="$t('pageInventory.storage')">
    <div class="table-container">
      <b-table
        no-sort-reset
        hover
        responsive
        :items="items"
        :fields="fields"
        show-empty
        :empty-text="$t('global.table.emptyMessage')"
        :busy="isBusy"
      >
        <!-- Toggle identify LED -->
        <template #cell(identifyLed)="row">
          <b-form-checkbox
            v-if="hasIdentifyLed(row.item.identifyLed)"
            v-model="row.item.identifyLed"
            name="switch"
            switch
            @change="toggleIdentifyLedValue(row.item)"
          >
            <span v-if="row.item.identifyLed">
              {{ $t('global.status.on') }}
            </span>
            <span v-else> {{ $t('global.status.off') }} </span>
          </b-form-checkbox>
          <div v-else>--</div>
        </template>
        <template #cell(size)="{ value }"> {{ formatSize(value) }} </template>
      </b-table>
    </div>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  components: { PageSection },
  mixins: [BVToastMixin, DataFormatterMixin],
  data() {
    return {
      isBusy: true,
      fields: [
        {
          key: 'manufacturer',
          label: this.$t('pageInventory.table.manufacturer'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'partNumber',
          label: this.$t('pageInventory.table.partNumber'),
          formatter: this.dataFormatter,
        },
        {
          key: 'serialNumber',
          label: this.$t('pageInventory.table.storageSerialNumber'),
          formatter: this.dataFormatter,
        },
        {
          key: 'model',
          label: this.$t('pageInventory.table.model'),
          formatter: this.dataFormatter,
        },
        {
          key: 'firmwareVersion',
          label: this.$t('pageInventory.table.firmwareVersion'),
          formatter: this.dataFormatter,
        },
        {
          key: 'speed',
          label: this.$t('pageInventory.table.speed'),
          formatter: this.dataFormatter,
        },
        {
          key: 'size',
          label: this.$t('pageInventory.table.size'),
          formatter: this.dataFormatter,
        },
        {
          key: 'wear',
          label: this.$t('pageInventory.table.wear'),
          formatter: this.dataFormatter,
        },
        {
          key: 'location',
          label: this.$t('pageInventory.table.location'),
          formatter: this.dataFormatter,
        },
      ],
    };
  },
  computed: {
    storages() {
      return this.$store.getters['storages/storages'];
    },
    items() {
      if (this.storages) {
        return this.storages;
      } else {
        return [];
      }
    },
  },
  created() {
    this.$store.dispatch('storages/getStorageInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-assembly-complete');
      this.isBusy = false;
    });
  },
  methods: {
    toggleIdentifyLedValue(row) {
      this.$store
        .dispatch('storage/updateIdentifyLedValue', {
          uri: row.uri,
          memberId: row.id,
          identifyLed: row.identifyLed,
        })
        .catch(({ message }) => this.errorToast(message));
    },
    hasIdentifyLed(identifyLed) {
      return typeof identifyLed === 'boolean';
    },
    formatSize(kb) {
      const units = ['KB', 'MB', 'GB', 'TB'];
      let size = kb;
      let i = 0;

      while (size >= 1024 && i < units.length - 1) {
        size = size / 1024;
        i++;
      }

      return size.toFixed(2) + ' ' + units[i];
    },
  },
};
</script>
