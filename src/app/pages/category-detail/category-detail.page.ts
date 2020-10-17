import { GroceryService } from "./../../service/grocery.service";
import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { Component, OnInit } from "@angular/core";
import { NavController } from "@ionic/angular";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: "app-category-detail",
  templateUrl: "./category-detail.page.html",
  styleUrls: ["./category-detail.page.scss"],
})
export class CategoryDetailPage implements OnInit {
  trending = [
    {
      name: "Real Fruit Juice ,Litchi, (Pack of 2)",
      img: "./assets/image/real_juice.png",
      qty: "1Ltr",
      price: "$15.50",
    },
    {
      name: "Real Fruit Juice ,Litchi, (Pack of 2)",
      img: "./assets/image/real_juice.png",
      qty: "1Ltr",
      price: "$15.50",
    },
    {
      name: "Real Fruit Juice ,Litchi, (Pack of 2)",
      img: "./assets/image/real_juice.png",
      qty: "1Ltr",
      price: "$15.50",
    },
  ];

  data: any = [];
  err: any = {};
  cartData: any = [];
  currency: any;
  term = "";

  constructor(
    private api: ApiService,
    private util: UtilService,
    private gpi: GroceryService,
    private nav: NavController,
    private spinnerService: NgxSpinnerService,

  ) {
    this.currency = this.api.currency;
  }

  ionViewWillEnter() {

    // await this.util.startLoad();
    this.spinnerService.show();

    this.api.getDataWithToken("grocerySubCategory/" + this.gpi.catId).subscribe(
      (res: any) => {
        console.log(res.data);
        // this.util.dismissLoader();
        this.spinnerService.hide();
        this.data = res.data;
        console.log(this.data);
        this.cartData = JSON.parse(localStorage.getItem("store-detail")) || [];
        this.getdata();
        console.log(this.data);
      },
      (err) => {
        console.log(err);
        // this.util.dismissLoader();
        this.spinnerService.hide();
      }
    );

  }
  ngOnInit() { }

  getdata() {

    if (this.cartData && this.cartData.length > 0) {
      this.data.forEach((el1) => {
        const fCart = this.cartData.find((x) => x.id == el1.id);
        if (fCart) {
          el1.qty = fCart.qty;
        } else {
          el1.qty = 0;
        }
      });
    } else {
      this.data.product.forEach((el1) => {
        el1.qty = 0;
      });
    }

    if (this.cartData && this.cartData.length > 0) {
      if (this.data) {
        this.data.forEach((el1) => {
          el1.items.forEach((item) => {
            item.qty = 0;
            const fCart = this.cartData.find((x) => x.id == item.id);
            if (fCart) {
              item.qty = fCart.qty;
            }
          });
        });
      }
    } else {
      this.data.forEach((el1) => {
        el1.items.forEach((item) => {
          item.qty = 0;
        });
      });
    }


  }

  AddCart(item) {

    console.log(item);
    
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

  cart() {
    if (this.cartData.length == 0) {
      this.util.presentToast("cart is empty");
    } else {
      this.gpi.cartData = this.cartData;
      this.nav.navigateForward("/grocery-cart");
    }
  }
}
