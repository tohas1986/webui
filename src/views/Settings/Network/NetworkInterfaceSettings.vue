<template>
  <div>
    <page-section>
      <div class="section-container">
        <b-row class="text-wrapper">
          <b-col sm="6" md="4">
            <dl>
              <dt>{{ $t('pageNetwork.linkStatus') }}</dt>
              <dd>
                {{ dataFormatter(linkStatus) }}
              </dd>
            </dl>
          </b-col>
          <b-col sm="6" md="4">
            <dl>
              <dt>{{ $t('pageNetwork.speed') }}</dt>
              <dd>
                {{ dataFormatter(linkSpeed) }}
              </dd>
            </dl>
          </b-col>
        </b-row>
      </div>
    </page-section>
    <div class="section-container">
      <page-section>
        <h3 class="title">{{ $t('pageNetwork.interfaceSection') }}</h3>
        <b-row class="text-wrapper">
          <b-col sm="6" md="4">
            <dl>
              <dt>
                {{ $t('pageNetwork.fqdn') }}
              </dt>
              <dd>
                {{ dataFormatter(fqdn) }}
              </dd>
            </dl>
          </b-col>
          <b-col sm="6" md="2">
            <dl class="text-nowrap">
              <dt>
                {{ $t('pageNetwork.macAddress') }}
              </dt>
              <dd>
                {{ dataFormatter(macAddress) }}
              </dd>
            </dl>
          </b-col>
          <b-col md="4" class="align-content-end">
            <dl>
              <dd>
                <b-link
                  class="card-link"
                  @click.prevent="initMacAddressModal()"
                >
                  {{ $t('global.action.edit') }}
                  <icon-chevron />
                </b-link>
              </dd>
            </dl>
          </b-col>
        </b-row>
      </page-section>
    </div>
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import PageSection from '@/components/Global/PageSection';
import IconChevron from '@carbon/icons-vue/es/chevron--right/16';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { mapState } from 'vuex';

export default {
  name: 'Ipv4Table',
  components: {
    PageSection,
    IconChevron,
  },
  mixins: [BVToastMixin, DataFormatterMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      selectedInterface: '',
      linkStatus: '',
      linkSpeed: '',
      fqdn: '',
      macAddress: '',
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
      this.getSettings();
    },
  },
  created() {
    this.getSettings();
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('network-interface-settings-complete');
    });
  },
  methods: {
    getSettings() {
      this.selectedInterface = this.tabIndex;
      this.linkStatus = this.ethernetData[this.selectedInterface].LinkStatus;
      this.linkSpeed = this.ethernetData[this.selectedInterface].SpeedMbps;
      this.fqdn = this.ethernetData[this.selectedInterface].FQDN;
      this.macAddress = this.ethernetData[this.selectedInterface].MACAddress;
    },
    initMacAddressModal() {
      this.$bvModal.show('modal-mac-address');
    },
  },
};
</script>

<style lang="scss" scoped>
dd {
  margin-top: 12px;
  @include media-breakpoint-down(sm) {
    margin-top: 0.25rem;
  }
}

dt {
  color: rgba($main-color, 0.7);
}

.page-section {
  margin-bottom: 0;
}

h3 {
  margin-bottom: 40px;
  @include media-breakpoint-down(sm) {
    margin-bottom: 0.5rem !important;
  }
}

.text-wrapper {
  @include media-breakpoint-down(sm) {
    gap: 1rem;
  }
}

.card-link {
  font-size: clamp(0.75rem, -0.0179rem + 0.9524vw, 1.125rem);
}
</style>
