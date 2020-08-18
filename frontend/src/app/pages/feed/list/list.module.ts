import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ListPage } from './list.page';
import { FeedItemModule } from '../../../components/feed/feed-item/feed-item.module';
import { FeedModalModule } from '../../../components/feed/feed-modal/feed-modal.module';
import { FeedModalComponent } from '../../../components/feed/feed-modal/feed-modal.component';
import { SegmentModule } from '../../../components/segment/segment.module';
import { ItemDividerlModule } from '../../../components/item-divider/item-divider.module';
import { Media } from '@ionic-native/media/ngx';
import { TabsModule } from '../../../components/tabs/tabs.module';
import { AuthGuard } from '../../../guards/auth.guard';
import { ErrorHandlerService } from '../../../services/error-handler.service';

const routes: Routes = [
  {
    path: '',
    component: ListPage,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), FeedModalModule, FeedItemModule, SegmentModule, ItemDividerlModule, TabsModule],
  declarations: [ListPage],
  entryComponents: [FeedModalComponent],
  providers: [
    Media,
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class ListPageModule {}
