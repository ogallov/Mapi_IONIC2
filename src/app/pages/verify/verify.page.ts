import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { Component, OnInit } from "@angular/core";
import { MenuController, NavController } from "@ionic/angular";
import { countryCode } from "../../../environments/environment.prod";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: "app-verify",
  templateUrl: "./verify.page.html",
  styleUrls: ["./verify.page.scss"]
})
export class VerifyPage implements OnInit {
  err: any = {};
  data: any = {
    code: "+91",
    id: this.api.verifyId
  };

  cCode: any = countryCode;
  constructor(
    private menu: MenuController,
    private nav: NavController,
    private api: ApiService,
    private util: UtilService,
    private spinnerService: NgxSpinnerService
  ) {
    this.menu.enable(false);
  }

  ngOnInit() { }

  back() {
    this.nav.navigateRoot("login");
  }

  getOtp() {
    // await this.util.startLoad();
    //this.spinnerService.show();
    this.api.postData("verifyPhone", this.data).subscribe(
      (res: any) => {
        if (res.success) {
          // this.util.dismissLoader();
          //this.spinnerService.hide();
          this.util.presentToast(res.msg);
          this.api.verifynumber = this.data.phone;
          this.api.verifynuberCode = this.data.code;
          this.nav.navigateRoot("get-otp");
        } else {
          this.err = {};
          // this.util.dismissLoader();
          //this.spinnerService.hide();
          this.util.presentToast(res.msg);
        }
      },
      (err) => {
        this.err = err.error.errors;
        // this.util.dismissLoader();
        //this.spinnerService.hide();
      }
    );
  }
}
