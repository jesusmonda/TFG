import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-flag',
  templateUrl: './flag.component.html',
  styleUrls: ['./flag.component.scss'],
})
export class FlagComponent implements OnInit {
  @Input() languages: any;
  @Input() skeleton = false;

  nativeLanguage: any;
  learnLanguage: any;

  constructor() {}

  ngOnInit() {
    if (!this.skeleton) { this.getLanguages(); }
  }

  getLanguages() {
    this.nativeLanguage = this.languages.filter((x) => x.native == true);
    this.learnLanguage = this.languages.filter((x) => x.learn == true);

    this.nativeLanguage.map((x) => {
      return (x.class = this.setLanguage(x.languageName));
    });
    this.learnLanguage.map((x) => {
      return (x.class = this.setLanguage(x.languageName));
    });
  }

  setLanguage(language: string) {
    if (language == 'spanish') {
      return 'flag-icon flag-icon-es';
    }

    if (language == 'english') {
      return 'flag-icon flag-icon-us';
    }

    if (language == 'italian') {
      return 'flag-icon flag-icon-it';
    }

    if (language == 'french') {
      return 'flag-icon flag-icon-fr';
    }

    if (language == 'german') {
      return 'flag-icon flag-icon-de';
    }
  }
}
