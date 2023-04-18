<template>
  <li class="list-none  flex">
    <span
      :class="{
        'icon-error-fill  text-default--error': !valid,
        'icon-success-fill  text-default--success': valid,
      }"
      aria-hidden="true"
    />
    <span class="ml-2">{{ text }}</span>
    <slot />
  </li>
</template>

<script>
export default {
  name: 'AppChecker',

  props: {
    valid: Boolean,
    text: {
      type: String,
      default: '',
    },
  },
}
</script>
