import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { ModalController } from '@ionic/angular';
import { RequestService } from '../../services/request.service';
import { LoginService } from '../../services/login.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  environment: any = environment;

  constructor(
    public router: Router,
    private googlePlus: GooglePlus,
    private loginService: LoginService,
    public modalController: ModalController,
    private requestService: RequestService
  ) {}

  ngOnInit() {}

  async loginGoogle() {
    try {
      await this.googlePlus.logout();
    } catch (e) {}

    this.googlePlus.login({}).then(async (response) => {
      const params = {
        socialNetwork: 'google',
        email: response.email,
        userId: response.userId,
        surname: response.familyName,
        name: response.givenName,
      };
      const access_token = await this.loginService.login(params);
      localStorage.setItem('access_token', access_token.access_token);

      this.requestService.connection();
      this.router.navigate(['/feed']);
    });
  }

  loginDevelop() {
    localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOjJ9.tfbvPh3P4dwHAGF8CGQQag6UjPFq2QVbFogx2IOMq9Y');
    this.requestService.connection();
    this.router.navigate(['/feed']);
  }
}
