import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FeedService } from '../../../services/feed.service';
import { UtilService } from '../../../services/util.service';
import { CacheService } from '../../../services/cache.service';
import { RequestService } from '../../../services/request.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-feed-modal',
  templateUrl: './feed-modal.component.html',
  styleUrls: ['./feed-modal.component.scss'],
})
export class FeedModalComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  content = '';
  isDoubt: boolean;
  file: any;
  previewFile: any;
  userAvatar: string;

  constructor(
    public modalCtrl: ModalController,
    public feedService: FeedService,
    private utilService: UtilService,
    private cacheService: CacheService,
    private requestService: RequestService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getUserInfo(this.userService.getUserMeId(), false).then((response) => {
      this.userAvatar = response.image;
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  createFeed() {
    const data: any = { doubt: this.isDoubt, content: this.content };
    if (this.file != null) {
      data.includeFile = this.file != null;
      data.fileType = this.file.type;
    }

    this.feedService
      .createFeed(data)
      .then((response) => {
        this.requestService.request('PUT', response.urlSigned, this.file, {}, false, false, true);
        this.utilService.presentToast('Publication created successful');
        this.dismiss();

        this.cacheService.createFeed(response);
      })
      .catch((error) => {
        console.log(error);
        this.utilService.presentToast('Publication failed');
      });
  }

  changeContent() {
    let element = document.getElementById('textarea');
    element.style.height = element.scrollHeight + 'px';
  }
  changeDoubt(event) {
    this.isDoubt = event.detail.checked;
  }
  clickInput() {
    this.fileInput.nativeElement.click();
  }

  async uploadImage() {
    const typesAllowed = ['image/jpeg', 'image/png', 'image/jpg'];
    const photo = this.fileInput.nativeElement.files[0];

    if (photo) {
      if (!typesAllowed.includes(photo.type)) {
        this.utilService.presentToast('Photo format not accepted');
      } else if (photo.size / 1000000 > 1) {
        this.utilService.presentToast('Size greater than 1 MB, the application does not support files larger than 1 MB');
      } else {
        this.file = photo;

        let reader = new FileReader();
        reader.readAsDataURL(this.file);
        reader.onload = (_event) => {
          this.previewFile = reader.result;
        };
      }
    }
  }
}
