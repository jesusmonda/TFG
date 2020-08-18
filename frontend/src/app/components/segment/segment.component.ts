import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-segment',
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.scss'],
})
export class SegmentComponent implements OnInit {
  @Input() value: string;
  @Input() segmentTypes: any;
  @Output() change = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  changeEvent(event) {
    this.value = event.detail.value;
    this.change.emit(this.value);
  }
}
