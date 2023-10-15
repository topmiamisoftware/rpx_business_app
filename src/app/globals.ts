'user strict'

import { environment } from 'src/environments/environment'

export const API = `${environment.apiEndpoint}`
export const RESOURCES = `${environment.apiEndpoint}`
export const DEFAULTS = `${environment.apiEndpoint}defaults/`
export const FRONT_END = '/'

export const CHAT = 'https://express.spotbie.com:8080'

export const NEW_USER_DEFAULT = `${DEFAULTS}user.png`

var today = new Date()
var date = today.getFullYear()+'.'+(today.getMonth()+1)+'.'+today.getDate()
export const VERSION = "Version: Beta " + date

// export const LOGIN_USER_API = "https://www.spotbie.com/"