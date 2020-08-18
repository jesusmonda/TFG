import { Injectable } from '@angular/core';
import { RequestService } from './request.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private requestService: RequestService) {}

  getRoomsByUserId() {
    return this.requestService.request('GET', `${environment.endpoint}/chat/me`, {}, {}, true, true, false);
  }

  readMessage(receiveeId: number) {
    return this.requestService.request('PUT', `${environment.endpoint}/chat/${receiveeId}/read`, {}, {});
  }

  getMessageRoom(receiveeId: number, data: any) {
    return this.requestService.request('GET', `${environment.endpoint}/chat/${receiveeId}/conversation`, data, {}, true, true, false);
  }
}
