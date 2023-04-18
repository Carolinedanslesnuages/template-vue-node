<script>
import { defineComponent } from 'vue'
import AppInput from './AppInput.vue'
import { getRandomId } from '../util/random-utils.js'
export default defineComponent({
  name: 'AppInputGroup',
  components: {
    AppInput,
  },
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      default: undefined,
    },
    descriptionId: {
      type: String,
      default () {
        return getRandomId('input', 'message-desc')
      },
    },
    label: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    labelVisible: Boolean,
    modelValue: {
      type: String,
      default: undefined,
    },
    placeholder: {
      type: String,
      default: 'Placeholder',
    },
    errorMessage: {
      type: String,
      default: undefined,
    },
    validMessage: {
      type: String,
      default: undefined,
    },
  },
  emits: ['update:modelValue'],
  computed: {
    message () {
      return this.errorMessage || this.validMessage
    },
    messageClass () {
      return this.errorMessage ? 'error-text' : 'valid-text'
    },
    messageIcon () {
      return this.errorMessage ? 'ri-alert-line' : 'ri-checkbox-circle-line'
    },
  },
  watch: {
    modelValue (nv, ov) {
      console.log({ nv, ov })
    },
  },
})
</script>

<template>
  <div
    class="input-group"
    :class="{
      'input-group--error': errorMessage,
      'input-group--valid': validMessage,
    }"
  >
    <slot name="before-input" />
    <slot />
    <AppInput
      v-if="!$slots.default"
      v-bind="$attrs"
      :is-valid="!!validMessage"
      :is-invalid="!!errorMessage"
      :label="label"
      :hint="hint"
      :description-id="descriptionId"
      :label-visible="labelVisible"
      :model-value="modelValue"
      :placeholder="placeholder"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <div
      v-if="message"
      class="messages-group"
    >
      <p
        :id="descriptionId"
        :data-testid="descriptionId"
        :class="messageClass"
      >
        <span>{{ message }}</span>
      </p>
    </div>
  </div>
</template>