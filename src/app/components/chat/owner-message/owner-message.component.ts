import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-owner-message',
  templateUrl: './owner-message.component.html',
  styleUrls: ['./owner-message.component.scss'],
})
export class OwnerMessageComponent implements OnInit {
  @Input() message: any;

  constructor() {}

  ngOnInit() {}
}
