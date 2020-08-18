import { Injectable } from '@angular/core';
import { RequestService } from './request.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private requestService: RequestService) {}

  login(data: any) {
    return this.requestService.request('POST', `${environment.endpoint}/login`, data, {});
  }
}
