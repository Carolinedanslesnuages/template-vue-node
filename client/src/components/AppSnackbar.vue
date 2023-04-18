<template>
  <transition name="bounce">
    <div
      v-show="show"
      class="snackbar"
    >
      <appAlert
        class="shadow-md  m-0"
        :class="type"
        :type="type"
        small
        data-testid="snackbar"
        :description="message"
        :closeable="type ==='error'"
        @close="closeSnackbar()"
      />
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'
import AppAlert from './AppAlert.vue'

export default {

  name: 'AppSnackbar',

  components: {
    AppAlert,
  },

  computed: {
    ...mapState({
      messages: state => state.snackbar.messages,
      message: state => state.snackbar.message,
      show: state => state.snackbar.show,
      type: state => state.snackbar.type || 'info',
    }),

  },
  watch: {
    // ferme la snackbar d'erreur au changement de route
    $route (to, from) {
      this.closeSnackbar()
    },
  },

  methods: {
    closeSnackbar () {
      if (this.type === 'error') {
        return this.$store.dispatch('hideMessage')
      }
    },
  },
}
</script>

<style scoped>
.snackbar {
  @apply flex  space-x-4  bg-white  text-sm  font-bold  px-4  py-3  my-8  fixed  bottom-0;

  left: 50%;
  transform: translateX(-50%);
  z-index: 1050;
}

.bounce-enter-active,
.snackbar-leave-active {
  transition: all 0.2s ease-in-out;
}

.bounce-enter,
.bounce-leave-to {
  opacity: 0;
  transition: all 0.3s ease-in-out;
}
</style>
