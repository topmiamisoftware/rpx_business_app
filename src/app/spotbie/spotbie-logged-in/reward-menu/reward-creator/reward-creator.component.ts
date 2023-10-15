import { HttpClient, HttpEventType } from '@angular/common/http'
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { LoyaltyPointBalance } from 'src/app/models/loyalty-point-balance'
import { Reward } from 'src/app/models/reward'
import { LoyaltyPointsService } from 'src/app/services/loyalty-points/loyalty-points.service'
import { RewardCreatorService } from 'src/app/services/spotbie-logged-in/business-menu/reward-creator/reward-creator.service'
import { environment } from 'src/environments/environment'
import * as spotbieGlobals from '../../../../globals'
import {LoyaltyTier} from '../../../../models/loyalty-point-tier.balance';

const REWARD_MEDIA_UPLOAD_API_URL = `${spotbieGlobals.API}reward/upload-media`
const REWARD_MEDIA_MAX_UPLOAD_SIZE = 25e+6
const QR_CODE_CALIM_REWARD_SCAN_BASE_URL = environment.qrCodeRewardScanBaseUrl

@Component({
  selector: 'app-reward-creator',
  templateUrl: './reward-creator.component.html',
  styleUrls: ['./reward-creator.component.css']
})
export class RewardCreatorComponent implements OnInit {

  @Input() reward: Reward

  @ViewChild('spbInputInfo') spbInputInfo
  @ViewChild('rewardMediaInput') rewardMediaInput
  @ViewChild('spbTopAnchor') spbTopAnchor

  @Output() closeParentWindowEvt = new EventEmitter()
  @Output() closeRewardCreatorEvt = new EventEmitter()
  @Output() closeRewardCreatorAndRefetchRewardListEvt = new EventEmitter()

  loading: boolean = false
  rewardCreatorForm: UntypedFormGroup
  rewardCreatorFormUp: boolean = false
  rewardClaimUrl: string = null
  rewardFormSubmitted: boolean = false
  rewardUploadImage: string = '../../assets/images/home_imgs/find-places-to-eat.svg'
  rewardMediaMessage: string = 'Upload Reward Image'
  rewardMediaUploadProgress: number = 0
  businessPointsDollarValue: string = '0'
  dollarValueCalculated: boolean = false
  rewardTypeList: Array<string> = ['Something From Our Menu', 'Discount', 'An Experience']
  rewardCreated: boolean = false
  rewardDeleted: boolean = false
  uploadMediaForm: boolean = false
  loyaltyPointBalance: any
  qrCodeClaimReward = QR_CODE_CALIM_REWARD_SCAN_BASE_URL
  existingTiers: Array<LoyaltyTier> = this.loyaltyPointsService.existingTiers;

