import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Network } from '@ionic-native/network/ngx';
import { environment } from '../../environments/environment';
import io from 'socket.io-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  // socket
  socketChat: any;
  socketChatEvent: Subject<any> = new Subject<any>();

  // internet
  connectionInternet: boolean;
  internetEvent: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient, private network: Network, private router: Router) {}

  connection() {
    // internet
    this.connectionInternet = this.network.type != 'none';
    this.internetEvent.next({
      connectionInternet: this.connectionInternet,
    });

    this.network.onDisconnect().subscribe(() => {
      this.connectionInternet = false;
      this.internetEvent.next({
        connectionInternet: this.connectionInternet,
      });
    });
    this.network.onConnect().subscribe(() => {
      this.connectionInternet = true;
      this.internetEvent.next({
        connectionInternet: this.connectionInternet,
      });
    });

    // socket chat
    if (localStorage.getItem('access_token') != null) {
      const socketChat = this.connectSocket('chat');
      socketChat.on('connect', () => {
        this.socketChat = socketChat;
        this.socketChatEvent.next({
          socket: this.socketChat,
        });
      });

      socketChat.on('disconnect', (reason) => {
        this.socketChat = undefined;
        this.socketChatEvent.next({
          socket: undefined,
        });
      });
    }
  }

  connectSocket(namespace: string) {
    return io(`${environment.websocket}/${namespace}`, {
      transports: ['websocket'],
      forceNew: false,
      reconnection: true,
      query: {
        token: localStorage.getItem('access_token'),
      },
    });
  }

  async request(method: string, uri: string, data: any, headers: any, auth: boolean = true, cacheable: boolean = false, doRequest: boolean = true) {
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      doRequest = true;
      cacheable = false;
    }
    if (['GET', 'DELETE'].includes(method)) {
      uri = this.serializeUrl(uri, data);
    }
    if (auth) {
      const access_token = localStorage.getItem('access_token');
      headers.Authorization = 'Bearer ' + access_token;
    }

    const responseCache = JSON.parse(localStorage.getItem(`${method}:${uri}`));

    /* no internet */
    // not internet and not response on cache
    if (!this.connectionInternet && responseCache == null) {
      throw { status: 500 };
    }

    // not internet and response on cache
    if (!this.connectionInternet && responseCache != null) {
      responseCache.not_update = true;
      return responseCache;
    }

    /* internet */
    // not request and is on cache
    if (!doRequest && responseCache != null) {
      if (cacheable) { this.doRequest(uri, method, data, headers, cacheable, responseCache); }
      return responseCache;
    }

    // not on cache
    if (doRequest || (!doRequest && responseCache == null)) {
      try {
        const response = await this.doRequest(uri, method, data, headers, cacheable, responseCache);
        return response;
      } catch (error) {
        throw error;
      }
    }
  }

  async doRequest(uri, method, data, headers, cacheable, responseCache) {
    try {
      let httpResponse: Promise<any>;
      switch (method) {
        case 'GET':
          httpResponse = this.httpClient.get(uri, { headers }).toPromise();
          break;
        case 'POST':
          httpResponse = this.httpClient.post(uri, data, { headers }).toPromise();
          break;
        case 'PUT':
          httpResponse = this.httpClient.put(uri, data, { headers }).toPromise();
          break;
        case 'DELETE':
          httpResponse = this.httpClient.delete(uri, { headers }).toPromise();
          break;
      }
      const response = await httpResponse;
      if (cacheable) {
        localStorage.setItem(`${method}:${uri}`, JSON.stringify(response));
      }

      return response;
    } catch (error) {
      // unauthrozation
      const exp = JSON.parse(atob(localStorage.getItem('access_token').split('.')[1])).exp * 1000;
      if (new Date().getTime() >= exp) {
        localStorage.clear();
        this.router.navigate(['/']);
      }

      // on cache
      if (responseCache != null) {
        responseCache.not_update = true;
        return responseCache;
      } else {
        throw error;
      }
    }
  }

  serializeUrl(uri, params) {
    const str = [];

    for (const p in params) {
      if (params.hasOwnProperty(p) && params[p] !== null) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(params[p]));
      }
    }

    if (str.length) {
      return uri + '?' + str.join('&');
    } else {
      return uri;
    }
  }
}
