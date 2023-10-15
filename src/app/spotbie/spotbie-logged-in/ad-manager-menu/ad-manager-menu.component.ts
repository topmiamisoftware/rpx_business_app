import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AllowedAccountTypes } from 'src/app/helpers/enum/account-type.enum'
import { LoyaltyPointBalance } from 'src/app/models/loyalty-point-balance'
import { Ad } from 'src/app/models/ad'
import { LoyaltyPointsService } from 'src/app/services/loyalty-points/loyalty-points.service'
import { AdCreatorComponent } from './ad-creator/ad-creator.component'
import { AdsService } from '../../ads/ads.service'
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-ad-manager-menu',
  templateUrl: './ad-manager-menu.component.html',
  styleUrls: ['./ad-manager-menu.component.css']
})
export class AdManagerMenuComponent implements OnInit {

  @ViewChild('adCreator') adCreator: AdCreatorComponent

  @Input() fullScreenWindow: boolean = true
  @Input() loyaltyPoints: string

  @Output() closeWindowEvt = new EventEmitter()
  @Output() notEnoughLpEvt = new EventEmitter()

  eAllowedAccountTypes = AllowedAccountTypes
  menuItemList: Array<any>
  itemCreator: boolean = false
  userLoyaltyPoints: any
  userResetBalance
  userPointToDollarRatio
  adList: Array<Ad> = []
  ad: Ad
  qrCodeLink: string = null
  userHash: string = null
  loyaltyPointsBalance: LoyaltyPointBalance

  constructor(private loyaltyPointsService: LoyaltyPointsService,
              private adCreatorService: AdsService,
              private router: Router,
              route: ActivatedRoute) {
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

  fetchAds(){
    this.adCreatorService.getAds().subscribe(
      resp => {
        this.fetchAdsCb(resp)
      }
    )
  }

  private fetchAdsCb(resp){
    if(resp.success){
      this.adList = resp.adList
    } else {
      console.log('fetchAdsCb', resp)
    }
  }

  addAd(){
    this.itemCreator = !this.itemCreator
  }

  closeWindow(){
    this.closeWindowEvt.emit()
  }

  openAd(ad: Ad){
    this.ad = ad
    this.itemCreator = true
  }

  closeAdCreator(){
    this.ad = null
    this.itemCreator = false
  }

  closeAdCreatorAndRefetchAdList(){
    this.closeAdCreator()
    this.fetchAds()
  }

  adTileStyling(ad: Ad){
    return  { background: 'url(' + ad.images + ')' }
  }

  ngOnInit(): void {
    this.getLoyaltyPointBalance()
    this.fetchAds()
  }
}
