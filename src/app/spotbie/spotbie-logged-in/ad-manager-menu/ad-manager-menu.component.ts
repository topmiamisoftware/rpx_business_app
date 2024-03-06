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
import { Ad } from '../../../models/ad'
import { AdCreatorComponent } from './ad-creator/ad-creator.component'
import { AdsService } from '../../ads/ads.service';

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

  itemCreator: boolean = false
  adList: Array<Ad> = []
  ad: Ad
  qrCodeLink: string = null
  userHash: string = null

  constructor(private adCreatorService: AdsService,
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
    this.fetchAds();
  }
}
