import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnInit {
  @Input() user: any;
  @Input() lines: string;
  @Input() created: any;
  @Input() skeleton = false;

  constructor() {}

  ngOnInit() {}
}
