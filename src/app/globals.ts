'user strict';

import { environment } from '../environments/environment'

export const API = `${environment.apiEndpoint}`;
export const RESOURCES = `${environment.apiEndpoint}`;

const today = new Date();
const date = today.getFullYear()+'.'+(today.getMonth()+1)+'.'+today.getDate();
export const VERSION = "Version: Beta " + date
