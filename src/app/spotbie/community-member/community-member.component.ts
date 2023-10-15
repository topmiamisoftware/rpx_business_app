import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ad } from 'src/app/models/ad';
import { Business } from 'src/app/models/business';
import { BusinessMenuServiceService } from 'src/app/services/spotbie-logged-in/business-menu/business-menu-service.service';

@Component({
  selector: 'app-community-member',
  templateUrl: './community-member.component.html',
  styleUrls: ['./community-member.component.css']
})
export class CommunityMemberComponent implements OnInit {
  @Input() lat: number
  @Input() lng: number
  @Input() business: Business = new Business()
  @Input() ad: Ad
  @Input() accountType: string = null
  @Input() categories: number
  @Input() editMode: boolean = false
  @Input() eventsClassification: number = null
  @Input() qrCodeLink: string = null

  @Output() closeWindowEvt = new EventEmitter()

  public infoObjectLoaded: boolean = false

  public fullScreenMode: boolean = false

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private businessMenuService: BusinessMenuServiceService
  ) { }

  public closeWindow(){
    this.closeWindowEvt.emit()
  }

  public getCommunityMember(){
    const getCommunityMemberReqObj = {
      qrCodeLink: this.qrCodeLink
    }

    this.businessMenuService.getCommunityMember(getCommunityMemberReqObj)
      .subscribe(resp => {
        this.business = resp.business
        this.business.is_community_member = true
        this.business.type_of_info_object = 'spotbie_community'
        this.business.loyalty_point_dollar_percent_value = this.business.loyalty_point_balance.loyalty_point_dollar_percent_value;
        this.business.rewardRate = (this.business.loyalty_point_dollar_percent_value / 100)

        this.infoObjectLoaded = true
      })
  }

  ngOnInit(): void {
    if(this.router.url.indexOf('community') > -1 ){
      this.qrCodeLink = this.activatedRoute.snapshot.paramMap.get('qrCode')
      this.fullScreenMode = true
    }
    this.getCommunityMember()
  }
}
