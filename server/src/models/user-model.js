/**
 * Module de définition du Schéma et du modèle de User
 *
 * @module
 */

import mongoose from 'mongoose'
import beautifyUnique from 'mongoose-beautiful-unique-validation'

import
{
  compareToHash,
  getHash,
} from '../util/crypto.js'

import {
  email as regexEmail,
  strongPassword,
} from '../util/regex.js'
import {
  EXISTING_EMAIL_MESSAGE,
  NOT_ALLOWED_EMAIL_MESSAGE,
  MISSING_EMAIL_MESSAGE,
  MISSING_PASSWORD_MESSAGE,
  WEAK_PASSWORD,
} from './messages.js'

const { Schema } = mongoose

/**
 * @constructor UserSchema
 */

const UserSchema = new Schema(
  {
    email: {
      type: String,
      match: [regexEmail, NOT_ALLOWED_EMAIL_MESSAGE],
      required: [true, MISSING_EMAIL_MESSAGE],
      lowercase: true,
      trim: true,
      unique: EXISTING_EMAIL_MESSAGE,
    },
    roles: {
      type: [String],
      enum: ['GESTIONNAIRE', 'SUPERADMIN'],
      default: [],
    },

    password: {
      type: String,
      required: [true, MISSING_PASSWORD_MESSAGE],
      trim: true,
    },

    emailValidationHash: {
      type: String,
      required: false,
    },

    isValidatedEmail: {
      type: Boolean,
      default: false,
    },

    emailValidatedAt: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true },
)

UserSchema.plugin(beautifyUnique)

UserSchema.set('toJSON', {
  transform (doc, ret /*, opt */) {
    delete ret.password
    delete ret.emailValidationHash
    delete ret.__v
    return ret
  },
})

UserSchema.pre('save', async function preSave () {
  const user = this

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return

  const isPasswordStrong = strongPassword.every((regex) =>
    regex.test(user.password),
  )

  if (!isPasswordStrong) {
    throw new Error(WEAK_PASSWORD)
  }

  // Generate a hash
  user.password = getHash(user.password)
})

UserSchema.methods.comparePassword = function comparePassword (
  userPassword,
  cb,
) {
  return compareToHash(userPassword, this.password)
}

export default mongoose.model('User', UserSchema)

/**
 * @typedef UserMongooseDocument
 * @type {UserData & import('mongoose').Document}
 */

/**
 * @typedef UserData
 * @type {Object}
 *
 * @property {Date} createdAt - Date de création du document dans la bdd
 * @property {Date} updatedAt - Date de dernière modification dans la bdd
 * @property {string} email - Adresse courriel de l'utilisateur
 * @property {'GESTIONNAIRE'| 'SUPERADMIN'} roles = Gestionnaire, SuperAdmin
 * @property {string} emailValidationHash - Hash de validation de l'email de l'utilisateur
 * @property {string} emailValidatedAt - Date de validation du courrier de l'utilisateur
 * @property {string} isValidatedEmail - Valeur à (false) si l'email n'est pas valide
 */
