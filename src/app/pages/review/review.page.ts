import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { Component, OnInit } from "@angular/core";
import { NavController, MenuController } from "@ionic/angular";
import * as moment from "moment";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: "app-review",
  templateUrl: "./review.page.html",
  styleUrls: ["./review.page.scss"]
})
export class ReviewPage implements OnInit {
  data: any = {};
  state: any = 1;
  bookmarkData: any = {};
  currency: any;
  constructor(
    private ntrl: NavController,
    private menu: MenuController,
    private api: ApiService,
    private util: UtilService,
    private spinnerService: NgxSpinnerService,

  ) {
    this.currency = this.api.currency;
    // await this.util.startLoad();
    this.spinnerService.show();
    this.api
      .getDataWithToken("shopDetail/" + this.api.detailId)
      .subscribe((res: any) => {
        if (res.success) {
          this.data = res.data;
          // this.util.dismissLoader();
          this.spinnerService.hide();
          this.data.review.forEach(element => {
            element.created_at = moment(element.created_at).fromNow();
          });
        }
      });
  }

  ngOnInit() {
  }

  logScrolling(ev) {
    if (ev.detail.scrollTop >= 200) {
      this.state = 2;
    } else {
      this.state = 1;
    }
  }

  back() {
    this.ntrl.back();
  }

  addBookmark() {
    this.bookmarkData.shop_id = this.data.id;

    this.api
      .postDataWithToken("addBookmark", this.bookmarkData)
      .subscribe((res: any) => {
        if (res.success) {
          if (this.data.favourite) {
            this.data.favourite = false;
            this.util.presentToast(res.msg);
          } else {
            this.data.favourite = true;
            this.util.presentToast(res.msg);
          }
        }
      });
  }
}
