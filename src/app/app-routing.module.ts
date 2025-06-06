import { NgModule } from '@angular/core';
import {PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {LoginGuardServiceService} from './services/route-services/login-guard-service.service';
import {RewardMenuComponent} from './spotbie/spotbie-logged-in/reward-menu/reward-menu.component';
import {LoyaltyPointsComponent} from './spotbie/spotbie-logged-in/loyalty-points/loyalty-points.component';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'forgot-password',
    loadChildren: () =>
      import(
        './spotbie/spotbie-logged-out/forgot-password/forgot-password.module'
        ).then(m => m.ForgotPasswordModule),
  },
  {
    path: 'user-home',
    loadChildren: () =>
      import('./user-home/user-home.module').then(m => m.UserHomeModule),
    canActivate: [LoginGuardServiceService],
  },
  {path: 'business-menu/:qrCode/:rewardUuid', component: RewardMenuComponent},
  {path: 'business-menu/:qrCode', component: RewardMenuComponent},
  {
    path: 'loyalty-points/:qrCode/:totalSpent/:loyaltyPointReward',
    component: LoyaltyPointsComponent,
  },
  {
    path: 'make-payment',
    loadChildren: () =>
      import('./make-payment/make-payment.module').then(
        m => m.MakePaymentModule
      ),
  },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
