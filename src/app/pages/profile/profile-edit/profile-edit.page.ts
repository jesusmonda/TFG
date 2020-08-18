import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProfileEditModalComponent } from '../../../components/profile-edit-modal/profile-edit-modal.component';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { UtilService } from '../../../services/util.service';
import { RequestService } from '../../../services/request.service';
import { CacheService } from '../../../services/cache.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  userInfo: any;

  constructor(
    public modalController: ModalController,
    private route: ActivatedRoute,
    private userService: UserService,
    public utilService: UtilService,
    private requestService: RequestService,
    private cacheService: CacheService
  ) {}

  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo() {
    this.userService
      .getUserInfo(this.userService.getUserMeId(), false)
      .then((response) => {
        this.userInfo = response;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async presentModal(type) {
    let modal;

    modal = await this.modalController.create({
      component: ProfileEditModalComponent,
      componentProps: {
        type,
        userInfo: this.userInfo,
      },
    });

    // event to dismiss modal
    modal.onWillDismiss().then((response) => {
      if (response.data) {
        this.cacheService.editProfile(response.data.user);
        this.ngOnInit();
      }
    });

    return await modal.present();
  }

  clickInput() {
    this.fileInput.nativeElement.click();
  }

  async uploadAvatar() {
    const typesAllowed = ['image/jpeg', 'image/png', 'image/jpg'];
    const file = this.fileInput.nativeElement.files[0];

    if (file) {
      if (!typesAllowed.includes(file.type)) {
        this.utilService.presentToast('Photo format not accepted');
      } else if (file.size / 1000000 > 1) {
        this.utilService.presentToast('Size greater than 1 MB, the application does not support files larger than 1 MB');
      } else {
        const rows = await this.userService.updateProfile({ avatar: true, fileType: file.type });
        await this.requestService.request('PUT', rows.urlSigned, file, {}, false, false, true);

        this.userInfo.image = rows.user.image;
        this.cacheService.editAvatar(rows.user.image);
      }
    }
  }
}
