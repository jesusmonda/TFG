import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateAgoPipe } from './date-ago.pipe';
import { ErrorHandlerService } from '../services/error-handler.service';

@NgModule({
  declarations: [DateAgoPipe],
  imports: [CommonModule],
  exports: [DateAgoPipe],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class DateAgoModule {}
