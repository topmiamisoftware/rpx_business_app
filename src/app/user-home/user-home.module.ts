import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserHomeComponent} from './user-home.component';
import {MenuLoggedInModule} from '../spotbie/spotbie-logged-in/menu-logged-in.module';
import {RouterModule, Routes} from '@angular/router';
import {HelperModule} from '../helpers/helper.module';

const routes: Routes = [{path: '', component: UserHomeComponent}];

@NgModule({
  declarations: [UserHomeComponent],
  imports: [
    CommonModule,
    HelperModule,
    MenuLoggedInModule,
    RouterModule.forChild(routes),
  ],
  exports: [UserHomeComponent],
})
export class UserHomeModule {}
