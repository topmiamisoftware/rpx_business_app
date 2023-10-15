import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Reward } from 'src/app/models/reward';

@Component({
  selector: 'app-reward',
  templateUrl: './reward.component.html',
  styleUrls: ['./reward.component.css']
})
export class RewardComponent implements OnInit {

  @Output('closeWindowEvt') closeWindowEvt = new EventEmitter()

  @Input('fullScreenMode') fullScreenMode: boolean = true

  @Input('reward') reward: Reward

  @Input('userPointToDollarRatio') userPointToDollarRatio: number

  public loading: boolean = false
  
  public infoObjectImageUrl = 'assets/images/home_imgs/spotbie-white-icon.svg'

  public successful_url_copy: boolean = false

  public rewardLink: string = null

  constructor() { }

  public getFullScreenModeClass(){

    console.log("getFullScreenModeClass", this.fullScreenMode)

    if(this.fullScreenMode)
      return 'fullScreenMode'
    else
      return ''
  
  }

  public closeThis(){
    this.closeWindowEvt.emit()
  }

  public linkCopy(input_element) {
    
    input_element.select();
    document.execCommand('copy');
    input_element.setSelectionRange(0, input_element.value.length);
    this.successful_url_copy = true;

    setTimeout(function() {
      this.successful_url_copy = false;
    }.bind(this), 2500);

  }

  ngOnInit(): void {

  }

}
