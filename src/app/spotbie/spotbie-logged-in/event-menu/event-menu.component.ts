import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AllowedAccountTypes } from 'src/app/helpers/enum/account-type.enum'
import { LoyaltyPointBalance } from 'src/app/models/loyalty-point-balance'
import { Business } from 'src/app/models/business'
import { Reward } from 'src/app/models/reward'
import { LoyaltyPointsService } from 'src/app/services/loyalty-points/loyalty-points.service'
import { BusinessMenuServiceService } from 'src/app/services/spotbie-logged-in/business-menu/business-menu-service.service'
import { EventCreatorComponent } from './event-creator/event-creator.component'
import { map } from 'rxjs/operators';
import {Preferences} from "@capacitor/preferences";

@Component({
  selector: 'app-event-menu',
  templateUrl: './event-menu.component.html',
  styleUrls: ['./event-menu.component.css']
})
export class EventMenuComponent implements OnInit {

  @ViewChild('eventCreator') eventCreator: EventCreatorComponent

  @Input() fullScreenWindow: boolean = true
  @Input() loyaltyPoints: string

  @Output() closeWindowEvt = new EventEmitter()
  @Output() notEnoughLpEvt = new EventEmitter()

  menuItemList: Array<any>
  itemCreator: boolean = false
  userLoyaltyPoints: number = 0;
  userResetBalance
  userPointToDollarRatio
  rewards: Array<Reward>
  reward: Reward
  qrCodeLink: string = null
  userHash: string = null
  userType: number = null
  business: Business = new Business()
  loyaltyPointsBalance: LoyaltyPointBalance

  constructor(private loyaltyPointsService: LoyaltyPointsService,
              private businessMenuService: BusinessMenuServiceService,
              private router: Router,
              route: ActivatedRoute){
      if(this.router.url.indexOf('business-menu') > -1){
        this.qrCodeLink = route.snapshot.params.qrCode
        this.userHash   = route.snapshot.params.userHash
      }
  }

  getWindowClass(){
    if(this.fullScreenWindow)
      return 'spotbie-overlay-window'
    else
      return ''
  }

  getLoyaltyPointBalance(){
    this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
      this.userLoyaltyPoints = loyaltyPointBalance
    })
  }

  fetchRewards(qrCodeLink: string = null, userHash: string = null){
    let fetchRewardsReq = null

    if(qrCodeLink !== null && userHash !== null){
      fetchRewardsReq = {
        qrCodeLink: qrCodeLink,
        userHash: userHash
      }
    }

    this.businessMenuService.fetchRewards(fetchRewardsReq).subscribe(resp => {
        this.fetchRewardsCb(resp)
      })
  }

  private fetchRewardsCb(resp){
    if(resp.success){
      this.rewards = resp.rewards

      if(this.userType === AllowedAccountTypes.Personal){
        this.userPointToDollarRatio = resp.loyalty_point_dollar_percent_value
        this.business.name = resp.placeToEatName
      }
    }
  }

  addEvent(){
    this.itemCreator = !this.itemCreator
  }

  closeWindow(){
    this.closeWindowEvt.emit()
  }

  editReward(reward: Reward){
    this.reward = reward
    this.itemCreator = true

    // this.eventCreator
  }

  closeeventCreator(){
    this.reward = null
    this.itemCreator = false
  }

  closeeventCreatorAndRefetchRewardList(){
    this.closeeventCreator()
    this.fetchRewards()
  }

  placeToEatTileStyling(reward: Reward)
  {
    if(reward.type === 0)
      return { 'background': 'url(' + reward.images + ')' }
    else
      return { 'background': 'linear-gradient(90deg,#35a99f,#64e56f)' }
  }

  async ngOnInit() {

    let userType = await Preferences.get({key: 'spotbie_userType'});
    this.userType = parseInt(userType.value, 10);

    if(this.userType !== AllowedAccountTypes.Personal){
      this.getLoyaltyPointBalance()
      this.fetchRewards()
    } else {
      if(this.qrCodeLink !== null && this.userHash !== null){
        this.fetchRewards(this.qrCodeLink, this.userHash)
      }
    }
  }
}
