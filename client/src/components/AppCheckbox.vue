<script>
import { defineComponent } from 'vue'
import { getRandomId } from '../util/random-utils.js'
export default defineComponent({
  name: 'AppCheckBox',
  props: {
    id: {
      type: String,
      default () {
        return getRandomId('basic', 'checkbox')
      },
    },
    name: {
      type: String,
      required: true,
    },
    required: Boolean,
    modelValue: Boolean,
    label: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    validMessage: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  computed: {
    message () {
      return this.errorMessage || this.validMessage
    },
    additionalMessageClass () {
      return this.errorMessage ? 'error-text' : 'valid-text'
    },
  },
})
</script>

<template>
  <div
    class="checkbox-group"
    :class="{
      'checkbox-group--error': errorMessage,
      'checkbox-group--valid': validMessage,
    }"
  >
    <input
      :id="id"
      :name="name"
      type="checkbox"
      :checked="modelValue"
      v-bind="$attrs"
      :data-testid="`input-checkbox-${id}`"
      :data-test="`input-checkbox-${id}`"
      @change="$emit('update:modelValue', $event.target.checked)"
    >
    <label
      :for="id"
      class="label"
    >
      <slot name="label">
        {{ label }}
        <slot name="required-tip">
          <span
            v-if="required"
            class="required"
          >&nbsp;*</span>
        </slot>
      </slot>

      <span
        v-if="hint"
        class="hint-text"
      >
        {{ hint }}
      </span>
    </label>
    <div
      v-if="message"
      class="messages-group"
    >
      <p
        class="message--info  flex  items-center"
        :class="additionalMessageClass"
      >
        {{ message }}
      </p>
    </div>
  </div>
</template>
<style>

.error-text {
  @apply text-red-300
}

.valid-text {
  @apply text-green-300
}

</style>