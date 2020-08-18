import { Component, OnInit } from '@angular/core';
import { DiscoverService } from '../../services/discover.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {
  peoples: any;

  constructor(private discoverService: DiscoverService, private utilService: UtilService) {}

  ngOnInit() {
    this.getPeople('init', null, false);
  }

  getPeople(sourceType: string, sourceData: any, doRequest: boolean) {
    this.discoverService
      .getPeople(doRequest)
      .then(async (response) => {
        this.peoples = response;

        if (sourceType == 'refresher') { sourceData.target.complete(); }

        if (response.not_update && sourceType == 'refresher') {
          this.utilService.presentToast('Fail load discover').then();
        }
      })
      .catch(async (error) => {
        this.utilService.presentToast('Fail load discover').then();
        console.log(error);
      });
  }
}
