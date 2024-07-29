import { Component, OnInit } from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {UpdateAppService} from "../../services/update-app.service";
import {BehaviorSubject} from "rxjs";
import {CommonModule} from "@angular/common";

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
  progress$: BehaviorSubject<number> = this.updateAppService.progress$;

  constructor(private modalCtrl: ModalController, private updateAppService: UpdateAppService ) {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  ngOnInit() {}
}
