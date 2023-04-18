import { createStore } from 'vuex'

import users from './users.js'
import currentUser from './current-user.js'
import snackbar from './snackbar.js'
import connection from './connection.js'

const store = createStore({
  modules: {
    currentUser,
    users,
    snackbar,
    connection,
  },
})

export default store
