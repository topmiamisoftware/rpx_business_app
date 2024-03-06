import {NgModule} from '@angular/core';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {AppComponent} from './app.component';
import {HomeModule} from './home/home.module';
import {UrlSanitizerPipe} from './pipes/url-sanitizer.pipe';
import {HelperModule} from './helpers/helper.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TokenInterceptor} from './helpers/token-interceptor/token-interceptor.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserauthService} from './services/userauth.service';
import {RouteReuseStrategy} from '@angular/router';
import {SpotbiePipesModule} from "./spotbie-pipes/spotbie-pipes.module";
import {NgxsModule, NoopNgxsExecutionStrategy} from "@ngxs/store";
import {environment} from "../environments/environment";
import {NgxsLoggerPluginModule} from "@ngxs/logger-plugin";
import {NgxsDataPluginModule} from "@angular-ru/ngxs";
import {NGXS_DATA_STORAGE_CONTAINER, NGXS_DATA_STORAGE_EXTENSION} from "@angular-ru/ngxs/storage";
import {NgxsReduxDevtoolsPluginModule} from "@ngxs/devtools-plugin";
import {BusinessLoyaltyPointsState} from './spotbie/spotbie-logged-in/state/business.lp.state';
import {LoyaltyPointsState} from "./spotbie/spotbie-logged-in/state/lp.state";

@NgModule({
  declarations: [AppComponent, UrlSanitizerPipe],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    HomeModule,
    HelperModule,
    BrowserAnimationsModule,
    SpotbiePipesModule,
    BrowserModule,
    NgxsModule.forRoot([LoyaltyPointsState, BusinessLoyaltyPointsState], {
      developmentMode: !environment.production,
      executionStrategy: NoopNgxsExecutionStrategy,
    }),
    NgxsLoggerPluginModule.forRoot(),
    NgxsDataPluginModule.forRoot([
      NGXS_DATA_STORAGE_EXTENSION,
      NGXS_DATA_STORAGE_CONTAINER,
    ]),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
    }),
    IonicModule.forRoot(),
  ],
  providers: [
    UserauthService,
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
