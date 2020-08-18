import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ListPage } from './list.page';
import { TabsModule } from '../../../components/tabs/tabs.module';
import { DateAgoModule } from '../../../pipes/date-ago.module';
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
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TabsModule, DateAgoModule],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
  declarations: [ListPage],
})
export class ListPageModule {}
