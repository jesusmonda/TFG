import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { CacheService } from '../services/cache.service';
import { ModalController } from '@ionic/angular';
import { ProfileEditModalComponent } from '../components/profile-edit-modal/profile-edit-modal.component';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService, private modalController: ModalController, private cacheService: CacheService) {}

  async canActivate(): Promise<boolean> {
    if (localStorage.getItem('access_token') != null) {
      let userInfo = JSON.parse(localStorage.getItem(`GET:${environment.endpoint}/user/${this.userService.getUserMeId()}`));
      if (userInfo == null) {
        userInfo = await this.userService.getUserInfo(this.userService.getUserMeId(), false);
      }

      // user has not languages
      if (userInfo.languages.length == 0) {
        const response: any = await this.openLanguageModal(userInfo);
        if (response == true) { return true; }
      }

      // user has languages
      if (userInfo.languages.length > 0) { return true; }
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }

  async openLanguageModal(userInfo: any) {
    const modal = await this.modalController.create({
      component: ProfileEditModalComponent,
      componentProps: {
        type: 'language',
        userInfo,
      },
    });

    // event to dismiss modal
    modal.onWillDismiss().then((response) => {
      this.cacheService.editProfile(response.data.user);
      this.router.navigate(['/feed']);
      return true;
    });

    return await modal.present();
  }
}
