import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { Component, OnInit } from "@angular/core";
import { NavController } from "@ionic/angular";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: "app-forgot",
  templateUrl: "./forgot.page.html",
  styleUrls: ["./forgot.page.scss"]
})
export class ForgotPage implements OnInit {
  data: any = {};
  err: any = {};
  constructor(
    private ntrl: NavController,
    private api: ApiService,
    private util: UtilService,
    private spinnerService: NgxSpinnerService,

  ) {}

  ngOnInit() {}

  Sendpassword() {
    // await this.util.startLoad();
    this.spinnerService.show();
    this.api.postData("forgetPassword", this.data).subscribe(
      (res: any) => {

        if (res.success) {
          // this.util.dismissLoader();
          this.spinnerService.hide();
          this.util.presentToast(res.msg);
          this.ntrl.navigateForward(["login"]);
        }
      },
      (err) => {
        if (err.error.msg) {
          this.util.presentToast(err.error.msg);
        }
        this.err = err.error.errors;
        // this.util.dismissLoader();
        this.spinnerService.hide();
      }
    );
  }
  backPage() {
    this.ntrl.back();
  }
}
