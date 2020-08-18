import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FlagComponent } from './flag.component';
import { ErrorHandlerService } from '../../services/error-handler.service';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule],
  declarations: [FlagComponent],
  exports: [FlagComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class FlagModule {}
