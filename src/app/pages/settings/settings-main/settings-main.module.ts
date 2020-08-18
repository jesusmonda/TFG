import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { SettingsMainPage } from './settings-main.page';
import { AuthGuard } from '../../../guards/auth.guard';
import { ErrorHandlerService } from '../../../services/error-handler.service';

const routes: Routes = [
  {
    path: '',
    component: SettingsMainPage,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [SettingsMainPage],
  providers: [
    GooglePlus,
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class SettingsMainPageModule {}
