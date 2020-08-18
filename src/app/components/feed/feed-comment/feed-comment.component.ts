import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-feed-comment',
  templateUrl: './feed-comment.component.html',
  styleUrls: ['./feed-comment.component.scss'],
})
export class FeedCommentComponent implements OnInit {
  @Input() comment: any;
  @Input() skeleton = false;

  constructor() {}

  ngOnInit() {}
}
