import { fileURLToPath } from 'url'
import { dirname } from 'path'

// TODO : terminer de sortir la fonction de config.js (cf Stan)
export default fileURLToPath(dirname(import.meta.url))
