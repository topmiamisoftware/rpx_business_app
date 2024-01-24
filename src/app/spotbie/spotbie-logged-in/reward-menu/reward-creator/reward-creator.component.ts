import {HttpClient, HttpEventType} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Reward} from '../../../../models/reward';
import {LoyaltyPointsService} from '../../../../services/loyalty-points/loyalty-points.service';
import {
  RewardCreatorService
} from '../../../../services/spotbie-logged-in/business-menu/reward-creator/reward-creator.service';
import {environment} from '../../../../../environments/environment';
import * as spotbieGlobals from '../../../../globals';
import {Preferences} from "@capacitor/preferences";
import {BehaviorSubject} from "rxjs";
import {Camera, CameraResultType, Photo} from "@capacitor/camera";
import {AndroidSettings, IOSSettings, NativeSettings} from "capacitor-native-settings";

const REWARD_MEDIA_UPLOAD_API_URL = `${spotbieGlobals.API}reward/upload-media`
const REWARD_MEDIA_MAX_UPLOAD_SIZE = 25e+6
const QR_CODE_CALIM_REWARD_SCAN_BASE_URL = environment.qrCodeRewardScanBaseUrl

@Component({
  selector: 'app-reward-creator',
  templateUrl: './reward-creator.component.html',
  styleUrls: ['./reward-creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardCreatorComponent implements OnInit {

  @Input() set reward(value: Reward | null) {
    this.reward$.next(value);
  }

  @ViewChild('spbInputInfo') spbInputInfo;
  @ViewChild('spbTopAnchor') spbTopAnchor;

  @Output() closeParentWindowEvt = new EventEmitter();
  @Output() closeRewardCreatorEvt = new EventEmitter();
  @Output() closeRewardCreatorAndRefetchRewardListEvt = new EventEmitter();

  reward$ = new BehaviorSubject<Reward>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  rewardCreatorForm: UntypedFormGroup;
  rewardCreatorFormUp$= new BehaviorSubject<boolean>(false);
  rewardClaimUrl$ = new BehaviorSubject<string>(null);
  rewardFormSubmitted$= new BehaviorSubject<boolean>(false);
  rewardUploadImage$= new BehaviorSubject<string>('../../assets/images/home_imgs/find-places-to-eat.svg');
  rewardMediaMessage$ = new BehaviorSubject<string>('Upload Reward Image');
  rewardMediaUploadProgress$= new BehaviorSubject<number>(0);
  businessPointsDollarValue$ = new BehaviorSubject<string>('0');
  dollarValueCalculated$ = new BehaviorSubject<boolean>(false);
  rewardTypeList: Array<string> = ['Something From Our Menu', 'Discount', 'An Experience'];
  rewardCreated$ = new BehaviorSubject<boolean>(false);
  rewardDeleted$ = new BehaviorSubject<boolean>(false);
  uploadMediaForm$ = new BehaviorSubject<boolean>(false);
  loyaltyPointBalance$ = new BehaviorSubject<any>(null);
  qrCodeClaimReward = new BehaviorSubject<string>(QR_CODE_CALIM_REWARD_SCAN_BASE_URL);
  // existingTiers: Array<LoyaltyTier> = this.loyaltyPointsService.existingTiers;
  $showDeniedMediaUploader = new BehaviorSubject<boolean>(false);

  constructor(private formBuilder: UntypedFormBuilder,
              private rewardCreatorService: RewardCreatorService,
              private http: HttpClient,
              private loyaltyPointsService: LoyaltyPointsService) {
                this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointsBalance => {
                    this.loyaltyPointBalance$.next(loyaltyPointsBalance);
                  });
              }

  get rewardType() {return this.rewardCreatorForm.get('rewardType').value }
  get rewardValue() {return this.rewardCreatorForm.get('rewardValue').value }
  get rewardName() {return this.rewardCreatorForm.get('rewardName').value }
  get rewardDescription() {return this.rewardCreatorForm.get('rewardDescription').value }
  // get tier() {return this.rewardCreatorForm.get('tier').value }
  get rewardImage() {return this.rewardCreatorForm.get('rewardImage').value }
  get f() { return this.rewardCreatorForm.controls }

  initRewardForm(){
    const rewardTypeValidators = [Validators.required];
    const rewardValueValidators = [Validators.required];
    const rewardNameValidators = [Validators.required, Validators.maxLength(50)];
    const rewardDescriptionValidators = [Validators.required, Validators.maxLength(250), Validators.minLength(50)];
    const rewardImageValidators = [Validators.required];

    this.rewardCreatorForm = this.formBuilder.group({
      rewardType: ['', rewardTypeValidators],
      rewardValue: ['', rewardValueValidators],
      rewardName: ['', rewardNameValidators],
      rewardDescription: ['', rewardDescriptionValidators],
      rewardImage: ['', rewardImageValidators],
      // tier: ['', null],
    });

    if(this.reward$.getValue()){
      let r = this.reward$.getValue();
      this.rewardCreatorForm.get('rewardType').setValue(r.type);
      this.rewardCreatorForm.get('rewardValue').setValue(r.point_cost);
      this.rewardCreatorForm.get('rewardName').setValue(r.name);
      this.rewardCreatorForm.get('rewardDescription').setValue(r.description);
      this.rewardCreatorForm.get('rewardImage').setValue(r.images);
      // this.rewardCreatorForm.get('tier').setValue(this.reward.tier_id);
      this.rewardUploadImage$.next(r.images);
      this.setRewardLink();
      this.calculatePointValue();
    }

    this.rewardCreatorFormUp$.next(true);
    this.loading$.next(false);
  }

  setReward(reward: Reward){
    this.reward$.next(reward);
    this.setRewardLink();
  }

  private setRewardLink(){
    this.rewardClaimUrl$.next(`${this.qrCodeClaimReward}?&r=${this.reward$.getValue().uuid}&t=claim_reward`);
  }

  calculatePointValue(){
    const pointPercentage = this.loyaltyPointBalance$.getValue().loyalty_point_dollar_percent_value;
    const itemPrice = this.rewardValue;

    if(pointPercentage === 0 || pointPercentage == null) {
      this.businessPointsDollarValue$.next('0');
    } else {
      this.businessPointsDollarValue$.next(((itemPrice / pointPercentage) * 100).toFixed(2));
    }

    this.dollarValueCalculated$.next(true);
  }

  saveReward(){
    this.rewardFormSubmitted$.next(true);
    this.spbTopAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' })

    const reward = new Reward();
    reward.name = this.rewardName;
    reward.description = this.rewardDescription;
    reward.images = this.rewardImage;
    reward.point_cost = this.rewardValue;
    reward.type = this.rewardType;
    // reward.tier_id = this.tier

    // console.log('the reward', reward);

    if (!this.reward$.getValue()) {
      this.rewardCreatorService.saveReward(reward).subscribe(resp => {
          this.saveRewardCb();
        });
    } else {
      reward.id = this.reward$.getValue().id;

      this.rewardCreatorService.updateReward(reward).subscribe(resp =>{
          this.saveRewardCb();
        });
    }
  }

  saveRewardCb(){
    this.rewardCreated$.next(true);
    setTimeout(() => {
      this.closeRewardCreatorAndRefetchRewardList();
    }, 1500);
  }

  async startRewardMediaUploader(): Promise<void> {
    Camera.checkPermissions().then((status) => {
      if (status.photos === 'granted'){
        this.rewardMediaUploaders();
      } else {
        Camera.requestPermissions({permissions: ['photos']}).then(status => {
          if (status.photos === 'granted') {
            this.rewardMediaUploaders();
          } else if (status.photos === 'denied') {
            this.showDeniedMediaUploader();
          }
        });
      }
    });
  }

  showDeniedMediaUploader() {
    this.$showDeniedMediaUploader.next(true);
  }

  async rewardMediaUploaders() {
    this.$showDeniedMediaUploader.next(false);
    const result = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64
    });

    return this.uploadMedia(result);
  }

  convertToBlob(image: Photo) {
    const rawData = atob(image.base64String);
    const bytes = new Array(rawData.length);
    for (var x = 0; x < rawData.length; x++) {
      bytes[x] = rawData.charCodeAt(x);
    }
    const arr = new Uint8Array(bytes);
    return new Blob([arr], {type: 'image/png'});
  }

  openAppSettings() {
    NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
  }

  async uploadMedia(file: Photo): Promise<void> {

    this.loading$.next(true);

    const formData = new FormData();

    let file_to_upload = file;
    let upload_size = 0;

    if (upload_size > REWARD_MEDIA_MAX_UPLOAD_SIZE) {
      this.rewardMediaMessage$.next('Max upload size is 25MB.');
      this.loading$.next(false);
      return;
    }

    let fileName = new Date().toDateString();
    formData.append('image', this.convertToBlob(file_to_upload), fileName);

    const token = await Preferences.get({ key: 'spotbiecom_session'});

    this.http.post(REWARD_MEDIA_UPLOAD_API_URL, formData,
                    {
                      reportProgress: true,
                      observe: 'events',
                      withCredentials: true, headers: {
                        Authorization : `Bearer ${token.value}`
                      }
                    }
                  ).subscribe(event => {

      if (event.type === HttpEventType.UploadProgress) {
        this.rewardMediaUploadProgress$.next(Math.round(100 * event.loaded / event.total));
      } else if (event.type === HttpEventType.Response) {
        this.rewardMediaUploadFinished(event.body);
      }
    });

    return;
  }

  private rewardMediaUploadFinished(httpResponse: any): void {
    if (httpResponse.success) {
      this.rewardUploadImage$.next(httpResponse.image);
      this.rewardCreatorForm.get('rewardImage').setValue(this.rewardUploadImage$.getValue());
    } else {
      console.log('rewardMediaUploadFinished', httpResponse);
    }

    this.loading$.next(false);
  }

  rewardTypeChange(event){
    if(this.rewardType === 0){
      this.uploadMediaForm$.next(true);
      this.rewardUploadImage$.next( this.reward$.getValue().images);
    } else {
      this.uploadMediaForm$.next(false);
    }

    console.log('event.detail.value', event.detail.value);
    this.rewardCreatorForm.get('rewardType').setValue(event.detail.value);
  }

  closeRewardCreator(){
    this.closeRewardCreatorEvt.emit();
  }

  closeWindow(){
    this.closeParentWindowEvt.emit();
  }

  closeRewardCreatorAndRefetchRewardList(){
    this.closeRewardCreatorAndRefetchRewardListEvt.emit();
  }

  deleteMe(){
    this.rewardCreatorService.deleteMe(this.reward$.getValue()).subscribe(resp => {
        this.deleteMeCb(resp);
      });
  }

  private deleteMeCb(resp){
    if(resp.success){
      this.rewardDeleted$.next(true);
      setTimeout(() => {
        this.closeRewardCreatorAndRefetchRewardList();
      }, 1500);
    }
  }

  ngOnInit(): void {
    this.initRewardForm();
  }
}
