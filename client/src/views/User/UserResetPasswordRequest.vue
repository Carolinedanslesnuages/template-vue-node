<template>
  <div class="flex  flex-col  max-h">
    <div
      v-if="!done"
      class="u-scroll-in  flex-grow  form-wrapper"
    >
      <div class="login-header">
        <h2 class="titre-1">
          Veuillez renseigner votre adresse courriel :
        </h2>
      </div>
      <form
        class="form  mx-auto  p-4"
        @submit.prevent="sendEmail"
      >
        <AppInputGroup
          :error-message="isEmailDirty && !isEmailValid ? errorMessage : ''"
        >
          <AppInput
            v-model="email"
            type="email"
            name="email"
            data-testid="input-email-reset-passwd"
            label="Votre adresse courriel"
            label-visible
            placeholder="prenom.nom@mainbot.me"
            autofocus
            required="required"
            @change="isEmailDirty = true"
          />
        </AppInputGroup>
        <div class="flex  justify-end">
          <AppButton
            data-testid="btn-reset-password"
            :disabled="!isEmailValid"
            :aria-disabled="!isEmailValid"
            label="Réinitialiser mon mot de passe"
            icon="ri-lock-unlock-line"
          />
        </div>
      </form>
    </div>
    <div
      v-else
      class="u-scroll-in  flex-grow  form-wrapper"
    >
      <div class="flex  justify-center  flex-wrap">
        <h2 class="titre-1  w-full">
          <VIcon
            class="text-default--success"
            name="ri-checkbox-circle-line"
          />
          Un courriel vous a été envoyé pour réinitialiser votre mot de passe
        </h2>
        <AppButton
          v-if="!isLoggedIn"
          class="btn-info  m-2"
          data-testid="goto-login"
          icon="ri-arrow-drop-left-line"
          label="S'identifier"
          @click="$router.push('/').catch(() => {})"
        />
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/index.js'

import {
  validateEmail,
} from '@/util/index.js'

import * as messages from '@/util/messages.js'
import AppInputGroup from '../../components/AppInputGroup.vue'
import AppInput from '../../components/AppInput.vue'
import AppButton from '../../components/AppButton.vue'

export default {
  name: 'UserPasswordReset',

  components: {
    AppInputGroup,
    AppInput,
    AppButton,  
  },

  data () {
    return {
      messages,
      isEmailDirty: false,
      done: undefined,
      email: undefined,
    }
  },

  computed: {

    isEmailValid () {
      return validateEmail(this.email)
    },

    errorMessage () {
      if (this.isEmailDirty && !this.isEmailValid) {
        return messages.INVALID_EMAIL
      }
      return ''
    },
  },

  methods: {
    async sendEmail () {
      try {
        await api.sendMailResetLink(this.email)
      } catch (error) {
        await this.$store.dispatch('setMessage', { type: 'error', message: error.message })
        return
      }

      this.done = true
    },
  },
}
</script>
