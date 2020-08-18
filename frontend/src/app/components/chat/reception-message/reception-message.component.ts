import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-reception-message',
  templateUrl: './reception-message.component.html',
  styleUrls: ['./reception-message.component.scss'],
})
export class ReceptionMessageComponent implements OnInit {
  @Input() message: any;

  constructor() {}

  ngOnInit() {}
}
