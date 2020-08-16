import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { GroceryService } from "./../../service/grocery.service";
import { NavController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: "app-grocery-history",
  templateUrl: "./grocery-history.page.html",
  styleUrls: ["./grocery-history.page.scss"],
})
export class GroceryHistoryPage implements OnInit {
  data: any = {};
  err: any = {};
  currency: any;
  constructor(
    private nav: NavController,
    private api: ApiService,
    private gpi: GroceryService,
    private util: UtilService,
    private spinnerService: NgxSpinnerService,

  ) {
    this.currency = this.api.currency;
    // this.util.startLoad();
    this.spinnerService.show();
    this.api.getDataWithToken("groceryOrder").subscribe(
      (res: any) => {
        if (res.success) {
          // this.util.dismissLoader();
          this.spinnerService.hide();
          this.data = res.data;
        }
      },
      (err) => {
        // this.util.dismissLoader();
        this.spinnerService.hide();
      }
    );
  }

  ngOnInit() {
  }

  orderDetail(id) {
    this.gpi.orderId = id;
    this.nav.navigateForward("grocery-status");
  }
  pastDetail(id) {
    this.gpi.orderId = id;
    this.nav.navigateForward("grocery-order-detail");
  }
}
