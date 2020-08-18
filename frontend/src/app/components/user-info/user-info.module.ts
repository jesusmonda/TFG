import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { UserInfoComponent } from './user-info.component';
import { FlagModule } from '../flag/flag.module';
import { DateAgoModule } from '../../pipes/date-ago.module';
import { ErrorHandlerService } from '../../services/error-handler.service';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, FlagModule, DateAgoModule],
  exports: [UserInfoComponent],
  declarations: [UserInfoComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class UserInfoModule {}
