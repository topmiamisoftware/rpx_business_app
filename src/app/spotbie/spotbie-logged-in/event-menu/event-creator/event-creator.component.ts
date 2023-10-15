import { HttpClient, HttpEventType } from '@angular/common/http'
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { SpEvent } from 'src/app/models/event'
import { LoyaltyPointBalance } from 'src/app/models/loyalty-point-balance'
import { EventCreatorService } from 'src/app/services/spotbie-logged-in/event-menu/event-creator/event-creator.service'
import * as spotbieGlobals from '../../../../globals'

const event_MEDIA_UPLOAD_API_URL = `${spotbieGlobals.API}event/upload-media`
const event_MEDIA_MAX_UPLOAD_SIZE = 25e+6

@Component({
  selector: 'app-event-creator',
  templateUrl: './event-creator.component.html',
  styleUrls: ['./event-creator.component.css']
})
export class EventCreatorComponent implements OnInit {

  @Input() event: SpEvent

  @ViewChild('spbInputInfo') spbInputInfo
  @ViewChild('eventMediaInput') eventMediaInput
  @ViewChild('spbTopAnchor') spbTopAnchor

  @Output() closeWindowEvt = new EventEmitter()
  @Output() closeThisEvt = new EventEmitter()
  @Output() closeeventCreatorAndRefetcheventListEvt = new EventEmitter()

  public loading: boolean = false

  public eventCreatorForm: UntypedFormGroup
  public eventCreatorFormUp: boolean = false

  public eventFormSubmitted: boolean = false

  public eventUploadImage: string = '../../assets/images/home_imgs/find-places-to-eat.svg'

  public eventMediaMessage: string = "Upload event Image"

  public eventMediaUploadProgress: number = 0

  public businessPointsDollarValue: string = '0'

  public dollarValueCalculated: boolean = false

  public eventTypeList: Array<string> = ['Something From Our Menu', 'Discount', 'An Experience']

  public eventCreated: boolean = false
  public eventDeleted: boolean = false

  public uploadMediaForm: boolean = false

  public loyaltyPointBalance: LoyaltyPointBalance

  constructor(private formBuilder: UntypedFormBuilder,
              private eventCreatorService: EventCreatorService,
              private http: HttpClient) {}

  get eventType() {return this.eventCreatorForm.get('eventType').value }
  get eventValue() {return this.eventCreatorForm.get('eventValue').value }
  get eventName() {return this.eventCreatorForm.get('eventName').value }
  get eventDescription() {return this.eventCreatorForm.get('eventDescription').value }
  get eventImage() {return this.eventCreatorForm.get('eventImage').value }

  get f() { return this.eventCreatorForm.controls }

  public initeventForm(){

    const eventTypeValidators = [Validators.required]
    const eventValueValidators = [Validators.required]

    const eventNameValidators = [Validators.required, Validators.maxLength(50)]
    const eventDescriptionValidators = [Validators.required, Validators.maxLength(250), Validators.minLength(50)]

    const eventImageValidators = [Validators.required]

    this.eventCreatorForm = this.formBuilder.group({
      eventType: ['', eventTypeValidators],
      eventValue: ['', eventValueValidators],
      eventName: ['', eventNameValidators],
      eventDescription: ['', eventDescriptionValidators],
      eventImage: ['', eventImageValidators]
    })

    if(this.event !== null && this.event !== undefined){

      //console.log("event is ", this.event)

      this.eventCreatorForm.get('eventType').setValue(this.event.type)
      this.eventCreatorForm.get('eventValue').setValue(this.event.point_cost)
      this.eventCreatorForm.get('eventName').setValue(this.event.name)
      this.eventCreatorForm.get('eventDescription').setValue(this.event.description)
      this.eventCreatorForm.get('eventImage').setValue(this.event.images)
      this.eventUploadImage = this.event.images

      this.calculateDollarValue()

    }

    this.eventCreatorFormUp = true
    this.loading = false

  }

