import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ReceptionMessageComponent } from './reception-message.component';
import { DateAgoModule } from '../../../pipes/date-ago.module';
import { AudioPlayModule } from '../../audio-play/audio-play.module';
import { ErrorHandlerService } from '../../../services/error-handler.service';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, DateAgoModule, AudioPlayModule],
  declarations: [ReceptionMessageComponent],
  exports: [ReceptionMessageComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class ReceptionMessageModule {}
