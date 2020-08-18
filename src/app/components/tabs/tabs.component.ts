import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {
  constructor(
    public userService: UserService,
    public platform: Platform
  ) {}

  ngOnInit() {}
}
