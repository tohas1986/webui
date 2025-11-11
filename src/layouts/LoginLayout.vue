<template>
  <main>
    <div class="login-container">
      <div class="login-aside">
        <div class="login-brand">
          <img svg-inline src="@/assets/images/logo-OY.svg" :alt="altLogo" />
        </div>
      </div>
      <div class="login-main">
        <router-view class="login=form form-background" />
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'LoginLayout',
  data() {
    return {
      altLogo: process.env.VUE_APP_COMPANY_NAME || 'noname',
      customizableGuiName: process.env.VUE_APP_GUI_NAME || '',
    };
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 100%;
  height: 100%;
  background: $form-color;

  @include media-breakpoint-up('md') {
    flex-direction: row;
  }
}

.login-main {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 50vh;
  padding: clamp(1.25rem, 3vw, 3.125rem);

  @include media-breakpoint-up('md') {
    background: $form-color;
    flex-grow: 1;
    position: relative;
    height: 100vh;
    z-index: 1;
  }

  &:before {
    content: '';
    position: absolute;
    width: calc(100% + 1.25rem);
    height: 100%;
    left: -20px;
    z-index: -1;
    top: 0;
    background-color: $form-color;
    border-radius: 20px 0 0 20px;
  }
}

.login-form {
  @include media-breakpoint-up('md') {
    width: 100%;
  }
}

.login-aside {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: $login-background;
  background-image: url('../assets/images/login-background-image.png');
  background-repeat: no-repeat;
  background-size: cover;

  @include media-breakpoint-up('md') {
    width: clamp(300px, 45.5vw, 920px);
    align-items: flex-start;
    flex: 0 0 auto;
  }
  @include media-breakpoint-up('xxl') {
    width: 45%;
  }
}

.login-brand {
  margin-top: 40px;

  @include media-breakpoint-up('md') {
    margin-left: 30px;
  }
}

.login-brand img {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
