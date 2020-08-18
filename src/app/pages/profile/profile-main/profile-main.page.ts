import { Component, OnInit } from '@angular/core';
import { FeedService } from '../../../services/feed.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from '../../../services/util.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-profile-main',
  templateUrl: './profile-main.page.html',
  styleUrls: ['./profile-main.page.scss'],
})
export class ProfileMainPage implements OnInit {
  feeds: any;
  userInfo: any;
  userId: any = this.route.snapshot.params.id;
  editProfile: boolean = this.userId == this.userService.getUserMeId();

  constructor(private platform: Platform, private feedService: FeedService, private userService: UserService, private route: ActivatedRoute, private utilService: UtilService) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.getUserInfo(null, false);
    this.loadFeedMe(null, false);
  }

  getUserInfo(event: any, doRequest: boolean) {
    this.userService
      .getUserInfo(this.userId, doRequest)
      .then((response) => {
        this.userInfo = response;

        if (event != null) { event.target.complete(); }

        if (response.not_update && doRequest == true) {
          this.utilService.presentToast('Fail load user').then();
        }
      })
      .catch((error) => {
        this.utilService.presentToast('Fail load user').then();
        console.log(error);
      });
  }

  loadFeedMe(event: any, doRequest: boolean) {
    this.feedService
      .getFeeduserServiceByUserId(this.userId, { limit: 2 }, doRequest)
      .then((response) => {
        this.feeds = response;

        if (event != null) { event.target.complete(); }

        if (response.not_update && doRequest == true) {
          this.utilService.presentToast('Fail load feeds').then();
        }
      })
      .catch((error) => {
        this.utilService.presentToast('Fail load feeds').then();
        console.log(error);
      });
  }
}
