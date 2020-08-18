import { Injectable } from '@angular/core';
import { RequestService } from './request.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DiscoverService {
  constructor(private requestService: RequestService) {}

  getPeople(doRequest: boolean) {
    return this.requestService.request('GET', `${environment.endpoint}/discover/people`, {}, {}, true, true, doRequest);
  }
}
