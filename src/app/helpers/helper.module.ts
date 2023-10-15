import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LoadingScreenComponent } from './loading-helper/loading-screen/loading-screen.component'
import { OnScrollDirective } from '../directives/on-scroll.directive'
import { StopClickPropagationDirective } from '../directives/stop-click-propagation.directive'
import { ScrollToTopComponent } from './scroll-to-top/scroll-to-top.component'
import { ErrorHandlerComponent } from './error-handler/error-handler.component'
import { UsernameDirective } from '../directives/username.directive'
import { PersonNameDirective } from '../directives/person-name.directive'

@NgModule({
  declarations: [
    LoadingScreenComponent,
    OnScrollDirective,
    StopClickPropagationDirective,
    UsernameDirective,
    PersonNameDirective,
    ScrollToTopComponent,
    ErrorHandlerComponent
  ],
  imports : [CommonModule],
  exports : [
    LoadingScreenComponent,
    OnScrollDirective,
    StopClickPropagationDirective,
    PersonNameDirective,
    UsernameDirective,
    ScrollToTopComponent,
    ErrorHandlerComponent
  ]
})

export class HelperModule { }
