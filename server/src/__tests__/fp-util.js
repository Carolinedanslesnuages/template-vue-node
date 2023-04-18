/**
 * Répète `n` fois la fonction passée en paramètre
 *
 * @param {number} n - Nombre de répétition de la fonction
 *
 * @returns {repeatFnNTimes} - Une fonction qui répètera n fois la fonction qui lui sera passée en paramètre
 */
export const repeatFn = nb => fn => Array.from({ length: nb }).map(() => fn())

/**
 * @typedef repeatFnNTimes
 * @type {function}
 *
 * @param {function} fn - Fonction à répéter
 *
 * @returns {any[]} - Un tableau de longueur `n` avec les résultats de chaque invocation de la fonction
 */
