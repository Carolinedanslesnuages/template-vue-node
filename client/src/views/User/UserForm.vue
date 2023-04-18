<template>
  <div class="flex justify-center">
    <div class="">
      <h2 class="flex justify-center m-4 p-4 uppercase">
        {{ isEdit ? 'Mon compte' : 'Création de compte' }}
      </h2>
      <AppAlert
        type="info"
        class="flex justify-center m-4"
        description="Tous les champs sont requis"
        small
      />
      <form>
          <div class="flex  justify-center  items-end">
            <div class="">
              <AppInput
                :model-value="email"
                type="text"
                label="Email"
                hint="L'email: 3 caractères minimum et 20 maximum"
                name="email"
                :is-invalid="email && !isValidEmail"
                :disabled="isEdit && !changeEmail"
                label-visible
                required="required"
                data-testid="input-email"
                @update:model-value="update('email', $event)"
              >
                <template #required-tip>
                  &nbsp;
                </template>
              </AppInput>
            </div>

          </div>
          <AppCheckbox
            v-show="isEdit"
            id="change-email"
            :model-value="changeEmail"
            name="change-email"
            :checked="changeEmail"
            data-testid="check-change-email"
            label="Modifier mon email"
            @update:model-value="update('changeEmail', $event)"
          />

          <div
            v-if="!isEdit"
            class="flex  justify-between  <lg:inline"
          >
            <div class="relative  mr-2  <lg:mr-0  w-full">
              <AppInput
                :model-value="password"
                :type="tmpType"
                label="Mot de passe"
                label-visible
                required="required"
                placeholder="******"
                data-testid="input-password"
                :disabled="isEdit"
                :is-invalid="password && !isValidPassword"
                @update:model-value="update('password', $event)"
              >
                <template #required-tip>
                  &nbsp;
                </template>
              </AppInput>
              <div class="absolute  right-4  top-10">
                <VIcon
                  :name="eyeIcon"
                  :class="eyeIcon"
                  data-testid="eye-icon"
                  scale="1.25"
                  :title="tmpTitle"
                  @click="togglePassword()"
                />
              </div>
              <password-hints
                v-if="!isEdit"
                :password="password"
              />
            </div>
            <div class="relative  w-full">
              <AppInput
                :model-value="confirmPassword"
                :type="tmpType"
                label="Confirmation du mot de passe"
                :is-invalid="confirmPassword && !isValidConfirmPassword"
                label-visible
                required="required"
                placeholder="*****"
                :disabled="isEdit"
                data-testid="input-confirm-password"
                @update:model-value="update('confirmPassword', $event)"
              >
                <template #required-tip>
                  &nbsp;
                </template>
              </AppInput>
              <div class="absolute  right-4  top-10">
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
          </div>
      </form>
    </div>
  </div>
  <footer class="">
    <div class="flex justify-center">
      <AppButton
        v-if="!isEdit"
        label="Créer mon compte"
        data-testid="add-user"
        :disabled="!isValid"
        :aria-disabled="!isValid"
        icon="ri-add-circle-line"
        @click="saveUser"
      />
      <AppButton
        v-else
        label="Modifier mon compte"
        data-testid="add-user"
        class="bottom-button"
        :disabled="!isValid"
        :aria-disabled="!isValid"
        icon="ri-save-2-line"
        @click="saveUser"
      />
      <AppButton
        label="Annuler"
        data-testid="cancel-and-go-back"
        class="bottom-button"
        secondary
        icon="ri-close-fill"
        @click="goBack"
      />
    </div>
  </footer>
</template>

<script>
import { mapState } from 'vuex'

import PasswordHints from './components/PasswordHints.vue'
import AppAlert from '../../components/AppAlert.vue'
import AppInput from '../../components/AppInput.vue'
import AppButton from '../../components/AppButton.vue'
import AppFieldset from '../../components/AppFieldset.vue'
import AppCheckbox from '../../components/AppCheckbox.vue'
import { OhVueIcon as VIcon } from 'oh-vue-icons'

import {
  validateEmail,
  validatePassword,
} from '@/util/index.js'

const userKeys = [
  'email',
  'password',
  'confirmPassword',
  'lastname',
  'firstname',
  'email',
  'service',
  'oldService',
  'isProfileIjCheck',
  'profileIjRequestDate',
  'profileIjValidationDate',
  'profile',
  'centeringCity',
  'centeringLatitude',
  'centeringLongitude',
]

const userDefaultData = userKeys.reduce((acc, cur) => {
  return {
    ...acc,
    [cur]: undefined,
  }
}, {})

export default {
  name: 'UserForm',

  components: {
    PasswordHints,
    AppAlert,
    AppInput,
    AppButton,
    AppFieldset,
    AppCheckbox,
  },
  emits: ['click'],

  data () {
    return {
      ...userDefaultData,
      isEdit: this.$route.meta.isEdit,
      createdAt: undefined,
      id: undefined,
      isSaving: false,
      allValid: undefined,
      allValidForUpdated: undefined,
      changeEmail: false,
      tmpType: 'password',
      tmpTitle: 'Afficher le mot de passe',
      eyeIcon: 'ri-eye-line',
      isDirty: false,
    }
  },

  computed: {
    ...mapState({
      type: state => state.snackbar.type,
    }),

    isValidEmail () {
      return validateEmail(this.email)
    },
    isValidPassword () {
      return validatePassword(this.password)
    },
    isValidConfirmPassword () {
      return validatePassword(this.confirmPassword) && this.password === this.confirmPassword
    },

    isLoggedIn () {
      return this.$store.state.currentUser.loggedIn
    },

    isValid () {
      const allValid = this.email && this.isValidEmail &&
          this.password && this.isValidPassword &&
          this.confirmPassword && this.isValidConfirmPassword

      const allValidForUpdated = this.email && this.isValidEmail &&
        this.changeEmail || !this.changeEmail

      if (!this.isLoggedIn) {
        return !!allValid
      }
      return !!allValidForUpdated
    },
  },

  mounted () {
    if (this.isLoggedIn) {
      const leanUserKeys = userKeys
        .filter(key => !key.includes('assword'))
        .concat('createdAt', '_id')
      const user = this.$store.state.currentUser
      for (const key of leanUserKeys) {
        this[key] = user[key]
      }    
    }
  },

  methods: {


    togglePassword () {
      this.tmpType = this.tmpType === 'password' ? 'text' : 'password'
      this.tmpTitle = this.tmpType === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe'
      this.eyeIcon = this.tmpType === 'password' ? 'ri-eye-line' : 'ri-eye-off-line'
    },

    async saveUser () {
      if (!this.isLoggedIn && !this.isValid) {
        return
      }
      this.isSaving = true
      const userData = {}
      const leanUser = this.isEdit
        ? userKeys.filter(key => !key.includes('assword') && !key.includes('mail')).concat('createdAt', '_id')
        : userKeys.concat('createdAt', '_id')
      for (const key of leanUser) {
        userData[key] = this[key]
      }
      await this.$store.dispatch('saveCurrentUser', userData)
      this.redirectAfterSaving()
      this.isSaving = false
    },

    redirectAfterSaving () {
      if (this.type === 'error') {
        return
      }
      if (!this.isEdit) {
        this.$router.push({
          name: 'login',
        }).catch(e => console.log(e))
      } else {
        this.$router.push({
          name: 'dashboard',
        }).catch(e => console.log(e))
      }
    },

    touch () {
      this.isDirty = true
    },

    update (key, value) {
      this.touch()
      this[key] = value
    },
  },
}
</script>
<style>
div.input-group,
div.select-group {
  padding-bottom: 1.5rem;
}
</style>
