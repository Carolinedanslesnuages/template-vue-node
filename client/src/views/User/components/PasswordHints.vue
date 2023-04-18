<template>
  <AppHighlight
    small
    class="mt-4  !ml-0"
  >
    <transition name="squeeze">
      <div
        v-show="showHints"
        class="text-label--grey  text-sm"
      >
        <span class="hint  text-sm">Pour créer votre mot de passe, utilisez au moins :</span>
        <ul
          class="pl-0"
        >
          <transition
            v-for="([key, value]) in checks"
            :key="key"
            name="squeeze"
          >
            <AppChecker
              v-show="!value"
              :text="key"
              :valid="value"
            />
          </transition>
        </ul>
      </div>
    </transition>
  </AppHighlight>
</template>

<script>
import { strongEnoughPasswordObject } from '@/util/regex-util.js'

import AppChecker from './AppChecker.vue'

export default {
  name: 'PasswordHints',

  components: {
    AppChecker,
  },
  props: {
    password: {
      type: String,
      default: '',
    },
  },

  computed: {
    checks () {
      return Object.entries(strongEnoughPasswordObject).map(
        ([key, regex]) => ([key, regex.test(this.password)]),
      )
    },
    showHints () {
      return this.checks.some(check => !check[1])
    },
  },
}
</script>

<style scoped>
.squeeze-enter-active {
  transform-origin: top center;
  animation: squeeze-in 1s;
}

.squeeze-leave-active {
  transform-origin: top center;
  animation: squeeze-in 1s reverse;
}

@keyframes squeeze-in {
  0% {
    transform: scaleY(0);
  }

  20% {
    transform: scaleY(0);
  }

  50% {
    transform: scaleY(0.75);
  }

  100% {
    transform: scaleY(1);
  }
}
</style>
