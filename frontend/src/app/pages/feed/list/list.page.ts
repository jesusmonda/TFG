import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonInfiniteScroll, IonRouterOutlet, Platform } from '@ionic/angular';
import { FeedModalComponent } from '../../../components/feed/feed-modal/feed-modal.component';
import { FeedService } from '../../../services/feed.service';
import { UtilService } from '../../../services/util.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  @ViewChild(IonInfiniteScroll, {}) infiniteScroll: IonInfiniteScroll;

  // view
  feeds: any;
  feedType: string;
  segmentTypes: any = ['General', 'Doubts'];

  // infinite scroll
  page: number;
  hideInfiniteScroll = false;

  constructor(
    private platform: Platform,
    private modalController: ModalController,
    private feedService: FeedService,
    private utilService: UtilService,
    private actRoute: ActivatedRoute,
    private routerOutlet: IonRouterOutlet
  ) {}

  ngOnInit() {
    this.feedType = 'General';
  }

  ionViewWillEnter() {
    this.loadFeeds('init', this.feedType, { page: 0 }, false);
    this.page = 1;
  }

  loadFeeds(sourceType: string, sourceData: any, requestData: any, doRequest: boolean) {
    this.feedType = sourceType == 'segment' || sourceType == 'init' ? sourceData : this.feedType;

    this.feedService
      .getFeedByType(this.feedType.toLowerCase(), requestData, doRequest)
      .then((response) => {
        // update this.feeds
        if (sourceType == 'init' || sourceType == 'segment' || sourceType == 'refresher') {
          // change segments or refresher
          this.feeds = response;
          this.page = 1;
          this.hideInfiniteScroll = false;
        } else {
          this.feeds.push.apply(this.feeds, response); // scroll infinite
          this.page += 1;
        }

        // refresher complete
        if (sourceType == 'refresher') { sourceData.target.complete(); }

        // show scroll
        if (sourceType == 'segment') { this.hideInfiniteScroll = false; }

        if (response.length < 15) { this.hideInfiniteScroll = true; } // disabled scroll
        if (response.length == 0 && sourceType == 'infiniteScroll') { this.hideInfiniteScroll = true; } // disabled scroll
        if (response.length > 0 && sourceType == 'infiniteScroll') { sourceData.target.complete(); } // complete infinite scroll

        if (response.not_update && sourceType == 'refresher') {
          this.utilService.presentToast('Fail load feed').then();
        }
      })
      .catch((error) => {
        this.utilService.presentToast('Fail load feed').then();
        console.log(error);
      });
  }

  // infinite scroll
  infiniteScrollData(event) {
    setTimeout(() => {
      this.loadFeeds('infiniteScroll', event, { page: this.page }, false);
    }, 500);
  }

  // modal to create feed
  async presentModal() {
    const modal = await this.modalController.create({
      component: FeedModalComponent,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
    });
    return await modal.present();
  }

  // swipe
  // swipe(direction: string) {
  //   this.feedType = this.utilService.goToNextSegment(this.segmentTypes, this.feedType, direction);
  // }
}
