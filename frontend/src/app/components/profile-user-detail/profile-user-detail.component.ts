import { Component, OnInit, Input } from '@angular/core';
import { FeedService } from '../../services/feed.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-user-detail',
  templateUrl: './profile-user-detail.component.html',
  styleUrls: ['./profile-user-detail.component.scss'],
})
export class ProfileUserDetailComponent implements OnInit {
  @Input() feeds: any;
  @Input() title: string;
  @Input() userInfo: any;
  @Input() skeleton = false;

  userId: any = this.route.snapshot.params.id || undefined;

  constructor(private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit() {
    if (!this.skeleton && this.userId == undefined) { this.userId = this.userService.getUserMeId(); }
  }
}
