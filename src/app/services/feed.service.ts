import { Injectable } from '@angular/core';
import { RequestService } from '../services/request.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  constructor(private requestService: RequestService) {}

  getFeedByType(type: string, data: any, doRequest: boolean) {
    return this.requestService.request('GET', `${environment.endpoint}/feed/type/${type}`, data, {}, true, true, doRequest);
  }

  getFeeduserServiceByUserId(userId: number, data: any, doRequest: boolean) {
    return this.requestService.request('GET', `${environment.endpoint}/feed/user/${userId}`, data, {}, true, true, doRequest);
  }

  getFeedById(id: number, doRequest: boolean) {
    return this.requestService.request('GET', `${environment.endpoint}/feed/${id}`, {}, {}, true, true, doRequest);
  }

  getCommentsByFeed(id: number, data: any, doRequest: boolean) {
    return this.requestService.request('GET', `${environment.endpoint}/feed/${id}/comment`, data, {}, true, true, doRequest);
  }

  createFeed(data: any) {
    return this.requestService.request('POST', `${environment.endpoint}/feed`, data, {});
  }

  createComments(id: number, data: any) {
    return this.requestService.request('POST', `${environment.endpoint}/feed/${id}/comment`, data, {});
  }

  createLike(id: number, data: any) {
    return this.requestService.request('POST', `${environment.endpoint}/feed/${id}/like`, data, {});
  }
}
