import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { RequestService } from './services/request.service';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform, private splashScreen: SplashScreen, private statusBar: StatusBar, private requestService: RequestService, private file: File) {
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#fff');
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // create app directory
      if (this.platform.is('android')) {
        this.file.checkDir(this.file.externalRootDirectory, 'app').catch((_) => {
          this.file.createDir(this.file.externalRootDirectory, 'app', true);
        });
      }
    });

    this.requestService.connection();
  }
}
