import { ToastActions } from './toast-actions'

export class ToastRequest{
    public type : string
    public text : any = {
        info_text : '',
        confirm : '',
        decline : '',
    }

    public actions ?: ToastActions
}