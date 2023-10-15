import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { MenuComponent } from './menu.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component'
import { HelperModule } from '../helpers/helper.module'
import { RouterModule } from '@angular/router'
import { MenuLoggedInModule } from './spotbie-logged-in/menu-logged-in.module'
import { MenuLoggedOutModule } from './spotbie-logged-out/menu-logged-out.module'

@NgModule({
  declarations: [
    MenuComponent,
    EmailConfirmationComponent,
  ],
  imports: [
    CommonModule,
    MenuLoggedInModule,
    MenuLoggedOutModule,
    HttpClientModule,
    FormsModule, 
    ReactiveFormsModule,
    HelperModule,
    RouterModule
  ],
  exports : [
    MenuComponent,
    EmailConfirmationComponent
  ]
})
export class MenuModule { }
