import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { InputBarComponent } from './input-bar.component';
import { FormsModule } from '@angular/forms';
import { Media } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';
import { ErrorHandlerService } from '../../services/error-handler.service';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  declarations: [InputBarComponent],
  exports: [InputBarComponent],
  providers: [
    Media,
    File,
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
})
export class InputBarModule {}
