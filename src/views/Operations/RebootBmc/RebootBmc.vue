<template>
  <b-container fluid>
    <page-title />
    <b-row>
      <b-col xl="12">
        <page-section>
          <div class="section-container">
            <b-row>
              <b-col sm="12" md="4" class="text-divider">
                <h3>{{ $t('pageRebootBmc.lastReboot') }}</h3>
              </b-col>
              <b-col sm="12" md="8">
                <dl>
                  <dd v-if="lastBmcRebootTime">
                    {{ lastBmcRebootTime | formatDate }}
                    {{ lastBmcRebootTime | formatTime }} ({{ timezone }})
                  </dd>
                  <dd v-else>--</dd>
                  <dd>{{ $t('pageRebootBmc.rebootInformation') }}</dd>
                </dl>
              </b-col>
            </b-row>
          </div>
          <b-button
            variant="primary"
            class="btn-block btn-mt"
            data-test-id="rebootBmc-button-reboot"
            @click="onClick"
          >
            {{ $t('pageRebootBmc.rebootBmc') }}
          </b-button>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import LocalTimezoneLabelMixin from '@/components/Mixins/LocalTimezoneLabelMixin';

export default {
  name: 'RebootBmc',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin, LocalTimezoneLabelMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  computed: {
    lastBmcRebootTime() {
      return this.$store.getters['controls/lastBmcRebootTime'];
    },
    isUtcDisplay() {
      return this.$store.getters['global/isUtcDisplay'];
    },
    timezone() {
      return this.localOffset(this.isUtcDisplay);
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('controls/getLastBmcRebootTime')
      .finally(() => this.endLoader());
  },
  methods: {
    onClick() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageRebootBmc.modal.confirmMessage'), {
          title: this.$t('pageRebootBmc.modal.confirmTitle'),
          okTitle: this.$t('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
          size: 'lg',
          centered: true,
        })
        .then((confirmed) => {
          if (confirmed) this.rebootBmc();
        });
    },
    rebootBmc() {
      this.$store
        .dispatch('controls/rebootBmc')
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
