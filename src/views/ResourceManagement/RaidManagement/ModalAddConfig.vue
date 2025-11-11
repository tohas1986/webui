<template>
  <b-modal
    id="add-config"
    ref="modal"
    size="xl"
    centered
    scrollable
    @show="initModal"
    @hidden="resetForm"
  >
    <template #modal-title>
      {{ $t('pageRaidManagement.modal.title') }}
    </template>
    <b-form>
      <b-row>
        <b-col sm="6">
          <b-row class="mb-3">
            <b-col sm="5">
              <label for="volumeName">
                {{ $t('pageRaidManagement.modal.volumeName') }}
              </label>
            </b-col>
            <b-col sm="7">
              <b-form-group>
                <b-form-input
                  id="volumeName"
                  v-model="form.volumeName"
                  type="text"
                  :placeholder="
                    $t('pageRaidManagement.modal.volumeNamePlaceholder')
                  "
                  :state="getValidationState($v.form.volumeName)"
                  data-test-id="configureConnection-input-volumeName"
                  @input="$v.form.volumeName.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.volumeName.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mb-3">
            <b-col sm="5">
              <label for="stripeSize">
                {{ $t('pageRaidManagement.modal.stripeSize') }}
              </label>
            </b-col>
            <b-col sm="7">
              <b-form-group>
                <b-form-select
                  id="stripeSize"
                  v-model="form.stripeSize"
                  :options="stripSizeTypes"
                  :state="getValidationState($v.form.stripeSize)"
                  data-test-id="configureConnection-input-stripeSize"
                  @input="$v.form.stripeSize.$touch()"
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      {{ $t('global.form.selectAnOption') }}
                    </b-form-select-option>
                  </template>
                </b-form-select>
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.stripeSize.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mb-3">
            <b-col sm="5">
              <label for="initState">
                {{ $t('pageRaidManagement.modal.initState') }}
              </label>
            </b-col>
            <b-col sm="7">
              <b-form-group>
                <b-form-select
                  id="initState"
                  v-model="form.initState"
                  :options="inisStateTypes"
                  :state="getValidationState($v.form.initState)"
                  data-test-id="configureConnection-input-initState"
                  @input="$v.form.initState.$touch()"
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      {{ $t('global.form.selectAnOption') }}
                    </b-form-select-option>
                  </template>
                </b-form-select>
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.initState.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mb-3">
            <b-col sm="5">
              <label for="diskCachePolicy">
                {{ $t('pageRaidManagement.modal.diskCachePolicy') }}
              </label>
            </b-col>
            <b-col sm="7">
              <b-form-group>
                <b-form-select
                  id="diskCachePolicy"
                  v-model="form.diskCachePolicy"
                  :options="diskCachePolicyTypes"
                  :state="getValidationState($v.form.diskCachePolicy)"
                  data-test-id="configureConnection-input-diskCachePolicy"
                  @input="$v.form.diskCachePolicy.$touch()"
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      {{ $t('global.form.selectAnOption') }}
                    </b-form-select-option>
                  </template>
                </b-form-select>
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.diskCachePolicy.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mb-3">
            <b-col sm="5">
              <label for="readPolicy">
                {{ $t('pageRaidManagement.modal.readPolicy') }}
              </label>
            </b-col>
            <b-col sm="7">
              <b-form-group>
                <b-form-select
                  id="readPolicy"
                  v-model="form.readPolicy"
                  :options="readPolicyTypes"
                  :state="getValidationState($v.form.readPolicy)"
                  data-test-id="configureConnection-input-readPolicy"
                  @input="$v.form.readPolicy.$touch()"
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      {{ $t('global.form.selectAnOption') }}
                    </b-form-select-option>
                  </template>
                </b-form-select>
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.readPolicy.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>
        <b-col sm="6">
          <b-row class="mb-3">
            <b-col sm="5">
              <label for="writePolicy">
                {{ $t('pageRaidManagement.modal.writePolicy') }}
              </label>
            </b-col>
            <b-col sm="7">
              <b-form-group>
                <b-form-select
                  id="writePolicy"
                  v-model="form.writePolicy"
                  :options="writePolicyTypes"
                  :state="getValidationState($v.form.writePolicy)"
                  data-test-id="configureConnection-input-volumwritePolicyeName"
                  @input="$v.form.writePolicy.$touch()"
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      {{ $t('global.form.selectAnOption') }}
                    </b-form-select-option>
                  </template>
                </b-form-select>
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.writePolicy.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mb-3">
            <b-col sm="5">
              <label for="accessPolicy">
                {{ $t('pageRaidManagement.modal.accessPolicy') }}
              </label>
            </b-col>
            <b-col sm="7">
              <b-form-group>
                <b-form-select
                  id="accessPolicy"
                  v-model="form.accessPolicy"
                  :options="accessPolicyTypes"
                  :state="getValidationState($v.form.accessPolicy)"
                  data-test-id="configureConnection-input-accessPolicy"
                  @input="$v.form.accessPolicy.$touch()"
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      {{ $t('global.form.selectAnOption') }}
                    </b-form-select-option>
                  </template>
                </b-form-select>
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.accessPolicy.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mb-3">
            <b-col sm="5">
              <label for="raidLevel">
                {{ $t('pageRaidManagement.modal.raidLevel') }}
              </label>
            </b-col>
            <b-col sm="7">
              <b-form-group>
                <b-form-select
                  id="raidLevel"
                  v-model="form.raidLevel"
                  :options="raidLevelTypes"
                  :state="getValidationState($v.form.raidLevel)"
                  data-test-id="configureConnection-input-raidLevel"
                  @input="updateRaidRequirements"
                >
                </b-form-select>
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.raidLevel.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                </b-form-invalid-feedback>
                <b-form-text>
                  <template v-if="raidRequirements">
                    {{ $t('pageRaidManagement.modal.requires') }}
                    {{ raidRequirements.minArrays }}
                    {{
                      $tc(
                        'pageRaidManagement.modal.array.many',
                        raidRequirements.minArrays,
                      )
                    }},
                    {{ raidRequirements.minDisksPerArray }}
                    {{
                      $tc(
                        'pageRaidManagement.modal.diskPerArray',
                        raidRequirements.minDisksPerArray,
                      )
                    }}
                  </template>
                </b-form-text>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mb-3">
            <b-col sm="5">
              <label for="ioPolicy">
                {{ $t('pageRaidManagement.modal.ioPolicy') }}
              </label>
            </b-col>
            <b-col sm="7">
              <b-form-group>
                <b-form-select
                  id="ioPolicy"
                  v-model="form.ioPolicy"
                  type="text"
                  :options="ioPolicyTypes"
                  :state="getValidationState($v.form.ioPolicy)"
                  data-test-id="configureConnection-input-ioPolicy"
                  @input="$v.form.ioPolicy.$touch()"
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      {{ $t('global.form.selectAnOption') }}
                    </b-form-select-option>
                  </template>
                </b-form-select>
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.ioPolicy.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>
      </b-row>

      <!-- Tabs for Arrays and Spares -->
      <b-card no-body class="mt-3">
        <b-tabs card>
          <!-- Arrays Tab -->
          <b-tab :title="$t('pageRaidManagement.modal.array.other')" active>
            <b-card-body>
              <b-alert variant="info" show class="mb-3">
                <div v-if="raidRequirements">
                  <strong>
                    {{ $t('pageRaidManagement.modal.raid') }}
                    {{ form.raidLevel }}
                    {{ $t('pageRaidManagement.modal.requirements') }}:</strong
                  >
                  <ul class="mb-0">
                    <li>
                      {{ $t('pageRaidManagement.modal.minArrays') }}:
                      {{ raidRequirements.minArrays }}
                    </li>
                    <li>
                      {{ $t('pageRaidManagement.modal.minDiskArrays') }}:
                      {{ raidRequirements.minDisksPerArray }}
                    </li>
                    <li v-if="manufacturerWarning">
                      <status-icon status="danger" />{{ manufacturerWarning }}
                    </li>
                  </ul>
                </div>
                <div v-else>
                  {{ $t('pageRaidManagement.modal.alertRaidLevel') }}
                </div>
              </b-alert>

              <div
                v-if="form.spans.length === 0"
                class="text-center text-muted py-4"
              >
                {{ $t('pageRaidManagement.modal.noArraysConfig') }}
              </div>

              <b-list-group v-else>
                <b-list-group-item
                  v-for="(span, index) in form.spans"
                  :key="index"
                  class="mb-2"
                >
                  <div
                    class="d-flex justify-content-between align-items-center mb-2"
                  >
                    <h6 class="mb-0">
                      {{ $t('pageRaidManagement.modal.array.one') }} #{{
                        span.array_ref
                      }}
                    </h6>
                    <div>
                      <b-button
                        variant="danger"
                        size="sm"
                        :disabled="
                          form.spans.length <= raidRequirements.minArrays
                        "
                        @click="removeArray(index)"
                      >
                        {{ $t('global.action.delete') }}
                        <icon-delete />
                      </b-button>
                    </div>
                  </div>

                  <div>
                    <label>
                      {{ $t('pageRaidManagement.modal.selectDrivesArray') }}
                    </label>
                    <b-form-tags
                      v-model="span.pd_refs"
                      add-on-change
                      no-outer-focus
                      :state="validateArrayDisks(span)"
                      @input="calculateVolumeSize"
                    >
                      <template
                        #default="{
                          tags,
                          inputAttrs,
                          inputHandlers,
                          disabled,
                          removeTag,
                        }"
                      >
                        <b-input-group>
                          <b-form-select
                            v-bind="inputAttrs"
                            :disabled="disabled || availableDrives.length === 0"
                            :options="availableDrives"
                            v-on="inputHandlers"
                          >
                            <template #first>
                              <option disabled value="">
                                {{ $t('global.form.selectAnOption') }}
                              </option>
                            </template>
                          </b-form-select>
                        </b-input-group>
                        <div v-if="tags.length > 0" class="mt-2">
                          <b-form-tag
                            v-for="tag in tags"
                            :key="tag"
                            variant="secondary"
                            pill
                            class="badge-pill"
                            @remove="removeTag(tag)"
                          >
                            {{ getDriveTagText(tag) }}
                          </b-form-tag>
                        </div>
                      </template>
                    </b-form-tags>
                    <b-form-invalid-feedback :state="validateArrayDisks(span)">
                      {{ $t('pageRaidManagement.modal.min') }}
                      {{ raidRequirements.minDisksPerArray }}
                      {{
                        $tc(
                          'pageRaidManagement.modal.disksRequired',
                          raidRequirements.minDisksPerArray,
                        )
                      }}
                    </b-form-invalid-feedback>
                  </div>
                </b-list-group-item>
              </b-list-group>

              <b-button
                variant="primary"
                size="sm"
                class="mb-3"
                :disabled="!canAddMoreArrays"
                @click="addArray"
              >
                {{ $t('pageRaidManagement.modal.addArray') }}
              </b-button>
            </b-card-body>
          </b-tab>

          <!-- Spares Tab -->

          <b-tab
            :title="$t('pageRaidManagement.modal.spareDisks')"
            :disabled="!hasArrays"
          >
            <b-card-body>
              <b-alert v-if="hasArrays" variant="info" show class="mb-3">
                {{ $t('pageRaidManagement.modal.spareDisksInfo') }}
              </b-alert>

              <div
                v-if="form.spares.length === 0"
                class="text-center text-muted py-4"
              >
                {{ $t('pageRaidManagement.modal.noSpareConfig') }}
              </div>

              <b-list-group v-else>
                <b-list-group-item
                  v-for="(spare, index) in form.spares"
                  :key="index"
                  class="mb-2"
                >
                  <div
                    class="d-flex justify-content-between align-items-center mb-2"
                  >
                    <h6 class="mb-0">
                      {{ $t('pageRaidManagement.modal.spareDisks') }} #{{
                        index + 1
                      }}
                    </h6>
                    <div>
                      <b-button
                        variant="danger"
                        size="sm"
                        @click="removeSpare(index)"
                      >
                        {{ $t('global.action.delete') }}
                        <icon-delete />
                      </b-button>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label>
                      {{ $t('pageRaidManagement.modal.selectSpareDisk') }}
                    </label>
                    <b-form-tags
                      v-model="spare.driveId"
                      add-on-change
                      no-outer-focus
                      :state="!!spare.driveId.length"
                      tag-variant="primary"
                      tag-pills
                      @input="updateSpareDrive(index, $event)"
                    >
                      <template
                        #default="{
                          tags,
                          inputAttrs,
                          inputHandlers,
                          disabled,
                          removeTag,
                        }"
                      >
                        <b-input-group>
                          <b-form-select
                            v-bind="inputAttrs"
                            :disabled="
                              disabled || availableSpareDrives.length === 0
                            "
                            :options="availableSpareDrives"
                            v-on="inputHandlers"
                          >
                            <template #first>
                              <option disabled value="">
                                {{ $t('global.form.selectAnOption') }}
                              </option>
                            </template>
                          </b-form-select>
                        </b-input-group>
                        <div v-if="tags.length > 0" class="mt-2">
                          <b-form-tag
                            v-for="tag in tags"
                            :key="tag"
                            variant="primary"
                            pill
                            @remove="removeTag(tag)"
                          >
                            {{ getDriveTagText(tag) }}
                          </b-form-tag>
                        </div>
                      </template>
                    </b-form-tags>
                    <b-form-invalid-feedback v-if="!spare.driveId.length">
                      {{ $t('global.form.fieldRequired') }}
                    </b-form-invalid-feedback>
                  </div>
                  <b-form-group
                    :label="$t('pageRaidManagement.modal.spareType')"
                    class="mb-3"
                  >
                    <b-form-radio-group
                      v-model="spare.spareTypeValue"
                      :options="spareOptions"
                      stacked
                    >
                    </b-form-radio-group>
                  </b-form-group>

                  <b-form-group
                    v-if="form.spans.length > 0"
                    :label="$t('pageRaidManagement.modal.assignToArrays')"
                  >
                    <b-form-checkbox-group
                      v-model="spare.arrayRefs"
                      :options="arrayOptionsForSpare"
                      stacked
                    />
                  </b-form-group>
                </b-list-group-item>
              </b-list-group>

              <b-button
                variant="primary"
                size="sm"
                :disabled="!canAddSpare"
                @click="addSpare"
              >
                {{ $t('pageRaidManagement.modal.addSpareDisk') }}
              </b-button>
            </b-card-body>
          </b-tab>
        </b-tabs>
      </b-card>

      <!-- Volume Size Info -->
      <b-card class="mt-3 volume-info">
        <h5 class="mb-3">
          {{ $t('pageRaidManagement.modal.volumeInfo') }}
        </h5>
        <b-row>
          <b-col sm="6" class="mb-3">
            <b-list-group flush>
              <b-list-group-item
                class="d-flex justify-content-between align-items-center"
              >
                <span class="text-muted">
                  {{ $t('pageRaidManagement.modal.raidLevel') }}
                </span>
                <strong>{{ raidLevelText }}</strong>
              </b-list-group-item>
              <b-list-group-item
                class="d-flex justify-content-between align-items-center"
              >
                <span class="text-muted">
                  {{ $t('pageRaidManagement.modal.calculatedSize') }}
                </span>
                <strong>
                  {{ calculatedSize }}
                  {{ $t('pageRaidManagement.modal.blocks') }}
                  ({{ formatBytes(calculatedSize * 512) }})
                </strong>
              </b-list-group-item>
            </b-list-group>
          </b-col>

          <b-col sm="6">
            <b-list-group flush>
              <b-list-group-item
                class="d-flex justify-content-between align-items-center"
              >
                <span class="text-muted">
                  {{ $t('pageRaidManagement.modal.array.other') }}
                </span>
                <strong>{{ form.spans.length }}</strong>
              </b-list-group-item>
              <b-list-group-item
                class="d-flex justify-content-between align-items-center"
              >
                <span class="text-muted">
                  {{ $t('pageRaidManagement.modal.totalDisks') }}
                </span>
                <strong>{{ totalDisksUsed }}</strong>
              </b-list-group-item>
              <b-list-group-item
                class="d-flex justify-content-between align-items-center"
              >
                <span class="text-muted">
                  {{ $t('pageRaidManagement.modal.spareDisks') }}
                </span>
                <strong>{{ form.spares.length }}</strong>
              </b-list-group-item>
            </b-list-group>
          </b-col>
        </b-row>
      </b-card>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="userManagement-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        type="submit"
        variant="primary"
        :disabled="!isFormValid"
        @click="onOk"
      >
        {{ $t('global.action.save') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { required, maxLength, minLength } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import IconDelete from '@/components/icons/IconTrashcan';
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  components: {
    IconDelete,
    StatusIcon,
  },
  mixins: [VuelidateMixin],
  props: {
    config: {
      type: Object,
      default: () => ({ drives: [] }),
      validator: (prop) => {
        return prop && Array.isArray(prop.drives);
      },
    },
  },
  data() {
    return {
      form: {
        volumeName: null,
        stripeSize: 7,
        initState: 0,
        diskCachePolicy: 0,
        readPolicy: 0,
        writePolicy: 0,
        accessPolicy: 0,
        raidLevel: null,
        numBlocks: null,
        ioPolicy: 0,
        spans: [],
        spares: [],
      },
      inisStateTypes: [
        { value: 0, text: 'No initialization' },
        { value: 1, text: 'Quick Initialization' },
        { value: 2, text: 'Full Initialization' },
      ],
      diskCachePolicyTypes: [
        { value: 0, text: 'No changes' },
        { value: 1, text: 'Enable cache' },
        { value: 2, text: 'Disable cache' },
      ],
      readPolicyTypes: [
        { value: 0, text: 'No read-ahead' },
        { value: 1, text: 'Read-ahead enabled' },
        { value: 2, text: ' Adaptive read-ahead' },
      ],
      writePolicyTypes: [
        { value: 0, text: 'Write-through' },
        { value: 1, text: 'Write-back' },
        { value: 2, text: 'Write-back with bad BBU' },
        { value: 3, text: 'Allow write caching' },
      ],
      accessPolicyTypes: [
        { value: 0, text: 'Read-Write' },
        { value: 2, text: ' Read-Only' },
        { value: 3, text: ' Blocked' },
        { value: 14, text: 'Transport Ready' },
        { value: 15, text: 'Hidden' },
      ],
      raidLevelTypes: [
        {
          value: null,
          text: this.$t('global.form.selectAnOption'),
          disabled: true,
        },
        { value: 0, text: 'RAID 0 (striping)' },
        { value: 1, text: 'RAID 1 (mirroring)' },
        { value: 5, text: 'RAID 5 (striping with parity)' },
        { value: 6, text: 'RAID 6 (double parity)' },
        { value: 10, text: 'RAID 10 (striping + mirroring)' },
        { value: 50, text: 'RAID 50 (RAID 5 arrays)' },
        { value: 60, text: 'RAID 60 (RAID 6 arrays)' },
      ],
      ioPolicyTypes: [
        { value: 0, text: 'Direct I/O' },
        { value: 1, text: 'Cached I/O' },
      ],
      stripSizeTypes: [
        { value: 0, text: '512' },
        { value: 1, text: '1K' },
        { value: 2, text: '2K' },
        { value: 3, text: '4K' },
        { value: 4, text: '8K' },
        { value: 5, text: '16K' },
        { value: 6, text: '32K' },
        { value: 7, text: '64K' },
        { value: 11, text: '1МB' },
      ],
      raidRequirementsMap: {
        0: { minArrays: 1, minDisksPerArray: 1, effectiveRaidLevel: 0 },
        1: { minArrays: 1, minDisksPerArray: 2, effectiveRaidLevel: 1 },
        5: { minArrays: 1, minDisksPerArray: 3, effectiveRaidLevel: 5 },
        6: { minArrays: 1, minDisksPerArray: 4, effectiveRaidLevel: 6 },
        10: { minArrays: 2, minDisksPerArray: 2, effectiveRaidLevel: 1 },
        50: { minArrays: 2, minDisksPerArray: 3, effectiveRaidLevel: 5 },
        60: { minArrays: 2, minDisksPerArray: 4, effectiveRaidLevel: 6 },
      },
      spareOptions: [
        {
          value: 1,
          text: 'Dedicated',
        },
        {
          value: 2,
          text: 'Revertible',
        },
        {
          value: 3,
          text: 'Enclosure Affinity',
        },
        {
          value: 5,
          text: 'Reserved',
        },
      ],
    };
  },
  computed: {
    hasArrays() {
      return this.form.spans.length > 0;
    },
    availableDrives() {
      if (!this.config || !this.config.drives) return [];

      const usedDrives = new Set();

      this.form.spans.forEach((span) => {
        span.pd_refs.forEach((drive) => usedDrives.add(drive));
      });

      this.form.spares.forEach((spare) => {
        usedDrives.add(spare.pd_drive_id);
      });

      return this.config.drives
        .map((drive) => ({
          value: drive.DriveId.toString(),
          text: `Drive ID ${drive.DriveId} - (${drive.Manufacturer || 'Unknown'})`,
          raw: drive,
        }))
        .filter((drive) => !usedDrives.has(drive.value));
    },
    availableSpareDrives() {
      if (!this.config?.drives) return [];

      // Get all used drives (in arrays and other spares)
      const usedDrives = new Set();
      this.form.spans.forEach((span) => {
        span.pd_refs.forEach((drive) => usedDrives.add(drive));
      });
      this.form.spares.forEach((spare) => {
        if (spare.driveId && spare.driveId.length) {
          usedDrives.add(spare.driveId[0]);
        }
      });

      return this.config.drives
        .filter((drive) => !usedDrives.has(drive.DriveId.toString()))
        .map((drive) => ({
          value: drive.DriveId.toString(),
          text: `Drive ${drive.DriveId} (${drive.Manufacturer || 'Unknown'}) - ${this.formatBytes(drive.CapacityBytes)}`,
          raw: drive,
        }));
    },
    arrayOptionsForSpare() {
      return this.form.spans.map((span) => ({
        value: span.array_ref,
        text: `Array ${span.array_ref}`,
      }));
    },

    availableArraysForSpare() {
      return this.form.spans.map((span) => ({
        value: span.array_ref,
        text: `Array ${span.array_ref}`,
      }));
    },

    raidRequirements() {
      if (this.form.raidLevel === null) return null;
      return this.raidRequirementsMap[this.form.raidLevel] || null;
    },

    raidLevelText() {
      if (this.form.raidLevel === null) return 'Not selected';
      const level = this.raidLevelTypes.find(
        (l) => l.value === this.form.raidLevel,
      );
      return level ? level.text : 'Unknown';
    },
    canAddSpare() {
      return (
        this.hasArrays &&
        this.config?.drives?.length > 0 &&
        this.availableSpareDrives.length > 0
      );
    },

    canAddMoreArrays() {
      if (!this.raidRequirements) return false;
      return true;
    },

    calculatedSize() {
      if (!this.form.spans.length) return 0;

      if ([0, 5, 6].includes(this.form.raidLevel)) {
        const minCapacity = Math.min(
          ...this.form.spans.map((span) => {
            const drives = this.getDrivesByIds(span.pd_refs);
            return Math.min(...drives.map((d) => d.CapacityBytes));
          }),
        );
        return minCapacity / 512;
      }

      if ([1, 10, 50, 60].includes(this.form.raidLevel)) {
        const minArraySize = Math.min(
          ...this.form.spans.map((span) => {
            const drives = this.getDrivesByIds(span.pd_refs);
            const minDriveSize = Math.min(
              ...drives.map((d) => d.CapacityBytes),
            );

            if ([1, 10].includes(this.form.raidLevel)) {
              return minDriveSize;
            }

            if (this.form.raidLevel === 5 || this.form.raidLevel === 50) {
              return (drives.length - 1) * minDriveSize;
            }

            if (this.form.raidLevel === 6 || this.form.raidLevel === 60) {
              return (drives.length - 2) * minDriveSize;
            }

            return minDriveSize;
          }),
        );

        return minArraySize / 512;
      }

      return 0;
    },

    totalDisksUsed() {
      let count = 0;
      this.form.spans.forEach((span) => {
        count += span.pd_refs.length;
      });
      return count;
    },

    isFormValid() {
      if (this.$v.$invalid) return false;
      if (this.form.raidLevel === null) return false;
      if (!this.raidRequirements) return false;

      if (this.form.spans.length < this.raidRequirements.minArrays)
        return false;

      for (const span of this.form.spans) {
        if (span.pd_refs.length < this.raidRequirements.minDisksPerArray) {
          return false;
        }
      }

      return true;
    },

    manufacturerWarning() {
      if (!this.form.spans.length || this.form.raidLevel === null) return '';

      const allDrives = this.form.spans.flatMap((span) =>
        span.pd_refs
          .map((id) =>
            this.config.drives.find((d) => d.DriveId.toString() === id),
          )
          .filter(Boolean),
      );

      if (allDrives.length === 0) return '';

      const manufacturers = new Set(allDrives.map((d) => d.Manufacturer));
      if (manufacturers.size > 1) {
        return this.$t('pageRaidManagement.modal.differentManufacturers');
      }
      return '';
    },
  },
  watch: {
    calculatedSize(newVal) {
      this.form.numBlocks = newVal;
    },
  },
  validations() {
    return {
      form: {
        volumeName: {
          required,
          maxLength: maxLength(16),
        },
        stripeSize: {
          required,
        },
        initState: {
          required,
        },
        diskCachePolicy: {
          required,
        },
        readPolicy: {
          required,
        },
        writePolicy: {
          required,
        },
        accessPolicy: {
          required,
        },
        raidLevel: {
          required: (value) => value !== null,
        },
        numBlocks: {
          required,
        },
        ioPolicy: {
          required,
        },
        spans: {
          required,
          minLength: minLength(1),
        },
        spares: {
          $each: {
            driveId: { required },
            arrayRefs: {},
          },
        },
      },
    };
  },
  methods: {
    getDrivesByIds(ids) {
      if (!this.config || !this.config.drives) return [];
      return this.config.drives.filter((drive) =>
        ids.includes(drive.DriveId.toString()),
      );
    },

    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    updateRaidRequirements() {
      if (this.form.raidLevel === null) {
        this.form.spans = [];
        return;
      }

      this.form.spans = [];

      if (this.raidRequirements && this.raidRequirements.minArrays > 0) {
        for (let i = 0; i < this.raidRequirements.minArrays; i++) {
          this.addArray();
        }
      }

      this.calculateVolumeSize();
    },

    addArray() {
      const newArrayRef =
        this.form.spans.length > 0
          ? Math.max(...this.form.spans.map((s) => s.array_ref)) + 1
          : 0;

      this.form.spans.push({
        array_ref: newArrayRef,
        pd_refs: [],
        size: 0,
      });
    },

    removeArray(index) {
      this.form.spares.forEach((spare) => {
        spare.array_refs = spare.array_refs.filter(
          (ref) => ref !== this.form.spans[index].array_ref,
        );
      });

      this.form.spans.splice(index, 1);
      this.calculateVolumeSize();
    },

    addSpare() {
      this.form.spares.push({
        driveId: [],
        arrayRefs: [],
        spareTypeValue: 1,
      });
    },

    updateSpareDrive(index, newDriveIds) {
      // Ensure only one drive is selected (keep last selected)
      const previousDrive = this.form.spares[index].driveId[0];
      const newDrive =
        newDriveIds.length > 0 ? newDriveIds[newDriveIds.length - 1] : null;

      this.form.spares[index].driveId = newDrive ? [newDrive] : [];

      // If changed, reset array assignments
      if (previousDrive !== newDrive) {
        this.form.spares[index].arrayRefs = [];
      }
    },

    isDriveUsed(driveId) {
      // Проверяем использование диска в массивах
      const usedInArrays = this.form.spans.some((span) =>
        span.pd_refs.includes(driveId),
      );

      // Проверяем использование диска в spare
      const usedInSpares = this.form.spares.some(
        (spare) => spare.driveId === driveId,
      );

      return usedInArrays || usedInSpares;
    },

    removeSpare(index) {
      this.form.spares.splice(index, 1);
    },

    getDriveTagText(driveId) {
      if (!driveId) return 'Unknown drive';
      const drive = this.config.drives?.find(
        (d) => d.DriveId.toString() === driveId,
      );
      return drive
        ? `Drive ${drive.DriveId} (${drive.Manufacturer || 'Unknown'})`
        : driveId;
    },

    updateSpareDisk(index) {
      this.form.spares[index].array_refs = [];
    },

    validateArrayDisks(span) {
      if (!this.raidRequirements) return false;
      return span.pd_refs.length >= this.raidRequirements.minDisksPerArray;
    },

    calculateVolumeSize() {
      this.$forceUpdate();
    },

    handleSubmit() {
      this.$v.$touch();
      if (!this.isFormValid) return;

      let volumeData = {
        vd_name: this.form.volumeName,
        stripe_size: this.form.stripeSize,
        init_state: this.form.initState,
        disk_cache_policy: this.form.diskCachePolicy,
        read_policy: this.form.readPolicy,
        write_policy: this.form.writePolicy,
        access_policy: this.form.accessPolicy,
        raid_level: this.raidRequirements.effectiveRaidLevel,
        num_blocks: this.form.numBlocks,
        io_policy: this.form.ioPolicy,
        spans: this.form.spans.map((span) => ({
          array_ref: span.array_ref,
          size: this.form.numBlocks,
          pd_refs: span.pd_refs.map(Number),
        })),
        spares: this.form.spares.map((spare) => ({
          pd_drive_id: Number(spare.driveId),
          array_refs: spare.arrayRefs.map(Number),
          spare_type: spare.spareTypeValue,
        })),
      };

      this.$emit('ok', volumeData, this.config.id);
      this.closeModal();
    },

    getSpareType(spare) {
      let type = 0;
      if (spare.is_dedicated) type |= 1 << 0;
      if (spare.is_revertible) type |= 1 << 1;
      return type;
    },

    initModal() {
      if (this.config) {
        Object.assign(this.form, this.config);
      }

      if (this.form.spans.length === 0 && this.raidRequirements) {
        for (let i = 0; i < this.raidRequirements.minArrays; i++) {
          this.addArray();
        }
      }
    },

    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },

    resetForm() {
      this.form = {
        volumeName: null,
        stripeSize: 7,
        initState: 0,
        diskCachePolicy: 0,
        readPolicy: 0,
        writePolicy: 0,
        accessPolicy: 0,
        raidLevel: null,
        numBlocks: null,
        ioPolicy: 0,
        spans: [],
        spares: [],
      };
      this.$v.$reset();
    },

    onOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>

<style lang="scss" scoped>
.btn-danger {
  padding: 0.5rem 1rem;
  svg {
    margin-left: 1.25rem;
    margin-right: 0;
  }
}

.volume-info {
  background-color: $gray-light;
  border-radius: 20px;

  .card-body {
    padding: 2rem;
  }
}

.status-icon {
  display: inline-flex;
  width: 25px;
  height: 25px;
  border-radius: 8px;
  margin-right: 5px;
}
</style>
