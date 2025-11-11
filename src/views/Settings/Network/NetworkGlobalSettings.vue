<template>
  <page-section
    v-if="firstInterface"
    :section-title="$t('pageNetwork.networkSettings')"
  >
    <div class="section-container">
      <b-row>
        <b-col sm="6" md="3" class="network-setting-dl">
          <dl>
            <dt>
              {{ $t('pageNetwork.hostname') }}
              <b-button variant="link" class="p-1" @click="initSettingsModal()">
                <icon-edit :title="$t('pageNetwork.modal.editHostnameTitle')" />
              </b-button>
            </dt>
            <dd>{{ dataFormatter(firstInterface.hostname) }}</dd>
          </dl>
        </b-col>
        <b-col sm="6" md="3" class="network-setting-dl">
          <dl>
            <dt>{{ $t('pageNetwork.useDomainName') }}</dt>
            <dd>
              <b-form-checkbox
                id="useDomainNameSwitch"
                v-model="useDomainNameState"
                data-test-id="networkSettings-switch-useDomainName"
                switch
                @change="changeDomainNameState"
              >
                <span v-if="useDomainNameState">
                  {{ $t('global.status.enabled') }}
                </span>
                <span v-else>{{ $t('global.status.disabled') }}</span>
              </b-form-checkbox>
            </dd>
          </dl>
        </b-col>
        <b-col sm="6" md="3" class="network-setting-dl">
          <dl>
            <dt>{{ $t('pageNetwork.useDns') }}</dt>
            <dd>
              <b-form-checkbox
                id="useDnsSwitch"
                v-model="useDnsState"
                data-test-id="networkSettings-switch-useDns"
                switch
                @change="changeDnsState"
              >
                <span v-if="useDnsState">
                  {{ $t('global.status.enabled') }}
                </span>
                <span v-else>{{ $t('global.status.disabled') }}</span>
              </b-form-checkbox>
            </dd>
          </dl>
        </b-col>
        <b-col sm="6" md="3" class="d-flex">
          <dl>
            <dt>{{ $t('pageNetwork.useNtp') }}</dt>
            <dd>
              <b-form-checkbox
                id="useNtpSwitch"
                v-model="useNtpState"
                data-test-id="networkSettings-switch-useNtp"
                switch
                @change="changeNtpState"
              >
                <span v-if="useNtpState">
                  {{ $t('global.status.enabled') }}
                </span>
                <span v-else>{{ $t('global.status.disabled') }}</span>
              </b-form-checkbox>
            </dd>
          </dl>
        </b-col>
      </b-row>
    </div>
  </page-section>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconEdit from '@carbon/icons-vue/es/edit/16';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import PageSection from '@/components/Global/PageSection';
import { mapState } from 'vuex';

export default {
  name: 'GlobalNetworkSettings',
  components: { IconEdit, PageSection },
  mixins: [BVToastMixin, DataFormatterMixin],
  data() {
    return {
      hostname: '',
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
    firstInterface() {
      return this.$store.getters['network/globalNetworkSettings'][0];
    },
    useDomainNameState: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][0]
          .useDomainNameEnabled;
      },
      set(newValue) {
        return newValue;
      },
    },
    useDnsState: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][0]
          .useDnsEnabled;
      },
      set(newValue) {
        return newValue;
      },
    },
    useNtpState: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][0]
          .useNtpEnabled;
      },
      set(newValue) {
        return newValue;
      },
    },
  },
  created() {
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('network-global-settings-complete');
    });
  },
  methods: {
    changeDomainNameState(state) {
      this.$store
        .dispatch('network/saveDomainNameState', state)
        .then((success) => {
          this.successToast(success);
        })
        .catch(({ message }) => this.errorToast(message));
    },
    changeDnsState(state) {
      this.$store
        .dispatch('network/saveDnsState', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    changeNtpState(state) {
      this.$store
        .dispatch('network/saveNtpState', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    initSettingsModal() {
      this.$bvModal.show('modal-hostname');
    },
  },
};
</script>

<style lang="scss" scoped>
.network-setting-dl {
  position: relative;
  display: flex;

  @include media-breakpoint-down(sm) {
    margin-bottom: 15px;
  }

  &::after {
    content: '';
    position: absolute;
    display: block;
    right: 15%;
    top: 0;
    width: 1px;
    height: 100%;
    background-color: $gray-border;

    @include media-breakpoint-down(lg) {
      right: 5%;
    }

    @include media-breakpoint-down(sm) {
      content: none;
    }
  }
}

dl {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @include media-breakpoint-down(sm) {
    justify-content: flex-start;
  }
}

dt {
  color: rgba($main-color, 0.7);
}

dd {
  @include media-breakpoint-down(sm) {
    margin-top: 0.25rem;
  }
  white-space: nowrap;
}
</style>