  constructor(private formBuilder: UntypedFormBuilder,
              private rewardCreatorService: RewardCreatorService,
              private http: HttpClient,
              private loyaltyPointsService: LoyaltyPointsService) {
                this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointsBalance => {
                    this.loyaltyPointBalance = loyaltyPointsBalance
                  })
              }

  get rewardType() {return this.rewardCreatorForm.get('rewardType').value }
  get rewardValue() {return this.rewardCreatorForm.get('rewardValue').value }
  get rewardName() {return this.rewardCreatorForm.get('rewardName').value }
  get rewardDescription() {return this.rewardCreatorForm.get('rewardDescription').value }
  // get tier() {return this.rewardCreatorForm.get('tier').value }
  get rewardImage() {return this.rewardCreatorForm.get('rewardImage').value }

  get f() { return this.rewardCreatorForm.controls }

  initRewardForm(){
    const rewardTypeValidators = [Validators.required]
    const rewardValueValidators = [Validators.required]
    const rewardNameValidators = [Validators.required, Validators.maxLength(50)]
    const rewardDescriptionValidators = [Validators.required, Validators.maxLength(250), Validators.minLength(50)]
    const rewardImageValidators = [Validators.required]

    this.rewardCreatorForm = this.formBuilder.group({
      rewardType: ['', rewardTypeValidators],
      rewardValue: ['', rewardValueValidators],
      rewardName: ['', rewardNameValidators],
      rewardDescription: ['', rewardDescriptionValidators],
      rewardImage: ['', rewardImageValidators],
      // tier: ['', null],
    })

    if(this.reward){
      this.rewardCreatorForm.get('rewardType').setValue(this.reward.type);
      this.rewardCreatorForm.get('rewardValue').setValue(this.reward.point_cost);
      this.rewardCreatorForm.get('rewardName').setValue(this.reward.name);
      this.rewardCreatorForm.get('rewardDescription').setValue(this.reward.description);
      this.rewardCreatorForm.get('rewardImage').setValue(this.reward.images);
      // this.rewardCreatorForm.get('tier').setValue(this.reward.tier_id);
      this.rewardUploadImage = this.reward.images;
      this.setRewardLink();
      this.calculatePointValue();
    }

    this.rewardCreatorFormUp = true
    this.loading = false
  }

  setReward(reward: Reward){
    this.reward = reward
    this.setRewardLink()
  }

  private setRewardLink(){
    this.rewardClaimUrl = `${this.qrCodeClaimReward}?&r=${this.reward.uuid}&t=claim_reward`
  }

  calculatePointValue(){
    const pointPercentage = this.loyaltyPointBalance.loyalty_point_dollar_percent_value
    const itemPrice = this.rewardValue

    if(pointPercentage === 0 || pointPercentage == null) {
      this.businessPointsDollarValue = '0'
    } else {
      this.businessPointsDollarValue = ((itemPrice / pointPercentage) * 100).toFixed(2)
    }

    this.dollarValueCalculated = true
  }

  rewardTier(t) {
    console.log(t)
  }

  saveReward(){
    this.rewardFormSubmitted = true
    this.spbTopAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' })

    const reward = new Reward()
    reward.name = this.rewardName
    reward.description = this.rewardDescription
    reward.images = this.rewardImage
    reward.point_cost = this.rewardValue
    reward.type = this.rewardType
    // reward.tier_id = this.tier

    // console.log('the reward', reward);

    if(!this.reward){
      this.rewardCreatorService.saveReward(reward).subscribe(resp => {
          this.saveRewardCb()
        })
    } else {
      reward.id = this.reward.id

      this.rewardCreatorService.updateReward(reward).subscribe(resp =>{
          this.saveRewardCb()
        })
    }
  }

  saveRewardCb(){
    this.rewardCreated = true
    setTimeout(() => {
      this.closeRewardCreatorAndRefetchRewardList()
    }, 1500)
  }

  startRewardMediaUploader(): void{
    this.rewardMediaInput.nativeElement.click()
  }

  uploadMedia(files): void {
    const file_list_length = files.length

    if (file_list_length === 0) {
      this.rewardMediaMessage = 'You must upload at least one file.'
      return
    } else if (file_list_length > 1) {
      this.rewardMediaMessage = 'Upload only one item image.'
      return
    }

    this.loading = true

    const formData = new FormData()

    let file_to_upload
    let upload_size = 0

    for (let i = 0; i < file_list_length; i++) {
      file_to_upload = files[i] as File

      upload_size += file_to_upload.size

      if (upload_size > REWARD_MEDIA_MAX_UPLOAD_SIZE) {
        this.rewardMediaMessage = 'Max upload size is 25MB.'
        this.loading = false
        return
      }

      formData.append('image', file_to_upload, file_to_upload.name)
    }

    const token = localStorage.getItem('spotbiecom_session')

    this.http.post(REWARD_MEDIA_UPLOAD_API_URL, formData,
                    {
                      reportProgress: true,
                      observe: 'events',
                      withCredentials: true, headers: {
                        Authorization : `Bearer ${token}`
                      }
                    }
                  ).subscribe(event => {

      if (event.type === HttpEventType.UploadProgress)
        this.rewardMediaUploadProgress = Math.round(100 * event.loaded / event.total)
      else if (event.type === HttpEventType.Response)
        this.rewardMediaUploadFinished(event.body)
    })
    return
  }

  private rewardMediaUploadFinished(httpResponse: any): void {
    if (httpResponse.success){
      this.rewardUploadImage = httpResponse.image
      this.rewardCreatorForm.get('rewardImage').setValue(this.rewardUploadImage)
    } else {
      console.log('rewardMediaUploadFinished', httpResponse)
    }

    this.loading = false
  }

  rewardTypeChange(){
    if(this.rewardType === 0){
      this.uploadMediaForm = true
      this.rewardUploadImage = this.reward.images
    } else {
      this.uploadMediaForm = false
    }
  }

  closeRewardCreator(){
    this.closeRewardCreatorEvt.emit()
  }

  closeWindow(){
    this.closeParentWindowEvt.emit()
  }

  closeRewardCreatorAndRefetchRewardList(){
    this.closeRewardCreatorAndRefetchRewardListEvt.emit();
  }

  deleteMe(){
    this.rewardCreatorService.deleteMe(this.reward).subscribe(resp => {
        this.deleteMeCb(resp)
      });
  }

  private deleteMeCb(resp){
    if(resp.success){
      this.rewardDeleted = true
      setTimeout(() => {
        this.closeRewardCreatorAndRefetchRewardList()
      }, 1500);
    }
  }

  ngOnInit(): void {
    this.initRewardForm()
  }
}
