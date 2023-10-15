import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastRequest } from './toast-models/toast-request';

@Component({
  selector: 'app-toast-helper',
  templateUrl: './toast-helper.component.html',
  styleUrls: ['./toast-helper.component.css']
})
export class ToastHelperComponent implements OnInit {

  @Input() helper_config : ToastRequest

  @Output() dismiss_toast : EventEmitter<any> = new EventEmitter()

  public action : boolean //confirm or deny
  
  public bg_color : string

  constructor() { }

  public dismissToast() : void{
    let toast_response = { type: 'acknowledge', callback : this.helper_config.actions.acknowledge }
    this.dismiss_toast.emit(toast_response)
  }

  public confirm() : void{
    let toast_response = {type: 'confirm', confirm : true, callback : this.helper_config.actions.confirm}
    this.dismiss_toast.emit(toast_response)
  }

  public decline() : void{
    let toast_response = {type: 'confirm', confirm : false, callback : this.helper_config.actions.decline}
    this.dismiss_toast.emit(toast_response)
  }

  ngOnInit(): void {
    
    this.bg_color = localStorage.getItem("spotbie_backgroundColor")

    //console.log("Current Config: ", this.helper_config)
    //Let's find out what type of toast message we are showing
    switch(this.helper_config.type){
      case "acknowledge":
        //set time out to disappear
        setTimeout(function(){
          this.dismissToast()
        }.bind(this), 1500)
        break
      case "confirm":
        break
    }

  }

}
