import { GroceryService } from "./../../service/grocery.service";
import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { NavController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: "app-store",
  templateUrl: "./store.page.html",
  styleUrls: ["./store.page.scss"],
})
export class StorePage implements OnInit {
  Store: any = [];
  err: any = {};
  term = ""
  // userAddress: any = {};

  constructor(
    private nav: NavController,
    private api: ApiService,
    private util: UtilService,
    private gpi: GroceryService,
    private spinnerService: NgxSpinnerService,

  ) {
    if (this.gpi.catId) {
      // await this.util.startLoad();
      this.spinnerService.show();
      this.api.getDataWithToken("groceryShop/" + this.gpi.catId).subscribe(
        (res: any) => {
          if (res.success) {
            // this.util.dismissLoader();
            this.Store = res.data;
            this.gpi.catId = undefined;

            // this.api
            //   .getDataWithToken(
            //     "getAddress/" + localStorage.getItem("isaddress")
            //   )
            //   .subscribe(
            //     (res: any) => {
            //       if (res.success) {
                    // this.userAddress = res.data;
                    // this.util.dismissLoader();
                    this.spinnerService.hide();
                    this.Store.forEach((element) => {
                      element.away = Number(
                        this.distance(
                          parseFloat(this.api.lat),
                          parseFloat(this.api.lang),
                          parseFloat(element.latitude),
                          parseFloat(element.longitude),
                          "K"
                        ).toFixed(2)
                      );
                    });
              //     }
              //   },
              //   (err) => {
              //     this.err = err;
              //     // this.util.dismissLoader();
              //     this.spinnerService.hide();
              //   }
              // );
          }
        },
        (err) => {
          this.err = err;
          // this.util.dismissLoader();
          this.spinnerService.hide();
        }
      );

    } else {

      // await this.util.startLoad();
      this.spinnerService.show();
      this.api.getDataWithToken("groceryShop").subscribe(
        (res: any) => {
          if (res.success) {
            // this.util.dismissLoader();
            this.Store = res.data.shop;

            // this.api
            //   .getDataWithToken(
            //     "getAddress/" + localStorage.getItem("isaddress")
            //   )
            //   .subscribe(
            //     (res: any) => {
            //       if (res.success) {
                    // this.userAddress = res.data;
                    // this.util.dismissLoader();
                    this.spinnerService.hide();
                    this.Store.forEach((element) => {
                      element.away = Number(
                        this.distance(
                          parseFloat(this.api.lat),
                          parseFloat(this.api.lang),
                          parseFloat(element.latitude),
                          parseFloat(element.longitude),
                          "K"
                        ).toFixed(2)
                      );
                    });
              //     }
              //   },
              //   (err) => {
              //     this.err = err;
              //     // this.util.dismissLoader();
              //     this.spinnerService.hide();
              //   }
              // );
          }
        },
        (err) => {
          this.err = err;
          // this.util.dismissLoader();
          this.spinnerService.hide();
        }
      );
    }

  }

  async ngOnInit() {
  }

  storeDetail(id) {
    this.gpi.storeID = id;
    this.nav.navigateForward("store-detail");
  }
  distance(lat1, lon1, lat2, lon2, unit) {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      let radlat1 = (Math.PI * lat1) / 180;
      let radlat2 = (Math.PI * lat2) / 180;
      let theta = lon1 - lon2;
      let radtheta = (Math.PI * theta) / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") {
        dist = dist * 1.609344;
      }
      if (unit == "N") {
        dist = dist * 0.8684;
      }
      return dist;
    }
  }
}
