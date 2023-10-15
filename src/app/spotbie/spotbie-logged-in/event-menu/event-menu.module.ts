import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventMenuComponent } from './event-menu.component';
import { MatSelectModule} from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventComponent } from './event/event.component';
import { EventCreatorComponent } from './event-creator/event-creator.component';

@NgModule({
  declarations: [
    EventMenuComponent,
    EventComponent,
    EventCreatorComponent
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule 
  ],
  exports : [
    EventMenuComponent
  ]
})
export class EventMenuModule { }
