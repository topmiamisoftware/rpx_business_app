import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AllowedAccountTypes } from 'src/app/helpers/enum/account-type.enum'
import { LoyaltyPointBalance } from 'src/app/models/loyalty-point-balance'
import { Business } from 'src/app/models/business'
import { Reward } from 'src/app/models/reward'
import { LoyaltyPointsService } from 'src/app/services/loyalty-points/loyalty-points.service'
import { BusinessMenuServiceService } from 'src/app/services/spotbie-logged-in/business-menu/business-menu-service.service'
import { RewardCreatorComponent } from './reward-creator/reward-creator.component'
import { RewardComponent } from './reward/reward.component'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-reward-menu',
  templateUrl: './reward-menu.component.html',
  styleUrls: ['./reward-menu.component.css']
})
export class RewardMenuComponent implements OnInit {

  @ViewChild('rewardCreator') rewardCreator: RewardCreatorComponent
  @ViewChild('appRewardViewer') appRewardViewer: RewardComponent

  @Input() rewardAppFullScreen: boolean = false
  @Input() fullScreenMode: boolean = true
  @Input() loyaltyPoints: string
  @Input() qrCodeLink: string = null

  @Output() closeWindowEvt = new EventEmitter()
  @Output() notEnoughLpEvt = new EventEmitter()

  eAllowedAccountTypes = AllowedAccountTypes
  menuItemList: Array<any>
  itemCreator: boolean = false
  rewardApp: boolean = false
  userLoyaltyPoints
  userResetBalance
  userPointToDollarRatio
  rewards: Array<Reward> = null
  reward: Reward
  userType: number = null
  business: Business = new Business()
  loyaltyPointsBalance: any
  isLoggedIn: string = null

  constructor(private loyaltyPointsService: LoyaltyPointsService,
              private businessMenuService: BusinessMenuServiceService,
              private router: Router,
              route: ActivatedRoute){
      if(this.router.url.indexOf('business-menu') > -1){
        this.qrCodeLink = route.snapshot.params.qrCode
      }
  }

  getWindowClass(){
    if(this.fullScreenMode)
      return 'spotbie-overlay-window'
    else
      return ''
  }

  getLoyaltyPointBalance(){
    this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointsBalance => {
        this.loyaltyPointsBalance = loyaltyPointsBalance
      })
  }

  fetchRewards(qrCodeLink: string = null){
    const fetchRewardsReq = {
      qrCodeLink: this.qrCodeLink
    }

    this.businessMenuService.fetchRewards(fetchRewardsReq).subscribe(resp => {
        this.fetchRewardsCb(resp)
      })
  }

  private async fetchRewardsCb(resp){
    this.rewards = resp.rewards

    if(this.userType === this.eAllowedAccountTypes.Personal || this.isLoggedIn !== '1'){
      this.userPointToDollarRatio = resp.loyalty_point_dollar_percent_value
      this.business = resp.business
    }
  }

  addItem(){
    if(this.loyaltyPointsBalance.balance === 0){
      this.notEnoughLpEvt.emit()
      this.closeWindow()
      return
    }

    this.itemCreator = !this.itemCreator
  }

  closeWindow(){
    this.closeWindowEvt.emit()
  }

  openReward(reward: Reward){
    this.reward = reward
    this.reward.link = `${environment.baseUrl}business-menu/${this.qrCodeLink}/${this.reward.uuid}`
    this.rewardApp = true
  }

  closeReward(){
    this.reward = null
    this.rewardApp = false
  }

  editReward(reward: Reward){
    this.reward = reward
    this.itemCreator = true
  }

  closeRewardCreator(){
    this.reward = null
    this.itemCreator = false
  }

  closeRewardCreatorAndRefetchRewardList(){
    this.closeRewardCreator()
    this.fetchRewards()
  }

  rewardTileStyling(reward: Reward) {
    if(reward.type === 0)
      return { background: 'url(' + reward.images + ')' }
    else
      return { background: 'linear-gradient(90deg,#35a99f,#64e56f)' }
  }

  ngOnInit(): void {
    this.userType = parseInt(localStorage.getItem('spotbie_userType'), 10)
    this.isLoggedIn = localStorage.getItem('spotbie_loggedIn')

    if( this.userType !== this.eAllowedAccountTypes.Personal) {
      this.getLoyaltyPointBalance()
      this.fetchRewards()
    } else {
      this.fetchRewards(this.qrCodeLink)
    }
  }
}
