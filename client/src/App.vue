<template>
  <div class="flex  flex-col  max-h">
    <router-view
      :class="{
        'u-scroll-in': isLoggedIn,
      }"
    />
    <AppSnackbar/>
  </div>
</template>

<script>
import {
  mapState,
} from 'vuex'

import AppSnackbar from "./components/AppSnackbar.vue"

export default {
  name: 'App',

  components: {
    AppSnackbar,
  },

  data () {
    return {
      unsubscribe: undefined,
    }
  },

  computed: {
    ...mapState({
      isLoggedIn: state => state.currentUser.loggedIn,
    }),

  },

  async mounted () {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'logout') {
        this.$router.push({
          name: 'login',
        }).catch(() => {})
      }
    })
  },

  unmounted () {
    this.unsubscribe()
  },

}
</script>
