import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { RequestService } from './request.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(public toastController: ToastController, private requestService: RequestService) {}

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
    });
    toast.present();
  }

  getAvailableLanguages() {
    return this.requestService.request('GET', `${environment.endpoint}/languages/`, {}, {}, true, true, false);
  }

  // goToNextSegment(segments: any, actualSegment: string, direction:string){
  //   let index = segments.findIndex(x => x == actualSegment);

  //   // <----
  //   if (direction == "right") {
  //     if(index > 0 && index <= segments.length-1){
  //       return segments[index-1];
  //     } else {
  //       return segments[index];
  //     }
  //   }

  //   // ----->
  //   if (direction == "left") {
  //     if(index >= 0 && index < segments.length-1){
  //       return segments[index+1];
  //     } else {
  //       return segments[index];
  //     }
  //   }

  // }
}
