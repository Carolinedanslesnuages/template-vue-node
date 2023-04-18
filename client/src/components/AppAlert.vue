<script>
import { defineComponent } from 'vue'
import { getRandomId } from '../util/random-utils.js'
export default defineComponent({
  name: 'AppAlert',
  props: {
    id: {
      type: String,
      default () {
        return getRandomId('basic', 'alert')
      },
    },
    type: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    titleTag: {
      type: String,
      default: 'h3',
    },
    small: Boolean,
    closed: Boolean,
    closeable: Boolean,
  },
  emits: ['close'],
  computed: {
    error () {
      return this.type === 'error'
    },
    success () {
      return this.type === 'success'
    },
    warning () {
      return this.type === 'warning'
    },
    info () {
      return this.type === 'info'
    },
    classes () {
      return {
        'alert--error': this.error,
        'alert--success': this.success,
        'alert--warning': this.warning,
        'alert--info': this.info,
      }
    },
  },
  methods: {
    onClick () {
      this.$emit('close')
    },
  },
})
</script>

<template>
  <transition name="slide-fade">
    <div
      v-if="!closed"
      :id="id"
      class="alert"
      :class="classes"
    >
      <div class="alert-content">
        <component
          :is="titleTag"
          v-if="!small"
        >
          {{ title }}
        </component>
        <p>
          {{ description }}
        </p>
      </div>
      <button
        v-if="closeable"
        title="Fermer"
        aria-label="Fermer"
        @click="onClick"
      >Fermer</button>
    </div>
  </transition>
</template>

<style>

.alert {
  @apply p-2 rounded-md text-center text-white
}

.alert-content {
  @apply mt-2
}

.alert--error {
  @apply bg-red-500
}

.alert--success {
  @apply bg-green-500
}

.alert--warning {
  @apply bg-yellow-500
}

.alert--info {
  @apply bg-blue-500
}

.btn-alert {
@apply bg-blue-500
}
</style>