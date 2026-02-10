<template>
  <page-section>
    <b-card bg-variant="white" border-variant="white" no-body class="p-0 mb-1">
      <h4>{{ $t('pageThermalControl.fans.summary') }}</h4>
      <div class="info-con">
        <div class="info-item pr-5">
          <svg-icon data-icon-name="total" class-name="total mr-2" />
          <span class="left-span">{{ $t('pageInventory.table.total') }}: </span>
          <span class="value-span">{{ fansTotal.total }}</span>
        </div>
        <div class="info-item pl-5">
          <svg-icon data-icon-name="present" class-name="present mr-2" />
          <span class="left-span"
            >{{ $t('pageThermalControl.fans.present') }}:
          </span>
          <span class="value-span">{{ fansTotal.Present }}</span>
        </div>
      </div>
    </b-card>
    <h4 class="mt-4 pb-2">{{ $t('pageThermalControl.fans.details') }}</h4>
    <div>
      <b-table-simple ref="table" borderless responsive="md" caption-top>
        <b-thead class="th-lightblue">
          <b-tr>
            <b-th>{{ $t('pageThermalControl.fans.fan') }}</b-th>
            <b-th>{{ $t('pageThermalControl.fans.location') }}</b-th>
            <b-th>{{ $t('pageThermalControl.fans.status') }}</b-th>
            <b-th v-if="is2u2">{{ $t('pageThermalControl.fans.model') }}</b-th>
            <b-th>{{ $t('pageThermalControl.fans.rotationSpeed') }}</b-th>
            <b-th>{{ $t('pageThermalControl.fans.dutyRatio') }}</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-if="fanData.length == 0">
            <b-td :colspan="6" class="text-center">{{
              $t('global.table.emptyMessage')
            }}</b-td>
          </b-tr>
          <template v-for="(fan, index) in fanData">
            <b-tr :key="index" :class="{ stripeMe: index % 2 == 1 }">
              <b-td>{{ fan.name }}</b-td>
              <b-td>{{ fan.location }}</b-td>
              <b-td>
                <status-icon :status="statusIcon(fan.status)" />
                {{ fan.status | statusFilter }}
              </b-td>
              <b-td v-if="is2u2">{{ fan.model }}</b-td>
              <b-td>{{ fan.speed }} RPM</b-td>
              <b-td>{{ fan.dutyRatio }} %</b-td>
            </b-tr>
          </template>
        </b-tbody>
      </b-table-simple>
    </div>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import StatusIcon from '@/components/Global/StatusIcon';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import i18n from '@/i18n';

export default {
  components: { PageSection, StatusIcon },
  filters: {
    statusFilter(value) {
      return (
        {
          OK: i18n.t('global.status.ok'),
          Warning: i18n.t('global.status.warning'),
          Critical: i18n.t('global.status.critical'),
        }[value] || i18n.t('global.status.absent')
      );
    },
  },
  mixins: [TableRowExpandMixin, DataFormatterMixin, TableSortMixin],
  data() {
    return {
      searchTotalFilteredRows: 0,
      expandRowLabel: expandRowLabel,
      is2u2: process.env.VUE_APP_COMPANY_NAME == 'egs' ? true : true,
    };
  },
  computed: {
    fanData() {
      return this.$store.getters['thermal/fanData'];
    },
    fansTotal() {
      return this.$store.getters['thermal/fansTotal'];
    },
  },
  created() {
    const thermal = this.$store.dispatch('thermal/getThermal');
    Promise.all([thermal]).finally(() => {
      this.$root.$emit('thermal-fan-complete');
    });
  },
  methods: {
    statusIcon(status) {
      const statusMap = {
        OK: 'success',
        Warning: 'warning',
        Critical: 'danger',
      };
      return statusMap[status] || 'secondary';
    },
    sortCompare(a, b, key) {
      if (key === 'health') {
        return this.sortStatus(a, b, key);
      }
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
  },
};
</script>

<style lang="scss" scoped>
.info-con {
  display: flex;
  .left-span {
    color: $gray-700;
  }
}
.table {
  .stripeMe {
    background-color: $gray-100;
  }
}
</style>
