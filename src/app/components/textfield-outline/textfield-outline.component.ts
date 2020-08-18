import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { MDCTextField } from '@material/textfield';

@Component({
  selector: 'app-textfield-outline',
  templateUrl: './textfield-outline.component.html',
  styleUrls: ['./textfield-outline.component.scss'],
})
export class TextFieldOutlineComponent implements OnInit {
  counter = 0;

  @Input() type: string;
  @Input() typeInput: string;
  @Input() label: string;
  @Input() helpText: string;
  @Input() status: string;
  @Input() maxLength: number;
  @Input() rows = 5; // textarea
  @Input() cols = 48; // textarea
  @Input() disabled = false;
  @Input() value: any;

  @Output() changeValue = new EventEmitter();

  @ViewChild('mtfInput', { static: false }) mtfInput: any;

  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      new MDCTextField(this.mtfInput.nativeElement);
    }, 500);
  }

  emitValue() {
    if (this.maxLength) {
      if (this.value && this.value.length > this.maxLength) {
        this.status = 'danger';
      } else {
        this.status = '';
      }
    }

    this.changeValue.emit(this.value);
  }
}
