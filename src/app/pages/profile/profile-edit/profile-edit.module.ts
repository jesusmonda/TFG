import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProfileEditPage } from './profile-edit.page';
import { ProfileEditItemModule } from '../../../components/profile-edit-item/profile-edit-item.module';
import { ProfileEditModalModule } from '../../../components/profile-edit-modal/profile-edit-modal.module';
import { ProfileEditModalComponent } from '../../../components/profile-edit-modal/profile-edit-modal.component';
import { AuthGuard } from '../../../guards/auth.guard';
import { ErrorHandlerService } from '../../../services/error-handler.service';

const routes: Routes = [
  {
    path: '',
    component: ProfileEditPage,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), ProfileEditItemModule, ProfileEditModalModule],
  declarations: [ProfileEditPage],
  entryComponents: [ProfileEditModalComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class ProfileEditPageModule {}
