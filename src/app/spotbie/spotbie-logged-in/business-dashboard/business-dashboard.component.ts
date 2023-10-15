import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { UserauthService } from 'src/app/services/userauth.service';
import { LoyaltyPointsComponent } from '../loyalty-points/loyalty-points.component';
import { QrComponent } from '../qr/qr.component';
import { RedeemableComponent } from '../redeemable/redeemable.component';
import { RewardMenuComponent } from '../reward-menu/reward-menu.component';

@Component({
  selector: 'app-business-dashboard',
  templateUrl: './business-dashboard.component.html',
  styleUrls: ['./business-dashboard.component.css']
})
export class BusinessDashboardComponent implements OnInit {

  @Output() openBusinessSettingsEvt = new EventEmitter()

  @ViewChild('loyaltyPointsApp') loyaltyPointsApp: LoyaltyPointsComponent
  @ViewChild('rewardMenuApp') rewardMenuApp: RewardMenuComponent
  @ViewChild('qrApp') qrApp: QrComponent
  @ViewChild('redeemablesApp') redeemablesApp: RedeemableComponent
  @ViewChild('lpAppAnchor') lpAppAnchor: ElementRef
  @ViewChild('qrCodeAppAnchor') qrCodeAppAnchor: ElementRef
  @ViewChild('rewardMenuAppAnchor') rewardMenuAppAnchor: ElementRef

  displayBusinessSetUp: boolean = false
  businessFetched: boolean = false
  getRedeemableItems: boolean =  false

  constructor(private userAuthServe: UserauthService) { }

  redeemedLp(){
    this.getRedeemableItems = true
    this.redeemablesApp.getRedeemed()
  }

  openLoyaltyPoints(){
    console.log('BusinessDashboardComponent loyaltyPointsApp')
    this.loyaltyPointsApp.initBusinessLoyaltyPoints()
  }

  scrollToLpAppAnchor(){
    this.lpAppAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.loyaltyPointsApp.initBusinessLoyaltyPoints();
  }

  scrollToQrAppAnchor(){
    this.qrCodeAppAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToRewardMenuAppAnchor(){
    this.rewardMenuAppAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  closeAll(){
    this.loyaltyPointsApp.closeThis()
    this.rewardMenuApp.closeWindow()
    this.qrApp.closeQr()
  }

  checkIfBusinessIsSet(){
    this.userAuthServe.getSettings().subscribe(resp => {
        if(resp.business === null) {
          this.displayBusinessSetUp = true;
        } else if(resp.is_subscribed === false) {
          this.displayBusinessSetUp = false;
          this.openSettings();
        } else {
          this.displayBusinessSetUp = false
        }
        this.businessFetched = true
      })
  }

  openSettings(){
    this.openBusinessSettingsEvt.emit()
  }

  ngOnInit(): void {
    this.checkIfBusinessIsSet()
  }
}
