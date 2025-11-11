<template>
  <overview-card
    v-if="network"
    :title="$t('pageOverview.networkInformation')"
    :to="`/settings/network`"
  >
    <div class="card-info">
      <dl>
        <dt>{{ $t('pageOverview.hostName') }}</dt>
        <dd>{{ dataFormatter(network.hostname) }}</dd>
      </dl>
      <dl>
        <dt>{{ $t('pageOverview.linkStatus') }}</dt>
        <dd>
          {{ dataFormatter(network.linkStatus) }}
        </dd>
      </dl>
      <dl>
        <dt>{{ $t('pageOverview.dhcp') }}</dt>
        <dd>
          {{
            dataFormatter(
              network.dhcpAddress.length !== 0
                ? network.dhcpAddress[0].Address
                : null,
            )
          }}
        </dd>
      </dl>
      <dl>
        <dt>{{ $t('pageOverview.ipv4') }}</dt>
        <dd>
          {{ dataFormatter(network.staticAddress) }}
        </dd>
      </dl>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'Network',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  computed: {
    network() {
      return this.$store.getters['network/globalNetworkSettings'][0];
    },
  },
  created() {
    this.$store.dispatch('network/getEthernetData').finally(() => {
      this.$root.$emit('overview-network-complete');
    });
  },
};
</script>
