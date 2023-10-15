import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  standalone: true,
  imports: [MatDialogModule],
  styleUrls: ['./info-modal.component.css']
})
export class InfoModalComponent{
  constructor(@Inject(MAT_DIALOG_DATA) public data: {title: string, content: string}) { }
}
