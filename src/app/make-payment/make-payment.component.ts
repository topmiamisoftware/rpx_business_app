import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {StripeCard, StripeScriptTag} from 'stripe-angular';
import {ActivatedRoute} from '@angular/router';
import {Business} from '../models/business';
import {BottomAdBannerComponent} from '../spotbie/ads/bottom-ad-banner/bottom-ad-banner.component';
import {NearbyFeaturedAdComponent} from '../spotbie/ads/nearby-featured-ad/nearby-featured-ad.component';
import {HeaderAdBannerComponent} from '../spotbie/ads/header-ad-banner/header-ad-banner.component';
import {SpotbiePaymentsService} from '../services/spotbie-payments/spotbie-payments.service';
import {environment} from '../../environments/environment';

const STRIPE_PK = environment.publishableStripeKey;

@Component({
  selector: 'app-make-payment',
  templateUrl: 'make-payment.component.html',
  styleUrls: ['make-payment.component.css'],
})
export class MakePaymentComponent implements OnInit {
  @ViewChild('stripeCard') stripeCard: StripeCard;
  @ViewChild('adPreviewApp') adPreviewApp:
    | BottomAdBannerComponent
    | NearbyFeaturedAdComponent
    | HeaderAdBannerComponent = null;

  invalidError: any = null;
  cardCaptureReady = false;
  cardDetailsFilledOut = false;
  uuid = '';
  paymentType = '';
  business: Business = new Business();
  loading = false;
  membershipPaidFor = false;
  paymentTitle = '';
  paymentDescription = '';
  stripeCardToken: stripe.Token;
  paymentMethod: stripe.paymentMethod.PaymentMethod | void;

  constructor(
    private stripeScriptTag: StripeScriptTag,
    private activatedRoute: ActivatedRoute,
    private paymentsService: SpotbiePaymentsService,
    private ngZone: NgZone
  ) {
    if (!this.stripeScriptTag.StripeInstance)
      this.stripeScriptTag.setPublishableKey(STRIPE_PK);
  }

  onStripeInvalid(error: stripe.Error) {
    this.loading = false;
  }

  onStripeError(error: stripe.Error) {
    this.loading = false;
  }

  private userPayment() {
    const subscriptionRequestItem = {
      payment_method: this.paymentMethod,
      uuid: this.uuid,
      payment_type: this.paymentType,
    };

    const serviceUrl = 'user/business-membership';

    // Store the payment method on Stripe and Spotbie
    this.paymentsService
      .savePayment(subscriptionRequestItem, serviceUrl)
      .subscribe(resp => {
        this.ngZone.run(() => {
          if (resp.success) {
            this.membershipPaidFor = true;
          }
          this.loading = false;
        });
      });
  }

  getPaymentFormStyles() {
    if (this.loading) {
      return {display: 'none'};
    } else {
      return {display: 'block'};
    }
  }

  stripeSendPayment() {
    this.loading = true;

    if (this.stripeCard.complete) {
      this.stripeCard.createToken({}).then(token => {
        this.stripeCard.createPaymentMethod({}).then(pm => {
          this.paymentMethod = pm;
          this.setStripeToken(token);
          switch (this.paymentType) {
            default:
              this.userPayment();
              return;
          }
        });
      });
    }
  }

  setStripeToken(token: stripe.Token) {
    this.stripeCardToken = token;
  }

  setStripeSource(source: stripe.Source) {}

  onCardCaptureReady() {
    this.cardCaptureReady = true;
    this.stripeCard.ElementRef.nativeElement.style.display = 'block';
  }

  checkBusinessMembershipStatus() {
    const businessByUuidReq = {
      uuid: this.uuid,
      paymentType: this.paymentType,
    };

    this.paymentsService
      .checkBusinessMembershipStatus(businessByUuidReq)
      .subscribe(resp => {
        if (resp.membershipInfo) this.membershipPaidFor = true;
        this.loading = false;
      });
  }

  initBusinesMembershipPaymentForm() {
    this.paymentTitle = 'FINISH SUBSCRIPTION';
    this.paymentDescription = `
      You are about to subscribe to our Business Membership. Payments are made automatically on a monthly basis from the card you provide us with.
    `;
  }

  initInHousePaymentForm() {
    this.paymentTitle = 'PROMOTION SUBSCRIPTION';
    this.paymentDescription = `
      You are about to subscribe to our In-House Promotions Service. Payments are made automatically on a monthly basis from the card you provide us with.
    `;
  }

  ngOnInit(): void {
    this.loading = true;

    this.paymentType = this.activatedRoute.snapshot.paramMap.get('paymentType');
    this.uuid = this.activatedRoute.snapshot.paramMap.get('uuid');

    switch (this.paymentType) {
      case 'business-membership':
        this.checkBusinessMembershipStatus();
        this.initBusinesMembershipPaymentForm();
        break;
      case 'business-membership-1':
        this.checkBusinessMembershipStatus();
        this.initBusinesMembershipPaymentForm();
        break;
      case 'business-membership-2':
        this.checkBusinessMembershipStatus();
        this.initBusinesMembershipPaymentForm();
        break;
    }
  }
}
