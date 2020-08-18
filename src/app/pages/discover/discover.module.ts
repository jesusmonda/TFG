import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { DiscoverPage } from './discover.page';
import { FlagModule } from '../../components/flag/flag.module';
import { UserInfoModule } from '../../components/user-info/user-info.module';
import { TabsModule } from '../../components/tabs/tabs.module';
import { AuthGuard } from '../../guards/auth.guard';
import { ErrorHandlerService } from '../../services/error-handler.service';

const routes: Routes = [
  {
    path: '',
    component: DiscoverPage,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), FlagModule, UserInfoModule, TabsModule],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
  declarations: [DiscoverPage],
})
export class DiscoverPageModule {}
