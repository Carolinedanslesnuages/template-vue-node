<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'AppFieldset',
  props: {
    legend: {
      type: String,
      default: '',
    },
    legendClass: {
      type: [String, Object],
      default: '',
    },
    legendId: {
      type: String,
      default: undefined,
    },
    hint: {
      type: String,
      default: '',
    },
    hintClass: {
      type: [String, Object],
      default: '',
    },
  },
})
</script>

<template>
  <fieldset class="fieldset">
    <legend
      v-if="legend || $slots.legend?.().length"
      :id="legendId"
      class="fieldset__legend"
      :class="legendClass"
    >
      {{ legend }}
      <!-- @slot Slot pour le contenu du titre du `fieldset` (sera dans `<legend class="fieldset__legend">`). Une props du même nom est utilisable pour du texte simple sans mise en forme. -->
      <slot name="legend" />
    </legend>
    <div
      v-if="hint || $slots.hint?.().length"
      class="fieldset__element"
    >
      <span
        class="hint-text"
        :class="hintClass"
      >
        {{ hint }}
        <!-- @slot Slot pour le contenu de l’indice (sera dans `<span class="hint-text">` qui sera dans `</legend>`). Une **props du même nom est utilisable pour du texte simple** sans mise en forme. -->
        <slot name="hint" />
      </span>
    </div>
    <!-- @slot Slot par défaut pour le contenu du fieldset (sera dans `<fieldset>`, après `</legend>`) -->
    <div class="fieldset__element">
      <slot />
    </div>
  </fieldset>
</template>