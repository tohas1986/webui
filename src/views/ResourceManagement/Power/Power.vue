<template>
  <b-container fluid>
    <page-title :description="$t('pagePower.description')" />

    <b-form @submit.prevent="submitForm">
      <div class="section-container">
        <b-row>
          <b-col sm="12" md="6" class="text-divider">
            <b-row>
              <b-col sm="8" md="6">
                <dl>
                  <dt>{{ $t('pagePower.powerConsumption') }}</dt>
                  <dd>
                    {{
                      powerConsumptionValue
                        ? `${powerConsumptionValue} W`
                        : $t('global.status.notAvailable')
                    }}
                  </dd>
                </dl>
              </b-col>
            </b-row>
          </b-col>
          <b-col sm="12" md="6">
            <b-form-group class="mb-0" :disabled="loading">
              <b-row class="field-wrapper">
                <b-col sm="12" md="6">
                  <b-form-group :label="$t('pagePower.powerCapSettingLabel')">
                    <b-form-checkbox
                      v-model="isPowerCapFieldEnabled"
                      data-test-id="power-checkbox-togglePowerCapField"
                      name="power-cap-setting"
                    >
                      {{ $t('pagePower.powerCapSettingData') }}
                    </b-form-checkbox>
                  </b-form-group>
                </b-col>
                <b-col sm="12" md="6">
                  <b-form-group
                    id="input-group-1"
                    class="mb-0"
                    :label="$t('pagePower.powerCapLabel')"
                    label-for="input-1"
                  >
                    <b-form-input
                      id="input-1"
                      v-model.number="powerCapValue"
                      :disabled="!isPowerCapFieldEnabled"
                      data-test-id="power-input-powerCapValue"
                      type="number"
                      aria-describedby="power-help-text"
                      :state="getValidationState($v.powerCapValue)"
                    ></b-form-input>
                    <b-form-text id="power-help-text">
                      {{
                        $t('pagePower.powerCapLabelTextInfo', {
                          min: 1,
                          max: 10000,
                        })
                      }}
                    </b-form-text>

                    <b-form-invalid-feedback
                      id="input-live-feedback"
                      role="alert"
                    >
                      <template v-if="!$v.powerCapValue.required">
                        {{ $t('global.form.fieldRequired') }}
                      </template>
                      <template v-else-if="!$v.powerCapValue.between">
                        {{ $t('global.form.invalidValue') }}
                      </template>
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      <b-button
        variant="primary"
        type="submit"
        class="btn-block btn-mt"
        data-test-id="power-button-savePowerCapValue"
      >
        {{ $t('global.action.save') }}
      </b-button>
    </b-form>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { requiredIf, between } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';

export default {
  name: 'Power',
  components: { PageTitle },
  mixins: [VuelidateMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      loading,
    };
  },
  computed: {
    ...mapGetters({
      powerConsumptionValue: 'powerControl/powerConsumptionValue',
    }),

    /**
      Computed property isPowerCapFieldEnabled is used to enable or disable the input field.
      The input field is enabled when the powercapValue property is not null.
   **/
    isPowerCapFieldEnabled: {
      get() {
        return this.powerCapValue !== null;
      },
      set(value) {
        this.$v.$reset();
        let newValue = null;
        if (value) {
          if (this.powerCapValue) {
            newValue = this.powerCapValue;
          } else {
            newValue = '';
          }
        }
        this.$store.dispatch('powerControl/setPowerCapUpdatedValue', newValue);
      },
    },
    powerCapValue: {
      get() {
        return this.$store.getters['powerControl/powerCapValue'];
      },
      set(value) {
        this.$v.$touch();
        this.$store.dispatch('powerControl/setPowerCapUpdatedValue', value);
      },
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('powerControl/getPowerControl')
      .finally(() => this.endLoader());
  },
  validations: {
    powerCapValue: {
      between: between(1, 10000),
      required: requiredIf(function () {
        return this.isPowerCapFieldEnabled;
      }),
    },
  },
  methods: {
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.startLoader();
      this.$store
        .dispatch('powerControl/setPowerControl', this.powerCapValue)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
<style lang="scss" scoped>
.field-wrapper {
  @include media-breakpoint-down(sm) {
    margin-top: 1rem;
  }
}
.text-divider {
  &::after {
    @include media-breakpoint-only(xs) {
      content: none;
    }
  }
}
</style>
