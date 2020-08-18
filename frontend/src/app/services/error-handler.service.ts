import { Injectable, ErrorHandler } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UtilService } from './util.service';

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  constructor(private httpClient: HttpClient, private utilService: UtilService) {}

  handleError(error: any) {
    console.log(error);
    this.httpClient.post(`${environment.endpoint}/error`, { error: error.message }).toPromise();
  }
}
