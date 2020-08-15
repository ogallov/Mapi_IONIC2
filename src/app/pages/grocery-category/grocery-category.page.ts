import { NavController } from "@ionic/angular";
import { GroceryService } from "./../../service/grocery.service";
import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: "app-grocery-category",
  templateUrl: "./grocery-category.page.html",
  styleUrls: ["./grocery-category.page.scss"],
})
export class GroceryCategoryPage implements OnInit {
  category: any = [];
  err: any = {};
  term = ""
  constructor(
    private api: ApiService,
    private util: UtilService,
    private gpi: GroceryService,
    private nav: NavController,
    private spinnerService: NgxSpinnerService
  ) {
    // this.util.startLoad();
    //this.spinnerService.show();
    this.api.getDataWithToken("groceryCategory").subscribe(
      (res: any) => {
        if (res.success) {
          // this.util.dismissLoader();
          //this.spinnerService.hide();
          this.category = res.data;
        }
      },
     (err) => {
        // this.util.dismissLoader();
        //this.spinnerService.hide();
      }
    );
  }

  ngOnInit() {

  }

  categoryDetail(id) {
    this.gpi.catId = id;
    this.nav.navigateForward("store");
  }
}
