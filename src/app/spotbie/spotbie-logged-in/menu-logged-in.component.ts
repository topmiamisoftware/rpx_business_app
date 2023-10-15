import { Component, OnInit, ViewChild, EventEmitter, Output, ElementRef } from '@angular/core'
import { UserauthService } from 'src/app/services/userauth.service'
import { MapComponent } from '../map/map.component'
import { DeviceDetectorService } from 'ngx-device-detector'
import { LoyaltyPointsService } from 'src/app/services/loyalty-points/loyalty-points.service'
import { AllowedAccountTypes } from 'src/app/helpers/enum/account-type.enum'
import { SettingsComponent } from './settings/settings.component'
import { logOutCallback } from 'src/app/helpers/logout-callback'
import {LoyaltyPointBalance} from '../../models/loyalty-point-balance';

@Component({
  selector: 'app-menu-logged-in',
  templateUrl: './menu-logged-in.component.html',
  styleUrls: ['../menu.component.css', './menu-logged-in.component.css']
})
export class MenuLoggedInComponent implements OnInit {

  @Output() userBackgroundEvent = new EventEmitter()

  @ViewChild('spotbieMainMenu') spotbieMainMenu: ElementRef
  @ViewChild('spotbieMap') spotbieMap: MapComponent
  @ViewChild('spotbieSettings') spotbieSettings: SettingsComponent

  eAllowedAccountTypes = AllowedAccountTypes
  spotbieBackgroundImage: string
  foodWindow = { open : false }
  mapApp = { open : false }
  settingsWindow =  { open : false }
  home_route: boolean = true
  prevScrollpos
  bg_image_ready: boolean = false
  menuActive: boolean = false
  spotType: string
  isMobile: boolean
  isDesktop: boolean
  isTablet: boolean
  userType: number
  userLoyaltyPoints: any = 0
  userName: string = null
  qrCode: boolean = false
  business: boolean = false
  getRedeemableItems: boolean = false
  eventMenuOpen: boolean = false

  constructor(private userAuthService : UserauthService,
              private deviceService: DeviceDetectorService,
              private loyaltyPointsService: LoyaltyPointsService) {}

  myFavorites(){
    this.menuActive = false
    this.spotbieMap.myFavorites()
  }

  toggleLoyaltyPoints(){
    this.spotbieMap.goToLp()
  }

  toggleQRScanner(){
    this.spotbieMap.goToQrCode()
  }

  toggleRewardMenu(ac: string){
    this.spotbieMap.goToRewardMenu()
  }

  spawnCategories(category: string): void{
    if(!this.isDesktop) this.slideMenu()
    const obj = {
      category
    }

    this.spotbieMap.spawnCategories(obj)
  }

  home(){
    this.settingsWindow.open = false
    this.foodWindow.open = false
    this.getRedeemableItems = false
    this.eventMenuOpen = false

    if(this.userType === AllowedAccountTypes.Personal){
      this.spotbieMap.openWelcome()
      this.spotbieMap.closeCategories()
    } else {
      this.toggleQRScanner();
    }
  }

  openBusinessSettings(){
    this.settingsWindow.open = true

    setTimeout(() => {
      this.spotbieSettings.changeAccType()
    }, 500)
  }

  slideMenu(){
    if(this.settingsWindow.open)
      this.settingsWindow.open = false
    else
      this.menuActive = !this.menuActive
  }

  getMenuStyle(){
    if(this.menuActive === false){
      return {'background-color' : 'transparent'};
    }
  }

  openWindow(window : any) : void {
    window.open = true
  }

  closeWindow(window : any) : void {
    window.open = false
  }

  logOut() : void {
    this.userAuthService.logOut().subscribe(
      resp => {
        logOutCallback(resp)
    })
  }

  usersAroundYou(){
    this.spotbieMap.mobileStartLocation()
  }

  async getLoyaltyPointBalance(){
    await this.loyaltyPointsService.getLoyaltyPointBalance()
  }

  getPointsWrapperStyle(){
    if(this.isMobile)
      return { 'width:' : '85%', 'text-align' : 'right' }
    else
      return { width : '45%' }
  }

  openEvents(){
    this.eventMenuOpen = true
  }

  closeEvents(){
    this.eventMenuOpen = false
  }

  ngOnInit() : void {
    this.isMobile = this.deviceService.isMobile()
    this.isDesktop = this.deviceService.isDesktop()
    this.isTablet = this.deviceService.isTablet()

    this.userType = parseInt(localStorage.getItem('spotbie_userType'), 10)

    if(this.userType === AllowedAccountTypes.Personal)
      this.business = false
    else
      this.business = true

    this.loyaltyPointsService.userLoyaltyPoints$.subscribe((loyaltyPointBalance: LoyaltyPointBalance) => {
      if(this.business){
        this.userLoyaltyPoints = loyaltyPointBalance.balance
      } else {
        this.userLoyaltyPoints = loyaltyPointBalance
      }
    })

    this.userName = localStorage.getItem('spotbie_userLogin')
    this.getLoyaltyPointBalance()
  }

  toggleRedeemables(){
    this.getRedeemableItems = !this.getRedeemableItems
  }

  closeRedeemables(){
    this.getRedeemableItems = false
  }

  ngAfterViewInit(){
    this.mapApp.open = true
  }
}
