<template>
  <b-card>
    <div class="z-1">
      <h3 class="mb-0">{{ dataFormatter(serverModel) }}</h3>
      <p class="text-muted mb-0">
        {{ dataFormatter(serverSerialNumber) }}
      </p>
    </div>
    <div v-if="chassis" class="server-image-container">
      <img :src="serverImage" :alt="altImage" />
    </div>
    <b-link class="card-link" to="/hardware-status/inventory"
      >{{ $t('pageOverview.information') }}
      <icon-chevron />
    </b-link>
  </b-card>
</template>

<script>
import server1u from '@/assets/images/server-1u.png';
import server2u from '@/assets/images/server-2u.png';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import IconChevron from '@carbon/icons-vue/es/chevron--right/16';
import { mapState } from 'vuex';

export default {
  name: 'Server',
  components: { IconChevron },
  mixins: [DataFormatterMixin],
  data() {
    return {
      altImage: 'Server image',
    };
  },
  computed: {
    ...mapState({
      server: (state) => state.system.systems[0],
      chassis: (state) => state.chassis.chassis,
      selectedChassis() {
        return this.chassis.find((ch) => ch.id === 'Openyard_Server_Baseboard');
      },
      serverModel() {
        return this.server?.model;
      },
      serverSerialNumber() {
        return this.server?.serialNumber;
      },
      serverManufacturer() {
        return this.server?.manufacturer;
      },
      serverFru() {
        return this.selectedChassis?.fru;
      },
      serverImage() {
        if (this.serverFru && this.serverFru.includes('RS101')) {
          return server1u;
        }
        return server2u;
      },
    }),
  },
  created() {
    Promise.all([
      this.$store.dispatch('chassis/getChassisInfo'),
      this.$store.dispatch('system/getSystem'),
    ]).finally(() => this.$root.$emit('overview-server-complete'));
  },
};
</script>

<style lang="scss" scoped>
.card {
  background-color: $card-background;
  border-radius: 20px;
}

.card-body {
  border-radius: 20px;
}

.card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  padding: clamp(1.625rem, -0.1667rem + 2.2222vw, 2.5rem);
  min-height: clamp(300px, 50vh, 440px);
  overflow: hidden;

  @include media-breakpoint-down(lg) {
    min-height: unset;
    flex: 1 1 auto;
  }

  @include media-breakpoint-down(md) {
    height: 300px;
  }
}

.server-image-container {
  position: absolute;
  height: 490px;
  bottom: -14px;
  right: -170px;
  left: auto;
  z-index: 0;

  @include media-breakpoint-down(xl) {
    height: 400px;
  }

  @include media-breakpoint-down(lg) {
    bottom: 0;
    height: 300px;
  }

  @media (max-width: 1100px) {
    height: 200px;
    right: -100px;
    bottom: -80px;
  }

  @include media-breakpoint-down(md) {
    height: 320px;
    bottom: 0;
  }
}

.server-image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.text-muted {
  margin-top: 5px;
}

.card-body .server-image-container {
  transition: transform 0.5s ease;
}

.card-body:hover .server-image-container {
  transform: translateX(-100px);
  transition: 0.5s ease;
}

.z-1 {
  z-index: 1;
}
</style>
