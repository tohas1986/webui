<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="8" lg="8" xl="6">
        <page-section>
          {{ $t('pageSaveConfig.saveConfigInformation') }}
          <b-button
            variant="primary"
            class="d-block mt-5"
            data-test-id="saveConfig-button-save"
            @click="onClick"
          >
            {{ $t('pageSaveConfig.saveConfig') }}
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

export default {
  name: 'SaveConfig',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  methods: {
    onClick() {
      this.saveConfig();
    },
    saveConfig() {
      this.$store
        .dispatch('controls/saveConfig')
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>

<style lang="scss" scoped></style>
