import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilService } from '../../services/util.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-edit-modal',
  templateUrl: './profile-edit-modal.component.html',
  styleUrls: ['./profile-edit-modal.component.scss'],
})
export class ProfileEditModalComponent implements OnInit {
  @Input() type: string;
  @Input() userInfo: any;

  // name, surname, bio
  inputValue: string;
  inputLabel: string;
  message_value: string;

  // languages
  availableLanguages: any;
  nativeLanguages: any;
  learnLanguages: any;

  // topics
  topics = [
    { val: 'TV', isChecked: false },
    { val: 'Musics', isChecked: false },
    { val: 'Computer sciences', isChecked: false },
    { val: 'Sports', isChecked: false },
    { val: 'Policy', isChecked: false },
    { val: 'Art', isChecked: false },
    { val: 'Cine', isChecked: false },
    { val: 'Food', isChecked: false },
  ];

  constructor(public modalController: ModalController, public utilService: UtilService, public userService: UserService) {}

  ngOnInit() {
    // name
    if (this.type == 'name') {
      this.inputValue = this.userInfo.name;
      this.inputLabel = 'Update you name';
    }
    // surname
    if (this.type == 'surname') {
      this.inputValue = this.userInfo.surname;
      this.inputLabel = 'Update you surname';
    }

    // checked your topics
    if (this.type == 'topic') {
      this.topics.map((x) => {
        const rows = this.userInfo.profileTopics.find((y) => x.val == y.topic);
        if (rows) {
          x.isChecked = true;
        }
      });
    }

    if (this.type == 'language') { this.loadLanguages(); }
  }

  loadLanguages() {
    this.utilService.presentToast('You can only choose languages once, you cannot change your choice').then();
    this.utilService.getAvailableLanguages().then((response) => {
      this.availableLanguages = response;

      // check native languages
      const native = this.userInfo.languages.filter((x) => x.native == true && x.learn == false);
      this.nativeLanguages = response.map((x) => {
        const rows = native.find((y) => y.languageName == x.name && y.native == true && y.learn == false);
        if (rows) {
          x.isChecked = true;
        } else {
          x.isChecked = false;
        }
        return { name: x.name, id: x.id, isChecked: x.isChecked, disabled: false };
      });

      // check learn languages
      const learn = this.userInfo.languages.filter((x) => x.native == false && x.learn == true);
      this.learnLanguages = response.map((x) => {
        const rows = learn.find((y) => y.languageName == x.name && y.native == false && y.learn == true);
        if (rows) {
          x.isChecked = true;
        } else {
          x.isChecked = false;
        }
        return { name: x.name, id: x.id, isChecked: x.isChecked, disabled: false };
      });

      // disabled languages
      this.disabledLanguages();
    });
  }

  changeData(event) {
    if (this.type == 'name' || this.type == 'surname' || this.type == 'bio') { this.message_value = event; }
    if (this.type == 'language') { this.disabledLanguages(); }
  }

  async send() {
    try {
      // name, surname, bio
      const userAccount: any = {};
      if (this.type == 'name') { userAccount.name = this.message_value; }
      if (this.type == 'surname') { userAccount.surname = this.message_value; }
      if (this.type == 'bio') { userAccount.aboutUser = this.message_value; }
      if (Object.keys(userAccount).length != 0) {
        const userInfo = await this.userService.updateProfile(userAccount);
        this.dismiss(userInfo);
      }

      // topics
      if (this.type == 'topic') {
        const checkedTopics = [];
        this.topics.map((x) => {
          if (x.isChecked) { checkedTopics.push(x.val); }
        });
        const userInfo = await this.userService.updateProfile({ topics: checkedTopics });
        this.dismiss(userInfo);
      }

      // languages
      if (this.type == 'language') {
        const nativeChecked = [];
        const learnChecked = [];

        this.nativeLanguages.map((x) => {
          if (x.isChecked) { nativeChecked.push(x.id); }
        });
        this.learnLanguages.map((x) => {
          if (x.isChecked) { learnChecked.push(x.id); }
        });

        if (nativeChecked.length == 0 || learnChecked.length == 0) {
          await this.utilService.presentToast('You must select at least one language in each field');
        } else {
          const userInfo = await this.userService.updateProfile({ nativeLanguage: nativeChecked, learnLanguage: learnChecked });
          this.dismiss(userInfo);

          // remove feed cache
          for (let key in localStorage) {
            if (key.includes(`/feed/type/`) || key.includes(`/discover/people`)) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      this.utilService.presentToast('Fail update profile').then();
    }
  }

  disabledLanguages() {
    const nativeChecked = this.nativeLanguages.filter((x) => x.isChecked == true);
    const learnChecked = this.learnLanguages.filter((x) => x.isChecked == true);

    // disabled learn languages
    this.nativeLanguages.map((x) => {
      const rows = learnChecked.find((y) => y.name == x.name);
      if (rows) {
        x.disabled = true;
      } else {
        x.disabled = false;
      }
      return { name: x.name, isChecked: x.isChecked, disabled: x.disabled };
    });

    // disabled native languages
    this.learnLanguages.map((x) => {
      const rows = nativeChecked.find((y) => y.name == x.name);
      if (rows) {
        x.disabled = true;
      } else {
        x.disabled = false;
      }
      return { name: x.name, isChecked: x.isChecked, disabled: x.disabled };
    });
  }

  dismiss(userInfo?) {
    if (userInfo) { this.modalController.dismiss(userInfo); }
    if (!userInfo) { this.modalController.dismiss(); }
  }
}
