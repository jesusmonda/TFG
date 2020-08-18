import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { Network } from '@ionic-native/network/ngx';
import { File } from '@ionic-native/file/ngx';
import { ProfileEditModalComponent } from './components/profile-edit-modal/profile-edit-modal.component';
import { ProfileEditModalModule } from './components/profile-edit-modal/profile-edit-modal.module';
import { ErrorHandlerService } from './services/error-handler.service';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, ProfileEditModalModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Network,
    File,
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
  ],
  entryComponents: [ProfileEditModalComponent],
})
export class AppModule {}
