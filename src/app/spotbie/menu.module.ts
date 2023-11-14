import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { MenuComponent } from './menu.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HelperModule } from '../helpers/helper.module'
import { RouterModule } from '@angular/router'
import { MenuLoggedInModule } from './spotbie-logged-in/menu-logged-in.module'
import { MenuLoggedOutModule } from './spotbie-logged-out/menu-logged-out.module'

@NgModule({
  declarations: [
    MenuComponent,
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
  ]
})
export class MenuModule { }
