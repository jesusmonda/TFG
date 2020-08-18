import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-analytics',
  templateUrl: './user-analytics.component.html',
  styleUrls: ['./user-analytics.component.scss'],
})
export class UserAnalyticsComponent implements OnInit {
  @Input() editProfile: boolean;
  @Input() userInfo: any;
  @Input() skeleton = false;

  constructor() {}

  ngOnInit() {}
}
