import { Component, OnInit, Input } from '@angular/core';
import { FeedService } from '../../../services/feed.service';
import { CacheService } from '../../../services/cache.service';

@Component({
  selector: 'app-feed-item',
  templateUrl: './feed-item.component.html',
  styleUrls: ['./feed-item.component.scss'],
})
export class FeedItemComponent implements OnInit {
  @Input() margin = false;
  @Input() feed: any;
  @Input() showComment = true;
  @Input() skeleton = false;

  constructor(private feedService: FeedService, private cacheService: CacheService) {}

  ngOnInit() {}

  createLike() {
    if (!this.feed.likeMe) {
      this.feed.like += 1;
    } else {
      this.feed.like -= 1;
    }
    this.feed.likeMe = !this.feed.likeMe;

    this.feedService
      .createLike(this.feed.id, { like: this.feed.likeMe })
      .then((_) => {
        this.cacheService.createLike(this.feed.id, this.feed.likeMe);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
