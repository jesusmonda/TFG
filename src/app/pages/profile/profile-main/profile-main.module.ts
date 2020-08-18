import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { FeedItemModule } from '../../../components/feed/feed-item/feed-item.module';
import { ProfileMainPage } from './profile-main.page';
import { FlagModule } from '../../../components/flag/flag.module';
import { UserAnalyticsModule } from '../../../components/user-analytics/user-analytics.module';
import { ProfileUserDetailModule } from '../../../components/profile-user-detail/profile-user-detail.module';
import { TabsModule } from '../../../components/tabs/tabs.module';
import { AuthGuard } from '../../../guards/auth.guard';
import { ErrorHandlerService } from '../../../services/error-handler.service';

const routes: Routes = [
  {
    path: '',
    component: ProfileMainPage,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), FeedItemModule, FlagModule, UserAnalyticsModule, ProfileUserDetailModule, TabsModule],
  declarations: [ProfileMainPage],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class ProfileMainPageModule {}
