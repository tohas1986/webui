<template>
  <b-container fluid>
    <page-title :description="$t('pagePageNotFound.description')" />
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
export default {
  name: 'PageNotFound',
  components: { PageTitle },
};
</script>
