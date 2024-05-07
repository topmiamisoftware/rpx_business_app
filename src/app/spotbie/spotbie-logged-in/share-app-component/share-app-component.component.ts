import { Component } from '@angular/core';
import {Platform} from "@ionic/angular";
import {MatDialogRef} from "@angular/material/dialog";
import {AsyncPipe, NgIf} from "@angular/common";
import {QRCodeModule} from "angularx-qrcode";

@Component({
  selector: 'app-share-app-component',
  templateUrl: './share-app-component.component.html',
  styleUrls: ['./share-app-component.component.css'],
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    QRCodeModule
  ],
})
export class ShareAppComponentComponent {

  constructor(
    private platform: Platform,
    public dialogRef: MatDialogRef<ShareAppComponentComponent>,
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.close();
    });
  }

  close() {
    this.dialogRef.close(null);
  }
}
