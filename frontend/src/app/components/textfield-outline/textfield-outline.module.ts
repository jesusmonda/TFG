import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TextFieldOutlineComponent } from './textfield-outline.component';
import { FormsModule } from '@angular/forms';
import { ErrorHandlerService } from '../../services/error-handler.service';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: [TextFieldOutlineComponent],
  exports: [TextFieldOutlineComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class TextFieldOutlineModule {}
