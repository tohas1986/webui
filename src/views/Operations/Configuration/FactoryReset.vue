<template>
  <b-container fluid>
    <page-section :section-title="$t('pageConfiguration.factoryReset')">
      <p class="description">{{ $t('pageConfiguration.description') }}</p>
      <!-- Reset Form -->
      <b-form id="factory-reset" @submit.prevent="onResetSubmit">
        <div class="section-container">
          <b-row>
            <b-col sm="12" md="4" class="text-divider">
              <h3>{{ $t('pageConfiguration.form.resetOptionsLabel') }}</h3>
            </b-col>
            <b-col sm="12" md="8">
              <b-form-group>
                <b-form-radio-group
                  id="factory-reset-options"
                  v-model="resetOption"
                  stacked
                >
                  <b-form-radio
                    class="mb-1"
                    value="resetBios"
                    aria-describedby="reset-bios"
                    data-test-id="factoryReset-radio-resetBios"
                  >
                    {{ $t('pageConfiguration.form.resetBiosOptionLabel') }}
                  </b-form-radio>
                  <b-form-text id="reset-bios" class="ml-4 mb-3">
                    {{ $t('pageConfiguration.form.resetBiosOptionHelperText') }}
                  </b-form-text>

                  <b-form-radio
                    class="mb-1"
                    value="resetToDefaults"
                    aria-describedby="reset-to-defaults"
                    data-test-id="factoryReset-radio-resetToDefaults"
                  >
                    {{
                      $t('pageConfiguration.form.resetToDefaultsOptionLabel')
                    }}
                  </b-form-radio>
                  <b-form-text id="reset-to-defaults" class="ml-4 mb-3">
                    {{
                      $t(
                        'pageConfiguration.form.resetToDefaultsOptionHelperText',
                      )
                    }}
                  </b-form-text>
                </b-form-radio-group>
              </b-form-group>
            </b-col>
          </b-row>
        </div>
        <b-row>
          <b-col>
            <b-button
              type="submit"
              variant="primary"
              class="btn-block btn-mt"
              data-test-id="factoryReset-button-submit"
            >
              {{ $t('global.action.reset') }}
            </b-button>
          </b-col>
        </b-row>
      </b-form>

      <!-- Modals -->
      <modal-reset :reset-type="resetOption" @okConfirm="onOkConfirm" />
    </page-section>
  </b-container>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import ModalReset from './FactoryResetModal';
import PageSection from '@/components/Global/PageSection';

export default {
  name: 'FactoryReset',
  components: { ModalReset, PageSection },
  mixins: [LoadingBarMixin, BVToastMixin],
  data() {
    return {
      resetOption: 'resetBios',
    };
  },
  created() {
    this.hideLoader();
  },
  methods: {
    onResetSubmit() {
      this.$bvModal.show('modal-reset');
    },
    onOkConfirm() {
      if (this.resetOption == 'resetBios') {
        this.onResetBiosConfirm();
      } else {
        this.onResetToDefaultsConfirm();
      }
    },
    onResetBiosConfirm() {
      this.$store
        .dispatch('factoryReset/resetBios')
        .then((title) => {
          this.successToast('', {
            title,
          });
        })
        .catch(({ message }) => {
          this.errorToast('', {
            title: message,
          });
        });
    },
    onResetToDefaultsConfirm() {
      this.$store
        .dispatch('factoryReset/resetToDefaults')
        .then((title) => {
          this.successToast('', {
            title,
          });
        })
        .catch(({ message }) => {
          this.errorToast('', {
            title: message,
          });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.form-text {
  font-size: clamp(0.75rem, -0.0179rem + 0.9524vw, 1.125rem);
}
.text-divider::after {
  @include media-breakpoint-down(sm) {
    display: none;
  }
}

.description {
  font-size: clamp(0.75rem, -0.0179rem + 0.9524vw, 1.125rem);
  color: #272b32;
}
::v-deep .page-section-text {
  margin-bottom: 0.2rem !important;
}
</style>
