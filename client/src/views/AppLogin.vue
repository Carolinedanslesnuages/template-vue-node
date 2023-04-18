<template>
  <div class="flex  flex-col  max-h">
    <AppAlert
      v-show="showText"
      class="mx-auto  mt-2 bg-gray-100 <md:w-4/5"
      description="Firefox est recommandé pour une expérience optimale"
      type="info"
      small
    />
    <div class="flex justify-center m-8 pt-2">
      <form class="form  mx-auto  m-8  p-8">
        <h2 class="text-center m-4 p-4 uppercase font-weight text-gray-800">
          Connexion
        </h2>
          <div class="my-2">
            <AppInput
              v-model="email"
              class="m-4 p-4"
              type="text"
              label="email"
              hint=""
              name="email"
              placeholder="0123456"
              :is-invalid="isemailDirty && !isEmailValid"
              label-visible
              autofocus
              required="required"
              data-testid="input-email"
              @change="isemailDirty = true"
            >
              <template #required-tip>
                &nbsp;
              </template>
            </AppInput>
          </div>

          <div class="my-2  relative">
            <AppInput
              v-model="password"
              :type="tmpType"
              class="m-4 p-4"
              label="Mot de passe"
              label-visible
              required="required"
              placeholder="53CR37P455"
              data-testid="input-password"
              @change="isPasswordDirty = true"
            >
              <template #required-tip>
                &nbsp;
              </template>
            </AppInput>

            <div class="absolute  right-2  top-[55%]">
              <VIcon
                :name="eyeIcon"
                :class="eyeIcon"
                data-testid="eye-icon"
                scale="1.25"
                :title="tmpTitle"
                @click="togglePassword()"
              />
            </div>
          </div>
        <AppButton
          class="mt-2 mx-auto  w-full  justify-center"
          data-testid="authenticate-user"
          @click.prevent="authenticate"
        >
          Se connecter
        </AppButton>

        <div class="mt-12">
          <div class="flex  items-center">
            <AppNavigationMenuLink
              class="flex  mx-2  color-navigation-link"
              :to="{name:'user-reset-password'}"
              text="→ Mot de passe oublié"
              data-testid="reset-password"
            />
          </div>
          <div class="flex  items-center">
            <AppNavigationMenuLink
              class="flex  mx-2 "
              :to="{name:'user-create'}"
              text="→ Création de compte"
              data-testid="add-user"
            />
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import {
  mapState,
} from 'vuex'

import { validateEmail, validate } from '@/util/index.js'
import { defineComponent } from 'vue'
import * as messages from '@/util/messages.js'
import AppAlert from '../components/AppAlert.vue'
import AppInput from '../components/AppInput.vue'
import AppButton from '../components/AppButton.vue'
import AppNavigationMenuLink from '../components/AppNavigationMenuLink.vue'

export default defineComponent({
  name: 'AppLogin',

  components:  {
    AppAlert,
    AppInput,
    AppButton,
    AppNavigationMenuLink,
  },

  data () {
    return {
      isemailDirty: false,
      isPasswordDirty: false,
      email: undefined,
      password: undefined,
      tmpType: 'password',
      tmpTitle: 'Afficher le mot de passe',
      eyeIcon: 'ri-eye-line',
      emailValidator: validate(validateEmail, "Le email n'est pas valide"),
      showText: false,
    }
  },

  computed: {
    ...mapState({
      isLoggedIn: state => state.currentUser?.loggedIn,
    }),

    isEmailValid () {
      return this.email?.length === 7
    },

    isPasswordValid () {
      return this.password
    },

    isAllValid () {
      return this.isEmailValid && this.isPasswordValid
    },

    errorMessage () {
      if (this.isemailDirty && !this.isEmailValid) {
        return messages.INVALID_email
      }
      if (this.isPasswordDirty && !this.isPasswordValid) {
        return messages.MISSING_PASSWORD
      }
      return ''
    },
  },

  async mounted () {
    await this.$store.dispatch('logout')
    const currentBrowser = navigator.userAgent
    if (!currentBrowser.includes('Firefox')) {
      this.showText = true
    }
  },

  methods: {
    async authenticate ({ dispatch }) {
      console.log(this.email, this.password)
      if (!this.email || !this.password) {
        this.$store.dispatch('setMessage', { type: 'error', message: 'Tous les champs sont obligatoires', timeout: 2000 })
        return
      }
      try {
        const credentials = { email: this.email, password: this.password }
        await this.$store.dispatch('authenticate', credentials)
        this.$router.push({ name: 'dashboardView' }).catch(() => {})
      } catch (error) {
        this.$store.dispatch('setMessage', { type: 'error', message: error.message })
      }
    },
    togglePassword () {
      this.tmpType = this.tmpType === 'password' ? 'text' : 'password'
      this.tmpTitle = this.tmpType === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe'
      this.eyeIcon = this.tmpType === 'password' ? 'ri-eye-line' : 'ri-eye-off-line'
    },
  },

})
</script>

<style>
.color-navigation-link {
  color: var(--blue-france-500)
}

</style>