  public calculateDollarValue(){

    let pointPercentage = this.loyaltyPointBalance.loyalty_point_dollar_percent_value
    let itemPrice = this.eventValue

    if(pointPercentage == 0 || pointPercentage == null)
      this.businessPointsDollarValue = '0'
    else
      this.businessPointsDollarValue = ( itemPrice * (pointPercentage / 100) ).toFixed(2)

    this.dollarValueCalculated = true

  }

  public saveEvent(){

    this.eventFormSubmitted = true
    this.spbTopAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' })

    let itemObj = new SpEvent()
    itemObj.name = this.eventName
    itemObj.description = this.eventDescription
    itemObj.images = this.eventImage
    itemObj.point_cost = this.eventValue
    itemObj.type = this.eventType

    if(this.event === null || this.event === undefined){

      this.eventCreatorService.saveItem(itemObj).subscribe(
        resp =>{
          this.saveeventCb(resp)
        }
      )

    } else {

      itemObj.id = this.event.id

      this.eventCreatorService.updateItem(itemObj).subscribe(
        resp =>{
          this.saveeventCb(resp)
        }
      )

    }

  }

  public saveeventCb(resp: any){

    console.log(resp)

    if(resp.success){
      this.eventCreated = true
      setTimeout(() => {
        this.closeeventCreatorAndRefetcheventList()
      }, 1500)
    }

  }

  public startEventMediaUploader(): void{
    this.eventMediaInput.nativeElement.click()
  }

  public uploadMedia(files): void {

    const file_list_length = files.length

    if (file_list_length === 0) {
      this.eventMediaMessage = 'You must upload at least one file.'
      return
    } else if (file_list_length > 1) {
      this.eventMediaMessage = 'Upload only one item image.'
      return
    }

    this.loading = true

    const formData = new FormData()

    let file_to_upload
    let upload_size = 0

    for (let i = 0; i < file_list_length; i++) {

      file_to_upload = files[i] as File

      upload_size += file_to_upload.size

      if (upload_size > event_MEDIA_MAX_UPLOAD_SIZE) {
        this.eventMediaMessage = 'Max upload size is 25MB.'
        this.loading = false
        return
      }

      formData.append('image', file_to_upload, file_to_upload.name)

    }

    let token = localStorage.getItem('spotbiecom_session')

    this.http.post(event_MEDIA_UPLOAD_API_URL, formData,
                    {
                      reportProgress: true,
                      observe: 'events',
                      withCredentials: true, headers: {
                        'Authorization' : `Bearer ${token}`
                      }
                    }
                  ).subscribe(event => {

      if (event.type === HttpEventType.UploadProgress)
        this.eventMediaUploadProgress = Math.round(100 * event.loaded / event.total)
      else if (event.type === HttpEventType.Response)
        this.eventMediaUploadFinished(event.body)

    })

    return

  }

  private eventMediaUploadFinished(httpResponse: any): void {

    console.log('eventMediaUploadFinished', httpResponse)

    if (httpResponse.success){
      this.eventUploadImage = httpResponse.image
      this.eventCreatorForm.get('eventImage').setValue(this.eventUploadImage)
    } else
      console.log('eventMediaUploadFinished', httpResponse)

    this.loading = false

  }

  public eventTypeChange(){

    if(this.eventType == 0){
      //event is discount
      this.uploadMediaForm = true
      this.eventUploadImage = this.event.images
    } else {
      //event is somethign from our menu
      this.uploadMediaForm = false
    }

  }

  public closeThis(){
    this.closeThisEvt.emit()
  }

  public closeWindow(){
    this.closeWindowEvt.emit()
  }

  public closeeventCreatorAndRefetcheventList(){
    this.closeeventCreatorAndRefetcheventListEvt.emit()
  }

  public deleteMe(){

    this.eventCreatorService.deleteMe(this.event).subscribe(
      resp => {
        this.deleteMeCb(resp)
      }
    )

  }

  private deleteMeCb(resp){

    if(resp.success){

      this.eventDeleted = true
      setTimeout(() => {
        this.closeeventCreatorAndRefetcheventList()
      }, 1500)

    }

  }

  public subscribe(){


  }

  ngOnInit(): void {

    this.initeventForm()

  }

}
