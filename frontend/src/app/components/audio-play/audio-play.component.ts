import { Component, OnInit, Input } from '@angular/core';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-audio-play',
  templateUrl: './audio-play.component.html',
  styleUrls: ['./audio-play.component.scss'],
})
export class AudioPlayComponent implements OnInit {
  @Input() audioInfo: any;

  // recording
  audio: MediaObject;
  isPlaying: boolean;

  constructor(private platform: Platform, private media: Media, private file: File) {}

  ngOnInit() {
    const path = this.platform.is('android') ? `${this.file.externalRootDirectory}app/audio/` : this.file.tempDirectory + '/';
    this.file
      .checkFile(path, this.audioInfo.fileName)
      .then((_) => {
        this.audio = this.media.create(path + this.audioInfo.fileName);
      })
      .catch((_) => {
        this.audio = this.media.create(this.audioInfo.fileUrl);
      });
  }

  play() {
    this.audio.play();
    this.isPlaying = true;
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
  }
}
