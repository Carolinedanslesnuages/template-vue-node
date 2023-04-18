<script>
import { defineComponent } from 'vue'
import { OhVueIcon as VIcon } from 'oh-vue-icons'
export default defineComponent({
  name: 'AppButton',
  components: {
    VIcon,
  },
  props: {
    disabled: Boolean,
    label: {
      type: String,
      default: undefined,
    },
    secondary: Boolean,
    tertiary: Boolean,
    noOutline: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: undefined,
    },
    size: {
      type: String,
      validator: (val) => ['sm', 'small', 'lg', 'large', 'md', 'medium', '', undefined].includes(val),
      default: undefined,
    },
    iconRight: Boolean,
    iconOnly: Boolean,
  },
  computed: {
    sm () {
      return ['sm', 'small'].includes(this.size)
    },
    md () {
      return ['md', 'medium'].includes(this.size)
    },
    lg () {
      return ['lg', 'large'].includes(this.size)
    },
    center () {
      return this.align === 'center'
    },
    right () {
      return this.align === 'right'
    },
  },
  methods: {
    focus () {
      this.$refs.btn.focus()
    },
  },
})
</script>

<template>
  <button
    ref="btn"
    class="m-4 p-4 bg-blue-500 text-white rounded-md"
    :title="iconOnly ? label : undefined"
    :disabled="disabled"
    :aria-disabled="disabled"
  >
    <VIcon
      v-if="icon"
      :name="icon"
    />
    <span v-if="!iconOnly">
      {{ label }}
      <slot />
    </span>
  </button>
</template>

<style scoped>
.inline-flex {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.reverse {
  flex-direction: row-reverse;
}
</style>