import { GroceryService } from "./../../service/grocery.service";
import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { NavController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: "app-store-detail",
  templateUrl: "./store-detail.page.html",
  styleUrls: ["./store-detail.page.scss"],
})
export class StoreDetailPage implements OnInit {
  cartData: any = [];
  data: any = { product: [] };
  currency: any;
  term = "";
  dataa: any = [];
  state: any = 1;
  Store: any = [];
  id: any;

  // new
  latitude;
  longitude;
  delivery_charge;
  delivery_type;
  radius;

  constructor(
    private nav: NavController,
    private api: ApiService,
    private util: UtilService,
    private gpi: GroceryService,
    private spinnerService: NgxSpinnerService
  ) {
    this.currency = this.api.currency;

    this.dataa = JSON.parse(localStorage.getItem("store-detail"));

    // await this.util.startLoad();
    this.spinnerService.show();
    this.api
      .getDataWithToken("groceryShopDetail/" + this.gpi.storeID)
      .subscribe(
        (res: any) => {
          if (res.success) {
            console.log(res.data);
            this.data = res.data;
            this.latitude = res.data.latitude;
            this.longitude = res.data.longitude;
            this.delivery_charge = res.data.delivery_charge;
            this.delivery_type = res.data.delivery_type;
            this.radius = res.data.radius;

            this.api
              .getDataWithToken("groceryShopCategory/" + this.gpi.storeID)
              .subscribe(
                (res: any) => {
                  if (res.success) {
                    this.data.category = res.data;
                    this.api
                      .getDataWithToken("groceryItem/" + this.gpi.storeID)
                      .subscribe(
                        (res: any) => {
                          if (res.success) {
                            // this.util.dismissLoader();
                            this.spinnerService.hide();
                            this.data.product = res.data['item'];
                            this.id = res.data.id;

                            console.log(this.data);
                            console.log(this.data.product);

                            this.data.product.forEach((element) => {
                              element.qty = 0;
                              if (this.cartData && this.cartData.length > 0) {
                                const fCart = this.cartData.find(
                                  (x) => x.id == element.id
                                );
                                if (fCart) {
                                  element.qty = fCart.qty;
                                }
                              }
                            });
                            console.log(this.data.category);
                          }
                        },
                        (err) => {
                          // this.util.dismissLoader();
                          this.spinnerService.hide();
                        }
                      );
                  }
                },
                (err) => {
                  // this.util.dismissLoader();
                  this.spinnerService.hide();
                }
              );
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

  AddCart(item) {
    console.log(item);
    item.shop_latitude = this.latitude;
    item.shop_longitude = this.longitude;
    item.delivery_charge = this.delivery_charge;
    item.delivery_type = this.delivery_type;
    item.radius = this.radius;
    item.qty = item.qty + 1;
    item.total = item.qty * item.sell_price;
    this.cartData = JSON.parse(localStorage.getItem("store-detail")) || [];

    const fCart = this.cartData.find((x) => x.id == item.id);

    if (fCart) {
      fCart.qty = item.qty;
    } else {
      this.cartData.push(item);
    }
    localStorage.setItem("store-detail", JSON.stringify(this.cartData));
  }

  remove(item) {
    let equalIndex;

    if (item.qty == 0)
      return;

    item.qty = item.qty - 1;

    if (item.qty == 0) {
      const i = this.cartData.findIndex((x) => x.id == item.id);

      this.cartData.splice(i, 1);
    } else {
      item.total = item.qty * item.sell_price;
      this.cartData = JSON.parse(localStorage.getItem("store-detail")) || [];
      const fCart = this.cartData.find((x) => x.id == item.id);
      if (fCart) {
        fCart.qty = item.qty;
      }
    }

    localStorage.setItem("store-detail", JSON.stringify(this.cartData));
  }


  viewMore() {
    this.nav.navigateForward("product");
  }
  subcategory(id) {
    this.gpi.catId = id;
    this.nav.navigateForward("/category-detail");
  }

  cart() {
    if (this.cartData.length == 0) {
      this.util.presentToast("cart is empty");
    } else {
      this.gpi.cartData = this.cartData;
      this.nav.navigateForward("/grocery-cart");
    }
  }
  ionViewWillLeave() {
    this.gpi.cartData = this.cartData;
  }
  storeDetail(id) {
    this.gpi.itemId = id;
    this.nav.navigateForward("/product-detail");
  }
  ionViewWillEnter() {
    this.cartData = JSON.parse(localStorage.getItem("store-detail")) || [];

    if (this.cartData && this.cartData.length > 0) {
      if (this.data && this.data.product && this.data.product.length > 0) {
        this.data.product.forEach((el1) => {
          const fCart = this.cartData.find((x) => x.id == el1.id);
          if (fCart) {
            el1.qty = fCart.qty;
          } else {
            el1.qty = 0;
          }
        });
      }
    } else {

      if (this.data && this.data.produc && this.data.produc.length > 0) {
        this.data.product.forEach((el1) => {
          el1.qty = 0;
        });
      }
    }
  }

  logScrolling(ev) {
    if (ev.detail.scrollTop >= 100) {
      this.state = 2;
    } else {
      this.state = 1;
    }
  }
}
