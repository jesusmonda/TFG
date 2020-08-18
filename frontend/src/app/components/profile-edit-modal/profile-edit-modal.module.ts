import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ProfileEditModalComponent } from './profile-edit-modal.component';
import { TextFieldOutlineModule } from '../textfield-outline/textfield-outline.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandlerService } from '../../services/error-handler.service';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, TextFieldOutlineModule, FormsModule, ReactiveFormsModule],
  declarations: [ProfileEditModalComponent],
  exports: [ProfileEditModalComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class ProfileEditModalModule {}
