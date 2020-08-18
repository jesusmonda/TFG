import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProfileFeedsPage } from './profile-feeds.page';
import { ItemDividerlModule } from '../../../components/item-divider/item-divider.module';
import { FeedItemModule } from '../../../components/feed/feed-item/feed-item.module';
import { AuthGuard } from '../../../guards/auth.guard';
import { ErrorHandlerService } from '../../../services/error-handler.service';

const routes: Routes = [
  {
    path: '',
    component: ProfileFeedsPage,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, FeedItemModule, ItemDividerlModule, RouterModule.forChild(routes)],
  declarations: [ProfileFeedsPage],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class ProfileFeedsPageModule {}
