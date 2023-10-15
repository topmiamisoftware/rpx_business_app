import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import * as calendly from '../../helpers/calendly/calendlyHelper'
import { DeviceDetectorService } from 'ngx-device-detector';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-business-features',
  templateUrl: './business-features.component.html',
  styleUrls: ['../features.component.css', './business-features.component.css']
})
export class BusinessFeaturesComponent implements OnInit {

  @Output() spawnCategoriesEvt = new EventEmitter()
  @Output() signUpEvent = new EventEmitter()

  @ViewChild('awardLoyaltyPointsToCustomers') awardLoyaltyPointsToCustomers: ElementRef
  @ViewChild('attractNewCustomers') attractNewCustomers: ElementRef
  @ViewChild('retainCustomers') retainCustomers: ElementRef
  @ViewChild('engageYourAudience') engageYourAudience: ElementRef
  @ViewChild('scheduleDemo') scheduleDemo: ElementRef

  calendlyUp: boolean = false
  loading: boolean = false
  business: boolean = false
  isMobile: boolean = false;

  constructor(private router: Router,
              private deviceDetector: DeviceDetectorService) {
                this.isMobile = this.deviceDetector.isMobile();
               }

  calendly(){

    this.loading = true
    this.calendlyUp = !this.calendlyUp

    if(this.calendlyUp)
        calendly.spawnCalendly('', '', () => { this.loading = false } )
    else
        this.loading = false

  }

  openPurchaseIncentives(action: number) {
    switch(action) {
      case 0:
        this.openPricing();
        break;
      case 1:
        this.openLiveDemo();
        break;
      case 2:
        this.openHowDoesItWork();
        break;
      case 3:
        this.openTheIdea();
        break;
    }
  }

  openHowDoesItWork() {
    this.router.navigate(['how-does-it-work']);
  }

  openTheIdea() {
    this.router.navigate(['the-idea']);
  }

  openLiveDemo() {
    window.open('https://demo.spotbie.com', '_blank');
  }

  openPricing() {
    this.router.navigate(['pricing']);
  }

  signUp(){
    this.signUpEvent.emit()
  }

  joinTheBeta() {
    window.open(`${environment.baseUrl}/beta`,'_blank');
  }

  spawnCategories(category: string){
    this.spawnCategoriesEvt.emit({ category })
  }

  openBlog(){
    window.open('https://blog.spotbie.com/','_blank')
  }

  openIg(){
    if(this.business){
      window.open('https://www.instagram.com/spotbie.business/','_blank')
    } else {
      window.open('https://www.instagram.com/spotbie.loyalty.points/','_blank')
    }
  }

  openYoutube(){
    window.open('https://www.youtube.com/channel/UCtxkgw0SYiihwR7O8f-xIYA','_blank')
  }

  openTwitter(){
      window.open('https://twitter.com/SpotBie','_blank')
  }

  ngOnInit(): void {
    this.router.url === '/business' ? this.business = true : this.business = false
  }

  ngAfterViewInit(){
    switch(this.router.url)
    {
      case '/business#awardLoyaltyPointsToCustomers':
        this.awardLoyaltyPointsToCustomers.nativeElement.scrollIntoView()
        break

      case '/business#attractNewCustomers':
        this.attractNewCustomers.nativeElement.scrollIntoView()
        break

      case '/business#engageYourAudience':
        this.engageYourAudience.nativeElement.scrollIntoView()
        break

      case '/business#retainCustomers':
        this.retainCustomers.nativeElement.scrollIntoView()
        break

      case '/business#scheduleDemo':
        this.scheduleDemo.nativeElement.scrollIntoView()
        break
    }
  }
}
