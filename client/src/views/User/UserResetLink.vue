<template>
  <div class="flex  flex-col  max-h">
    <div
      v-if="!done"
      class="u-scroll-in  flex-grow  form-wrapper"
    >
      <div
        class="login-header"
      >
        <h2 class="titre-1">
          Veuillez choisir un nouveau mot de passe :
        </h2>
      </div>
      <form
        class="form  mx-auto  p-4"
        @submit.prevent="resetPassword"
      >
        <AppInputGroup
          :error-message="confirmPasswordValidator && passwordValidator"
        >
          <div class="my-2  relative">
            <AppInput
              v-model="password"
              :type="tmpType"
              label="Mot de passe"
              label-visible
              required="required"
              autofocus
              placeholder="53CR37P455"
              data-testid="input-password"
              @change="isPasswordDirty = true"
            />

            <div class="absolute  right-2  top-[55%]">
              <VIcon
                :name="eyeIcon"
                scale="1.25"
                :title="tmpTitle"
                @click="togglePassword()"
              />
            </div>
          </div>

          <password-hints :password="password" />

          <div class="my-2  relative">
            <AppInput
              v-model="confirmPassword"
              :type="tmpType"
              label="Confirmation du mot de passe"
              label-visible
              required="required"
              autofocus
              placeholder="53CR37P455"
              data-testid="input-confirm-password"
              @change="isPasswordDirty = true"
            />

            <div class="absolute  right-2  top-[55%]">
              <VIcon
                :name="eyeIcon"
                scale="1.25"
                :title="tmpTitle"
                @click="togglePassword()"
              />
            </div>
          </div>
        </AppInputGroup>
        <div class="flex  justify-end">
          <AppButton
            class="m-4"
            data-testid="btn-reset-password"
            :disabled="!isValid"
            :aria-disabled="!isValid"
            label="Enregistrer mon nouveau mot de passe"
            icon="ri-lock-line"
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
          Votre mot de passe a bien été modifié
        </h2>
        <AppButton
          v-if="!isLoggedIn"
          class="btn-info  m-2"
          data-testid="goto-login"
          @click="$router.push('/').catch(() => {})"
        >
          <VIcon
            class="mr-1"
            name="ri-arrow-drop-left-line"
          />
          S'identifier
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/index.js'

import PasswordHints from './components/PasswordHints.vue'
import AppInputGroup from '../../components/AppInputGroup.vue'
import AppButton from '../../components/AppButton.vue'
import AppInput from '../../components/AppInput.vue'

import * as messages from '@/util/messages.js'

import {
  validatePassword,
} from '@/util/index.js'

export default {
  name: 'UserResetLink',

  components: {
    PasswordHints,
    AppInputGroup,
    AppButton,
    AppInput,
  },

  data () {
    return {
      done: undefined,
      tmpType: 'password',
      tmpTitle: 'Afficher le mot de passe',
      eyeIcon: 'ri-eye-line',
      password: undefined,
      confirmPassword: undefined,
    }
  },

  computed: {
    isConfirmPasswordValid () {
      return this.password === this.confirmPassword ? true : messages.MISMATCHING_PASSWORD
    },

    isPasswordValid () {
      return validatePassword(this.password) ? true : messages.NOT_STRONG_ENOUGH_PASSWORD
    },

    isValid () {
      return this.isConfirmPasswordValid && this.isPasswordValid
    },
  },

  methods: {
    async resetPassword () {
      const { email, hash } = this.$route.query
      // this.$store.dispatch('sendNewPassword', password)
      const { success, message } = await api.resetPassword(email, hash, this.password)
      if (!success) {
        this.$store.dispatch('setMessage', { type: 'error', message })
        return
      }
      this.done = true
    },

    togglePassword () {
      this.tmpType = this.tmpType === 'password' ? 'text' : 'password'
      this.tmpTitle = this.tmpType === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe'
      this.eyeIcon = this.tmpType === 'password' ? 'ri-eye-line' : 'ri-eye-off-line'
    },
  },
}
</script>
