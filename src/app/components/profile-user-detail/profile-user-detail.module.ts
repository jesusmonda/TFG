import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ProfileUserDetailComponent } from './profile-user-detail.component';
import { FeedItemModule } from '../feed/feed-item/feed-item.module';
import { ItemDividerlModule } from '../item-divider/item-divider.module';
import { ErrorHandlerService } from '../../services/error-handler.service';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, FeedItemModule, ItemDividerlModule],
  declarations: [ProfileUserDetailComponent],
  exports: [ProfileUserDetailComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class ProfileUserDetailModule {}
