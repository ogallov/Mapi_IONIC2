import { GrocerySuccessPage } from "./../grocery-success/grocery-success.page";
import { SuccessModalPage } from "./../success-modal/success-modal.page";
import { ModalController } from "@ionic/angular";
import { GroceryService } from "./../../service/grocery.service";
import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { Component, OnInit } from "@angular/core";
import {
  PayPal,
  PayPalPayment,
  PayPalConfiguration,
} from "@ionic-native/paypal/ngx";
import { NgxSpinnerService } from 'ngx-spinner';
declare var RazorpayCheckout: any;

@Component({
  selector: "app-pay-method",
  templateUrl: "./pay-method.page.html",
  styleUrls: ["./pay-method.page.scss"],
})

export class PayMethodPage implements OnInit {
  currencyType: any;
  data: any = {};
  online = 0;
  cash = 1;
  err: any;
  payment_type: any = "LOCAL";
  apdata: any = {};

  constructor(
    private api: ApiService,
    private util: UtilService,
    private gpi: GroceryService,
    private payPal: PayPal,
    private modalController: ModalController,
    private spinnerService: NgxSpinnerService
  ) {
    this.apdata = this.gpi.info;

    this.currencyType = this.api.currencyType;
    
    // await this.util.startLoad();
    this.spinnerService.show();
    this.api.getDataWithToken("keySetting").subscribe((res: any) => {
      if (res.success) {
        this.data = res.data;
        // this.util.dismissLoader();
        this.spinnerService.hide();
      }
    }, error => {
      console.log(error);
      this.spinnerService.hide();
    });
  }

  ngOnInit() {
  }

  paymentMethod() {
    /* 
    return */
    let rdata: any = {};
    rdata.items = [];
    rdata.itemData = [];
    rdata.shop_id = this.gpi.storeID;
    rdata.payment = this.gpi.info.toPay;
    rdata.discount = this.gpi.info.discount;
    rdata.delivery_charge = this.gpi.info.delivery_charge;
    rdata.delivery_type = this.gpi.info.delivery_type;

    if (this.gpi.promocode == undefined) {
    } else {
      rdata.coupon_id = this.gpi.promocode.id;
    }

    rdata.coupon_price = this.gpi.info.discount;

    if (typeof this.data.items == "string") {
      rdata.items = [];
    }

    this.gpi.cartData.forEach((element) => {
      rdata.items.push(element.id);
      let pusher: any = {
        item_id: element.id,
        price: element.total * element.qty,
        quantity: element.qty,
      };
      rdata.itemData.push(pusher);
    });
    rdata.items = rdata.items.join();

    if (this.online) {

      if (this.payment_type == "RAZOR") {
        this.payWithRazor(rdata);
      } else {
        if (this.currencyType == "INR") {
          this.util.presentToast("payment not possible");
        } else {
          this.paypalPay(rdata);
        }
      }

    } else {
      rdata.payment_status = 0;
      rdata.payment_type = this.payment_type;
      // await this.util.startLoad();

      console.log(rdata);
      
      this.spinnerService.show();
      this.api.postDataWithToken("createGroceryOrder", rdata).subscribe(
        (res: any) => {
          if (res.success) {
            console.log(res);
            
            // this.util.dismissLoader();
            this.spinnerService.hide();
            this.gpi.promocode = {};
            this.gpi.orderId = res.data.id;
            localStorage.removeItem("store-detail");
            this.presentModal();
          }
        },
        (err) => {
          this.err = err.error.errors;
          // this.util.dismissLoader();
          this.spinnerService.hide();
        }
      );
    }
  }

  payWithRazor(rdata) {
    var options = {
      description: "Credits towards consultation",
      image: "http://placehold.it/96x96.png",
      currency: this.currencyType,
      key: this.data.razorPublishKey,
      amount: this.gpi.info.toPay * 100,
      name: "Mapifood",

      theme: {
        color: "#94b92d",
      },
      modal: {
        ondismiss: function () {
          alert("dismissed");
        },
      },
    };

    var successCallback = (payment_id) => {
      rdata.payment_token = payment_id;
      rdata.payment_status = 1;
      rdata.payment_type = "RAZOR";

      // await this.util.startLoad();
      this.spinnerService.show();

      this.api.postDataWithToken("createGroceryOrder", rdata).subscribe(
        (res: any) => {
          if (res.success) {
            // this.util.dismissLoader();
            this.spinnerService.hide();
            this.gpi.promocode = {};
            this.gpi.orderId = res.data.id;
            this.presentModal();
          }
        },
       (err) => {
          this.err = err.error.errors;
          // this.util.dismissLoader();
          this.spinnerService.hide();
        }
      );
    };

    var cancelCallback = function (error) {
      alert(error.description + " (Error " + error.code + ")");
    };

    RazorpayCheckout.open(options, successCallback, cancelCallback);
  }

  paypalPay(rdata) {
    this.payPal

      .init({
        PayPalEnvironmentProduction: this.data.paypalProduction,
        PayPalEnvironmentSandbox: this.data.paypalSendbox,
      })

      .then(
        () => {
          this.payPal
            .prepareToRender(
              "PayPalEnvironmentSandbox",
              new PayPalConfiguration({})
            )
            .then(
              () => {
                let payment = new PayPalPayment(
                  this.gpi.info.toPay,
                  this.currencyType,
                  "Description",
                  "sale"
                );
                this.payPal.renderSinglePaymentUI(payment).then(
                  (result) => {
                    rdata.payment_token = result.response.id;
                    rdata.payment_status = 1;
                    rdata.payment_type = "PAYPAL";
                    
                    // await this.util.startLoad();
                    this.spinnerService.show();
                    this.api
                      .postDataWithToken("createGroceryOrder", rdata)
                      .subscribe(
                        (res: any) => {
                          if (res.success) {
                            // this.util.dismissLoader();
                            this.spinnerService.hide();
                            this.gpi.promocode = {};
                            this.gpi.orderId = res.data.id;
                            this.presentModal();
                          }
                        },
                        (err) => {
                          this.err = err.error.errors;
                          // this.util.dismissLoader();
                          this.spinnerService.hide();
                        }
                      );
                  },
                  (e) => {
                    console.log(e);
                  }
                );
              },
              (e) => {
                console.log(e);
              }
            );
        },
        (e) => {
          console.log(e);
          
        }
      );
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: GrocerySuccessPage,
      backdropDismiss: false,
      cssClass: "SuccessModal",
    });
    return await modal.present();
  }
}
