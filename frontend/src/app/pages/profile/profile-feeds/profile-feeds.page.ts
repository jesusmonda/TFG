import { Component, OnInit } from '@angular/core';
import { FeedService } from '../../../services/feed.service';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from '../../../services/util.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-profile-feeds',
  templateUrl: './profile-feeds.page.html',
  styleUrls: ['./profile-feeds.page.scss'],
})
export class ProfileFeedsPage implements OnInit {
  // view
  feeds: any = [];
  userId: any = this.route.snapshot.params.id;

  // infinite scroll
  page: number;
  hideInfiniteScroll = false;

  constructor(private platform: Platform, private feedService: FeedService, private route: ActivatedRoute, private utilService: UtilService) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadFeedUser('init', null, { page: 0 }, false);
    this.page = 1;
  }

  loadFeedUser(sourceType: string, sourceData: any, requestData: any, doRequest: boolean) {
    this.feedService
      .getFeeduserServiceByUserId(this.userId, requestData, doRequest)
      .then((response) => {
        // update this.feeds
        if (sourceType == 'init' || sourceType == 'refresher') {
          // change refresher
          this.feeds = response;
          this.page = 1;
          this.hideInfiniteScroll = false;
        } else {
          this.feeds.push.apply(this.feeds, response); // scroll infinite
          this.page += 1;
        }

        // refresher complete
        if (sourceType == 'refresher') { sourceData.target.complete(); }

        if (response.length < 15) { this.hideInfiniteScroll = true; } // disabled scroll
        if (response.length == 0 && sourceType == 'infiniteScroll') { this.hideInfiniteScroll = true; } // disabled scroll
        if (response.length > 0 && sourceType == 'infiniteScroll') { sourceData.target.complete(); } // complete infinite scroll

        if (response.not_update && sourceType == 'refresher') {
          this.utilService.presentToast('Fail load feeds').then();
        }
      })
      .catch((error) => {
        this.utilService.presentToast('Fail load feeds').then();
        console.log(error);
      });
  }

  // infinite scroll
  infiniteScrollData(event) {
    setTimeout(() => {
      this.loadFeedUser('infiniteScroll', event, { page: this.page }, false);
    }, 500);
  }
}
