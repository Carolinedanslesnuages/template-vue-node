import bcrypt from 'bcryptjs'

/**
 * Hache un mot de passe selon l'algorithme bcrypt
 *
 * @function
 *
 * @param {string} password - Mot de passe à hacher
 */
export function getHash (password) {
  return bcrypt.hashSync(password, 8)
}

/**
 * Vérifie qu'un hachage selon l'algorithme bcrypt correspond à un mot de passe
 *
 * @function
 *
 * @param {string} original - Mot de passe haché
 * @param {string} password - Mot de passe en clair
 */
export const compareToHash = bcrypt.compareSync
