<template>
  <b-modal id="modal-support" ref="modal" centered ok-only>
    <div class="modal-body">
      <div class="modal-support-image">
        <img src="@/assets/images/qr-code-support.png" />
        <b-link class="card-link" href="https://lk.openyard.ru/auth/login">{{
          $t('pageEventLogs.modal.supportLink')
        }}</b-link>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss" scoped>
.modal-body {
  display: flex;
  justify-content: center;
}

.modal-support-image {
  max-width: 80%;
  text-align: center;
}
</style>
