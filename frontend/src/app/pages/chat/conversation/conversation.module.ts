import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ConversationPage } from './conversation.page';
import { OwnerMessageModule } from '../../../components/chat/owner-message/owner-message.module';
import { ReceptionMessageModule } from '../../../components/chat/reception-message/reception-message.module';
import { InputBarModule } from '../../../components/input-bar/input-bar.module';
import { DateAgoModule } from '../../../pipes/date-ago.module';
import { AuthGuard } from '../../../guards/auth.guard';
import { ErrorHandler } from '@angular/core';
import { ErrorHandlerService } from '../../../services/error-handler.service';

const routes: Routes = [
  {
    path: '',
    component: ConversationPage,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), OwnerMessageModule, ReceptionMessageModule, InputBarModule, DateAgoModule],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
  declarations: [ConversationPage],
})
export class ConversationPageModule {}
