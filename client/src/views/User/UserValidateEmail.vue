<template>
  <div class="flex  flex-col  max-h">
    <div class="u-scroll-in  flex-grow  form-wrapper">
      <div>
        <h2 class="titre-1">
          Validation de votre adresse courriel
        </h2>
      </div>
      <div
        class="text-center  mt-6  p-6"
        data-testid="email-validation-result"
      >
        <p v-if="validating">
          <VIcon
            class="text-gray-600"
            name="ri-loader-4-line"
          />
          Nous sommes en train de vérifier vos informations...
        </p>
        <p
          v-if="validated === true"
          data-testid="validated"
        >
          <VIcon
            class="text-default--success"
            name="ri-checkbox-circle-line"
          />
          {{ message || 'Votre adresse courriel a été validée' }}
        </p>
        <p v-if="validated === false">
          <VIcon
            class="text-default--error"
            name="ri-close-circle-line"
          />
          Votre adresse courriel n'a pas pu être validée
        </p>
        <p class="mt-6">
          <router-link
            v-slot="{ navigate }"
            to="/"
            custom
          >
            <button
              role="link"
              class="btn  btn-primary"
              data-testid="btn-home"
              @click="navigate"
              @keypress.enter="navigate"
            >
              Revenir à l'accueil
            </button>
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/index.js'

export default {
  name: 'UserValidateEmail',

  data () {
    return {
      message: undefined,
      validating: false,
      validated: undefined,
    }
  },

  async mounted () {
    this.validating = true
    const id = this.$route.query.id
    const hash = this.$route.query.h
    try {
      const { message } = await api.validateEmail(id, hash)
      this.validated = true
      this.message = message
    } catch (error) {
      this.validated = false
    }
    this.validating = false
  },
}
</script>

<style>
.success {
  fill: var(--text-default-success)
}

.error {
  fill: var(--text-default-error)
}
</style>
