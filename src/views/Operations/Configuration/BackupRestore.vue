<template>
  <b-container fluid>
    <page-section :section-title="$t('pageConfiguration.backupAndRestore')">
      <b-form id="backup-restore-form">
        <div class="section-container">
          <b-row>
            <b-col sm="12" md="4" class="text-divider">
              <h3>
                {{ $t('pageConfiguration.form.backupRestoreLabel') }}
              </h3>
            </b-col>
            <b-col sm="12" md="8">
              <!-- Backup -->
              <b-button
                variant="link"
                :class="{ disabled: backupInProgress }"
                class="btn-table backup-btn"
                data-test-id="backupRestore-button-backup"
                @click="handleBackup"
              >
                <span class="d-inline-flex align-items-center">
                  <span class="icon-box">
                    <icon-export />
                  </span>
                  <span class="d-none d-sm-inline">
                    {{ $t('pageConfiguration.form.backupButton') }}
                  </span>
                  <span class="d-inline d-sm-none">
                    {{ $t('pageConfiguration.form.backupButtonMobile') }}
                  </span>
                </span>
              </b-button>

              <!-- Restore -->
              <div class="restore-section">
                <b-row>
                  <b-col sm="7">
                    <b-form-group>
                      <form-file
                        id="image-file"
                        v-model="backupFile"
                        :state="getValidationState($v.backupFile)"
                        aria-describedby="image-file-help-block"
                      >
                      </form-file>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-button
                  variant="primary"
                  :disabled="!backupFile || restoreInProgress"
                  @click="handleRestore"
                >
                  <span class="d-none d-sm-inline">
                    {{ $t('pageConfiguration.form.restoreButton') }}
                  </span>
                  <span class="d-inline d-sm-none">
                    {{ $t('pageConfiguration.form.restoreButtonMobile') }}
                  </span>
                </b-button>
              </div>
            </b-col>
          </b-row>
        </div>
      </b-form>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import { mapGetters } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import FormFile from '@/components/Global/FormFile';
import IconExport from '@/components/icons/IconExport';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'BackupRestore',
  components: { PageSection, FormFile, IconExport },
  mixins: [VuelidateMixin, BVToastMixin],
  data() {
    return {
      backupFile: null,
    };
  },
  computed: {
    ...mapGetters('backupRestore', ['backupInProgress', 'restoreInProgress']),
  },
  validations() {
    return {
      backupFile: {
        required,
      },
    };
  },
  methods: {
    async handleBackup() {
      try {
        const response = await this.$store.dispatch(
          'backupRestore/createBackup',
        );
        const url = window.URL.createObjectURL(
          new Blob([response], { type: 'application/octet-stream' }),
        );
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bmc-backup.tar.gz';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.successToast(this.$t('pageConfiguration.toast.backupSuccess'));
      } catch (error) {
        this.errorToast(error.message);
      }
    },
    async handleRestore() {
      this.$v.$touch();
      if (this.$v.$invalid) return;

      try {
        await this.$store.dispatch(
          'backupRestore/restoreBackup',
          this.backupFile,
        );
        this.backupFile = null;
        this.$v.$reset();
        this.successToast(this.$t('pageConfiguration.toast.restoreSuccess'));
      } catch (error) {
        this.errorToast(error.message);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.section-container {
  margin-bottom: 2rem;
}

.restore-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.text-divider {
  h3 {
    margin-bottom: 1rem;
  }
}

::v-deep .custom-form-file-container label {
  margin-bottom: 0;
}

.text-divider {
  &::after {
    @include media-breakpoint-down(sm) {
      content: none;
    }
  }
}

.backup-btn {
  padding: clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem)
    clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem)
    clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem)
    clamp(0.168rem, 0.0001rem + 0.2083vw, 0.25rem);
  font-size: clamp(0.875rem, 0.3631rem + 0.6349vw, 1.125rem);
  background-color: #e4e4e4;
  border: none;
  border-radius: 20px;

  &:hover {
    background-color: #272b32;
    color: #fff;

    svg {
      fill: #272b32;
    }
  }
}

.icon-box {
  margin-right: clamp(0.625rem, -0.0159rem + 0.7949vw, 0.938rem);

  svg {
    fill: #272b32;
    margin: 0;
    width: 20px !important;
    height: 20px !important;
  }
}
</style>
