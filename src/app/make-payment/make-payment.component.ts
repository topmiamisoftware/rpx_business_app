import {Component, NgZone, OnInit, ViewChild} from '@angular/core'
import { StripeCard, StripeScriptTag } from 'stripe-angular'
import { ActivatedRoute } from '@angular/router'
import { Ad } from '../models/ad'
import { AdsService } from '../spotbie/ads/ads.service'
import { Business } from '../models/business'
import { BottomAdBannerComponent } from '../spotbie/ads/bottom-ad-banner/bottom-ad-banner.component'
import { NearbyFeaturedAdComponent } from '../spotbie/ads/nearby-featured-ad/nearby-featured-ad.component'
import { HeaderAdBannerComponent } from '../spotbie/ads/header-ad-banner/header-ad-banner.component'
import { SpotbiePaymentsService } from '../services/spotbie-payments/spotbie-payments.service'
import { environment } from 'src/environments/environment'

const STRIPE_PK = environment.publishableStripeKey

@Component({
  selector: 'app-make-payment',
  templateUrl: 'make-payment.component.html',
  styleUrls: ['make-payment.component.css']
})
export class MakePaymentComponent implements OnInit {

  @ViewChild('stripeCard') stripeCard: StripeCard
  @ViewChild('adPreviewApp') adPreviewApp: BottomAdBannerComponent | NearbyFeaturedAdComponent | HeaderAdBannerComponent = null

  invalidError: any = null
  cardCaptureReady: boolean = false
  cardDetailsFilledOut: boolean = false
  uuid: string = ''
  paymentType: string = ''
  ad: Ad = new Ad()
  business: Business = new Business()
  loading: boolean = false
  adPaidFor: boolean = false
  adWasPaidFor: boolean = false
  membershipPaidFor: boolean = false
  paymentTitle: string = ''
  paymentDescription: string = ''
  stripeCardToken: stripe.Token;
  paymentMethod: stripe.paymentMethod.PaymentMethod | void;

  constructor(
    private stripeScriptTag: StripeScriptTag,
    private activatedRoute: ActivatedRoute,
    private adsService: AdsService,
    private paymentsService: SpotbiePaymentsService,
    private ngZone: NgZone,
  ) {
    if (!this.stripeScriptTag.StripeInstance)
      this.stripeScriptTag.setPublishableKey(STRIPE_PK)
  }

  onStripeInvalid( error: Error ){
    this.loading = false
  }

  onStripeError( error: Error ){
    this.loading = false
  }

  private userPayment(){
    const subscriptionRequestItem = {
      payment_method: this.paymentMethod,
      uuid: this.uuid,
      payment_type: this.paymentType
    }

    const serviceUrl = 'user/business-membership'

    // Store the payment method on Stripe and Spotbie
    this.paymentsService.savePayment(subscriptionRequestItem, serviceUrl).subscribe(resp => {
        this.ngZone.run(() => {
          if(resp.success) {
            this.membershipPaidFor = true
          }
          this.loading = false
        });
      });
  }


  private adPayment(){
    const subscriptionRequestItem = {
      payment_method: this.paymentMethod,
      ad: this.ad,
      business: this.business
    }

    const serviceUrl = 'in-house/save-payment'

    // Store the payment method on Stripe and Spotbie
    this.paymentsService.savePayment(subscriptionRequestItem, serviceUrl).subscribe(resp => {
        const newAd = resp.newAd

        if(newAd.is_live === 1) this.adPaidFor = true

        this.loading = false
      });
  }

  getPaymentFormStyles(){
    if(this.loading){
      return { display : 'none' }
    } else {
      return { display : 'block' }
    }
  }

  stripeSendPayment(){
    this.loading = true;

    if(this.stripeCard.complete){
      this.stripeCard.createToken({}).then((token) => {
        this.stripeCard.createPaymentMethod({}).then((pm) =>{
            this.paymentMethod = pm;
            this.setStripeToken(token);
            switch(this.paymentType) {
              case 'in-house':
                this.adPayment();
                break
              default:
                this.userPayment();
                return
            }
          });
      });
    }
  }

  setStripeToken( token: stripe.Token ){
    this.stripeCardToken = token;
  }

  setStripeSource( source: stripe.Source ){
  }

  onCardCaptureReady(){
    this.cardCaptureReady = true
    this.stripeCard.ElementRef.nativeElement.style.display = 'block'
  }

  getAdFromUuid(){
    const adByUuidReq = {
      uuid: this.uuid
    }

    this.adsService.getAdByUUID(adByUuidReq).subscribe(resp => {
        this.ad = resp.ad

        if(this.ad.is_live) this.adWasPaidFor = true

        this.business = resp.business
        this.loading = false
      })
  }

  checkBusinessMembershipStatus(){
    const businessByUuidReq = {
      uuid: this.uuid,
      paymentType: this.paymentType
    }

    this.paymentsService.checkBusinessMembershipStatus(businessByUuidReq).subscribe(resp => {
        if(resp.membershipInfo) this.membershipPaidFor = true;
        this.loading = false;
      });
  }

  initBusinesMembershipPaymentForm(){
    this.paymentTitle = 'FINISH SUBSCRIPTION'
    this.paymentDescription = `
      You are about to subscribe to our Business Membership. Payments are made automatically on a monthly basis from the card you provide us with.
    `
  }

  initInHousePaymentForm(){
    this.paymentTitle = 'PROMOTION SUBSCRIPTION'
    this.paymentDescription = `
      You are about to subscribe to our In-House Promotions Service. Payments are made automatically on a monthly basis from the card you provide us with.
    `
  }

  ngOnInit(): void {
    this.loading = true

    this.paymentType = this.activatedRoute.snapshot.paramMap.get('paymentType')
    this.uuid = this.activatedRoute.snapshot.paramMap.get('uuid')

    switch(this.paymentType){
      case 'in-house':
        this.initInHousePaymentForm()
        this.getAdFromUuid()
        break
      case 'business-membership':
        this.checkBusinessMembershipStatus()
        this.initBusinesMembershipPaymentForm()
        break
      case 'business-membership-1':
        this.checkBusinessMembershipStatus()
        this.initBusinesMembershipPaymentForm()
        break
      case 'business-membership-2':
        this.checkBusinessMembershipStatus()
        this.initBusinesMembershipPaymentForm()
        break
    }
  }
}
