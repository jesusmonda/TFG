import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

@Component({
  selector: 'app-settings-main',
  templateUrl: './settings-main.page.html',
  styleUrls: ['./settings-main.page.scss'],
})
export class SettingsMainPage implements OnInit {
  constructor(public alertController: AlertController, private router: Router, private googlePlus: GooglePlus) {}

  ngOnInit() {}

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Delete account',
      message: 'Are you sure?',
      buttons: ['NO', 'YES'],
    });

    await alert.present();
  }

  logout() {
    localStorage.clear();
    this.googlePlus.disconnect();
    this.router.navigate(['/']);
  }
}
