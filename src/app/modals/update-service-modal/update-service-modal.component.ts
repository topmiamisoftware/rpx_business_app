import { Component, OnInit } from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {UpdateAppService} from "../../services/update-app.service";
import {CommonModule} from "@angular/common";
import {Browser} from "@capacitor/browser";

@Component({
  selector: 'app-update-service-modal',
  templateUrl: './update-service-modal.component.html',
  styleUrls: ['./update-service-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule, CommonModule,
  ],
})
export class UpdateServiceModalComponent  implements OnInit {

  name: string;
  downloadUrl: string = 'https://api.spotbie.com/api/business-app/download';

  constructor(private modalCtrl: ModalController, private updateAppService: UpdateAppService ) {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async openDownload() {
    await Browser.open({url: this.downloadUrl});
  }

  ngOnInit() {}
}
