import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { LoginPage } from './login.page';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { ProfileEditModalComponent } from '../../components/profile-edit-modal/profile-edit-modal.component';
import { ProfileEditItemModule } from '../../components/profile-edit-item/profile-edit-item.module';
import { ProfileEditModalModule } from '../../components/profile-edit-modal/profile-edit-modal.module';
import { NoAuthGuard } from '../../guards/noauth.guard';
import { ErrorHandlerService } from '../../services/error-handler.service';

const routes: Routes = [
  {
    path: '',
    component: LoginPage,
    canActivate: [NoAuthGuard],
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), ProfileEditItemModule, ProfileEditModalModule],
  declarations: [LoginPage],
  entryComponents: [ProfileEditModalComponent],
  providers: [
    GooglePlus,
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class LoginPageModule {}
