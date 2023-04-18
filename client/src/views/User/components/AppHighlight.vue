<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'AppHighlight',
  props: {
    text: {
      type: String,
      default: undefined,
    },
    small: Boolean,
    large: Boolean,
  },
})
</script>

<template>
  <div class="highlight">
    <p
      :class="{
        'text--lg': large && !small,
        'text--sm': small && !large,
      }"
    >
      {{ text }}
      <!-- @slot Slot par défaut pour le contenu de la mise en exergue -->
      <slot />
    </p>
  </div>
</template>