import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { UtilService } from 'src/app/service/util.service';
import { ModalController } from '@ionic/angular';
import { GroceryService } from 'src/app/service/grocery.service';

@Component({
  selector: 'app-otpmodalpage',
  templateUrl: './otpmodalpage.page.html',
  styleUrls: ['./otpmodalpage.page.scss'],
})
export class OtpmodalpagePage implements OnInit {
  order_id: any;
  constructor(
    private api: ApiService,
    private util: UtilService,
    private modalController: ModalController,
    private gpi: GroceryService
  ) {

  }
  data: any = {};
  err: any = {};

  async ngOnInit() {
    await this.util.startLoad();
    this.api
      .getDataWithToken("singleGroceryOrder/" + this.gpi.orderId)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.order_id = res.data.id;
          }
        },
        async(err) => {
          await this.util.dismissLoader();
        }
      );
  }

  async checkOtp() {
    this.data.order_id = this.order_id;
    await this.util.startLoad();
    this.api.postDataWithToken("deliveredProduct", this.data).subscribe(
      async(res: any) => {
        if (res.success) {
          this.modalController.dismiss("true");
          await this.util.dismissLoader();
          this.err = {};
          this.order_id = res.data.id;
        } else {
          await this.util.dismissLoader();
          this.err = {};
          this.util.presentToast(res.msg);
        }
      },
      async(err) => {
        await this.util.dismissLoader();
        this.err = err.error.errors;
      }
    );
  }

}
