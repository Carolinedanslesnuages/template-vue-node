// eslint-disable-next-line no-useless-escape
export const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@mainbot.me$/
// eslint-disable-next-line no-useless-escape
export const strongPassword = [
  /^.{8,}$/,
  /.*\d+/,
  /.*[A-Z]+/,
  /.*[a-z]+/,
  /.*\W+/,
]
