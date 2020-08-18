import { Injectable } from '@angular/core';
import { RequestService } from './request.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private requestService: RequestService) {}

  getUserInfo(id: number, doRequest: boolean) {
    return this.requestService.request('GET', `${environment.endpoint}/user/${id}`, {}, {}, true, true, doRequest);
  }

  updateProfile(data: any) {
    return this.requestService.request('PUT', `${environment.endpoint}/user`, data, {});
  }

  getUserAvailable() {
    return this.requestService.request('GET', `${environment.endpoint}/user/call`, {}, {}, true, true, true);
  }

  getUserMeId() {
    if (localStorage.getItem('access_token')) { return JSON.parse(atob(localStorage.getItem('access_token').split('.')[1])).userId; }
  }
}
