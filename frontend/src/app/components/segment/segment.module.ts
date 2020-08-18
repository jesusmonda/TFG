import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { SegmentComponent } from './segment.component';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule],
  declarations: [SegmentComponent],
  exports: [SegmentComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class SegmentModule {}
