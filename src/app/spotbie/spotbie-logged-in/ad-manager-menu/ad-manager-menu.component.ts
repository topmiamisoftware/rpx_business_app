import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AccountTypes } from '../../../helpers/enum/account-type.enum'
import { LoyaltyPointBalance } from '../../../models/loyalty-point-balance'
import { Ad } from '../../../models/ad'
import { LoyaltyPointsService } from '../../../services/loyalty-points/loyalty-points.service'
import { AdCreatorComponent } from './ad-creator/ad-creator.component'
import { AdsService } from '../../ads/ads.service';
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-ad-manager-menu',
  templateUrl: './ad-manager-menu.component.html',
  styleUrls: ['./ad-manager-menu.component.css']
})
export class AdManagerMenuComponent implements OnInit, OnChanges {

  @ViewChild('adCreator') adCreator: AdCreatorComponent

  @Input() fullScreenWindow: boolean = true
  @Input() loyaltyPoints: string

  @Output() closeWindowEvt = new EventEmitter()
  @Output() notEnoughLpEvt = new EventEmitter()

  eAllowedAccountTypes = AccountTypes
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
              private changeDetectorRef: ChangeDetectorRef,
              private router: Router,
              route: ActivatedRoute) {
      if(this.router.url.indexOf('business-menu') > -1){
        this.qrCodeLink = route.snapshot.params.qrCode
        this.userHash = route.snapshot.params.userHash
      }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.changeDetectorRef.markForCheck();
  }

  getWindowClass(){
    if(this.fullScreenWindow)
      return 'spotbie-overlay-window';
    else
      return '';
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
      this.changeDetectorRef.detectChanges();
    } else {
      console.log('fetchAdsCb', resp);
    }
  }

  addAd(){
    this.itemCreator = !this.itemCreator
  }

  closeWindow(){
    this.closeWindowEvt.emit();
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
    this.closeAdCreator();
    this.fetchAds();
  }

  adTileStyling(ad: Ad){
    return  { background: 'url(' + ad.images + ')' };
  }

  ngOnInit(): void {
    this.getLoyaltyPointBalance();
    this.fetchAds();
  }
}
