import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-profile-edit-item',
  templateUrl: './profile-edit-item.component.html',
  styleUrls: ['./profile-edit-item.component.scss'],
})
export class ProfileEditItemComponent implements OnInit {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() icon: string;

  constructor() {}

  ngOnInit() {}
}
