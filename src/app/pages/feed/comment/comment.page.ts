import { Component, OnInit, ViewChild } from '@angular/core';
import { FeedService } from '../../../services/feed.service';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { UtilService } from '../../../services/util.service';
import { CacheService } from '../../../services/cache.service';
import { RequestService } from '../../../services/request.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.page.html',
  styleUrls: ['./comment.page.scss'],
})
export class CommentsPage implements OnInit {
  @ViewChild(IonContent, {}) content: IonContent;

  feed: any;
  comments: any;
  commentContent = '';

  // internet
  connectionInternet: boolean;
  internetSubscription: any;

  // infinite scroll
  page: number;
  hideInfiniteScroll = false;

  constructor(
    private route: ActivatedRoute,
    private feedService: FeedService,
    private utilService: UtilService,
    private cacheService: CacheService,
    private requestService: RequestService
  ) {}

  ngOnInit() {
    this.getFeed(null, false);
    this.getComment('init', null, { page: 0 }, false);
    this.updateConnectionTimeReal();
  }

  ionViewWillLeave() {
    this.internetSubscription.unsubscribe();
  }

  scrollToTop() {
    setTimeout((x) => {
      this.content.scrollToTop().then();
    }, 50);
  }

  updateConnectionTimeReal() {
    this.connectionInternet = this.requestService.connectionInternet;

    this.internetSubscription = this.requestService.internetEvent.subscribe((data: any) => {
      this.connectionInternet = data.connectionInternet;
    });
  }

  getFeed(event: any, doRequest: boolean) {
    this.feedService
      .getFeedById(this.route.snapshot.params.id, doRequest)
      .then((response) => {
        this.feed = response;

        if (event != null) { event.target.complete(); }

        if (response.not_update && doRequest == true) {
          this.utilService.presentToast('Fail load feed').then();
        }
      })
      .catch((error) => {
        this.utilService.presentToast('Fail load feed').then();
        console.log(error);
      });
  }

  getComment(sourceType: string, sourceData: any, requestData: any, doRequest: boolean) {
    this.feedService
      .getCommentsByFeed(this.route.snapshot.params.id, requestData, doRequest)
      .then((response) => {
        // update this.feeds
        if (sourceType == 'init' || sourceType == 'refresher') {
          // refresher
          this.comments = response;
          this.page = 1;
        } else {
          this.comments.push.apply(this.comments, response); // scroll infinite
          this.page += 1;
        }

        // refresher complete
        if (sourceType == 'refresher') { sourceData.target.complete(); }

        if (response.length < 15) { this.hideInfiniteScroll = true; } // disabled scroll
        if (response.length == 0 && sourceType == 'infiniteScroll') { this.hideInfiniteScroll = true; } // disabled scroll
        if (response.length > 0 && sourceType == 'infiniteScroll') { sourceData.target.complete(); } // complete infinite scroll

        if (response.not_update && sourceType == 'refresher') {
          this.utilService.presentToast('Fail load comments').then();
        }
      })
      .catch((error) => {
        this.utilService.presentToast('Fail load comments').then();
        console.log(error);
      });
  }

  createComment(event: any) {
    this.feedService
      .createComments(this.route.snapshot.params.id, { content: event.content })
      .then(async (response) => {
        this.commentContent = '';
        this.comments.unshift(response);
        this.scrollToTop();
        await this.utilService.presentToast('Comment created successful');

        this.cacheService.createComment(response);
      })
      .catch(async (error) => {
        console.log(error);
        await this.utilService.presentToast('Comment failed');
      });
  }

  // infinite scroll
  infiniteScrollData(event) {
    setTimeout(() => {
      this.getComment('infiniteScroll', event, { page: this.page }, false);
    }, 500);
  }
}
