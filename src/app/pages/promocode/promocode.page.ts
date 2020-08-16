import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { Component, OnInit } from "@angular/core";
import { NavController } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: "app-promocode",
  templateUrl: "./promocode.page.html",
  styleUrls: ["./promocode.page.scss"]
})
export class PromocodePage implements OnInit {
  data: any;
  isfrom: any;
  promocode: any = {};
  constructor(
    private ntrl: NavController,
    private api: ApiService,
    private util: UtilService,
    private route: ActivatedRoute,
    private spinnerService: NgxSpinnerService
  ) {
    this.route.params.subscribe((params) => {
      this.isfrom = params["id"];
      if (this.isfrom == "menu") {
        // await this.util.startLoad();
        this.spinnerService.show();
        this.api.getDataWithToken("viewCoupon").subscribe((res: any) => {
          if (res.success) {
            this.data = res.data;
            // this.util.dismissLoader();
            this.spinnerService.hide();
          }
        });
      } else {
        // await this.util.startLoad();
        this.spinnerService.show();
        this.api
          .getDataWithToken("viewShopCoupon/" + this.isfrom)
          .subscribe((res: any) => {
            if (res.success) {
              this.data = res.data;
              // this.util.dismissLoader();
              this.spinnerService.hide();
            }
          });
      }
    });
  }

  ngOnInit() {
  }

  back() {
    this.ntrl.back();
  }

  aapplyPromocode(item) {
    this.promocode.code = item.code;
    // await this.util.startLoad();
    this.spinnerService.show();
    this.api
      .postDataWithToken("chkCoupon", this.promocode)
      .subscribe(async (res: any) => {
        if (res.success) {
          // this.util.dismissLoader();
          this.spinnerService.hide();
          this.api.promocode = item;
          this.ntrl.back();
        } else {
          // this.util.dismissLoader();
          this.spinnerService.hide();
          this.util.presentToast(res.msg);
        }
      });
  }
}
