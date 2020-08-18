import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CallPage } from './call.page';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { TabsModule } from '../../components/tabs/tabs.module';
import { AuthGuard } from '../../guards/auth.guard';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { UserInfoModule } from '../../components/user-info/user-info.module';
import { AngularAgoraRtcModule, AgoraConfig } from 'angular-agora-rtc';
import { environment } from '../../../environments/environment';
import { Vibration } from '@ionic-native/vibration/ngx';

const routes: Routes = [
  {
    path: '',
    component: CallPage,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsModule,
    RouterModule.forChild(routes),
    UserInfoModule,
    AngularAgoraRtcModule.forRoot({ AppID: environment.agora_apiId }),
  ],
  providers: [
    AndroidPermissions,
    Vibration,
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
  declarations: [CallPage],
})
export class CallPageModule {}
