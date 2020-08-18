import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FeedItemComponent } from './feed-item.component';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { UserInfoModule } from '../../user-info/user-info.module';
import { ErrorHandlerService } from '../../../services/error-handler.service';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, NgxIonicImageViewerModule, UserInfoModule],
  declarations: [FeedItemComponent],
  exports: [FeedItemComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class FeedItemModule {}
