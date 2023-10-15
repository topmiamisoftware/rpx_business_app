import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityMemberComponent } from './community-member.component';
import { RouterModule, Routes } from '@angular/router';
import { InfoObjectModule } from '../map/info-object/info-object.module';

const routes : Routes = [
  { path : ':qrCode', component : CommunityMemberComponent }
];

@NgModule({
  declarations: [
    CommunityMemberComponent
  ],
  imports: [
    CommonModule,
    InfoObjectModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    CommunityMemberComponent
  ]
})
export class CommunityMemberModule { }
