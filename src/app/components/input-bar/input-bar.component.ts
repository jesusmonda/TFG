import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { v4 as uuidv4 } from 'uuid';
import { File } from '@ionic-native/file/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-input-bar',
  templateUrl: './input-bar.component.html',
  styleUrls: ['./input-bar.component.scss'],
})
export class InputBarComponent implements OnInit {
  @Input() type: any; // chat(0 = todo, 1 = button send, 2 == button voice), feed(0 = todo)
  @Input() status: any;
  @Input() socket: any;
  @Input() connectionInternet: any;
  @Output() changeValue = new EventEmitter();

  // view
  content = '';

  // count up
  minutes = 0;
  seconds = 0;

  // recording
  audio: MediaObject;
  interval: any;
  fileName: string;

  constructor(private platform: Platform, private media: Media, private file: File) {}

  ngOnInit() {}

  setStatus(status = null) {
    if (status == 1 && this.content.length == 0) {
      this.status = 0;
    } else {
      this.status = status;
    }
  }

  // message
  sendMessage() {
    this.changeValue.emit({ type: 'text', content: this.content });
    this.content = '';
    this.status = 0;
  }

  // audio
  startRecord() {
    this.setStatus(2);

    // create location and name
    this.fileName = `${uuidv4()}.wav`;
    const path = this.platform.is('android') ? `app/audio/${this.fileName}` : this.fileName;
    this.audio = this.media.create(path);
    this.audio.startRecord();

    // count up
    this.interval = setInterval((x) => this.countUp(), 1000);
  }
  async stopRecord(cancel: boolean) {
    this.setStatus(0);
    this.seconds = 0;
    this.minutes = 0;

    // stop recording an audio file
    this.audio.stopRecord();

    clearInterval(this.interval);

    let path = this.platform.is('android') ? this.file.externalRootDirectory : this.file.tempDirectory;
    if (!cancel) {
      if (this.platform.is('android')) {
        // create dir and release audio
        try {
          await this.file.checkDir(path, 'app/audio');
        } catch (error) {
          await this.file.createDir(path, 'app/audio', true);
        }
      }
      this.audio.release();

      // get file audio
      const audio: any = {};
      path = this.platform.is('android') ? `${this.file.externalRootDirectory}app/audio` : this.file.tempDirectory;
      audio.buffer = await this.file.readAsArrayBuffer(path, this.fileName);
      audio.fileName = this.fileName;

      this.changeValue.emit({ type: 'audio', content: audio });
    }
  }
  countUp() {
    if (this.seconds >= 59) {
      this.seconds = 0;
      this.minutes += 1;
    } else {
      this.seconds += 1;
    }

    if (this.minutes >= 5) {
      this.stopRecord(false);
    }
  }
}
