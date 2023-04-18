
export const isEqual = a => b => a === b
export const isTruthy = a => !!a
export const isPositiveInteger = nb => typeof nb === 'number' && Math.floor(nb) === nb && nb >= 0
export const identity = x => x


export function getDateFromISOString (date) {
  return new Date(date)
}


export function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16),
  )
}


export const transformObject = fn => object => Object.fromEntries(Object.entries(object).map(fn))
