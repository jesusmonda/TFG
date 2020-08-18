import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FeedModalComponent } from './feed-modal.component';
import { TextFieldOutlineModule } from '../../textfield-outline/textfield-outline.module';
import { ErrorHandlerService } from '../../../services/error-handler.service';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, TextFieldOutlineModule],
  declarations: [FeedModalComponent],
  exports: [FeedModalComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class FeedModalModule {}
