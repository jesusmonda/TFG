import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FeedCommentComponent } from './feed-comment.component';
import { DateAgoModule } from '../../../pipes/date-ago.module';
import { ErrorHandlerService } from '../../../services/error-handler.service';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, DateAgoModule],
  declarations: [FeedCommentComponent],
  exports: [FeedCommentComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class FeedCommentModule {}
