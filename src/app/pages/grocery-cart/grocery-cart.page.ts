import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from "@ionic-native/native-geocoder/ngx";
import { environment } from "./../../../environments/environment.prod";
import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { GroceryService } from "./../../service/grocery.service";
import { NavController, ModalController, IonSegment } from "@ionic/angular";
import { Component, OnInit, ViewChild, ElementRef, ViewChildren } from "@angular/core";
import { mapStyle } from "./../../../environments/environment.prod";
import { GrocerySuccessPage } from '../grocery-success/grocery-success.page';
import { NgxSpinnerService } from 'ngx-spinner';
import _ from "lodash";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: "app-grocery-cart",
  templateUrl: "./grocery-cart.page.html",
  styleUrls: ["./grocery-cart.page.scss"],
})
export class GroceryCartPage implements OnInit {
  event = "delivery";
  cartData: any = [];
  data: any = {};
  store: any = {};
  cuurecy: any;
  chaneAddress = false;
  icons: any = {};
  FindAddress: any;
  radius: any;
  charge: any;
  totalItem: any = 0;
  toPay: any = 0;
  agmMap: any = {};
  origin: any = {};
  destination: any = {};
  saving: any = 0;
  delivery_charge: any = 0;
  delivery_type: any;
  renderOptions = {
    suppressMarkers: true,
  };
  styles = mapStyle;
  markerOptions = {
    origin: {
      icon: "./assets/image/map_start.png",
    },
    destination: {
      icon: "./assets/image/map.png",
    },
    draggable: true,
  };

  // new
  payment_type: any = "LOCAL";
  err: any;
  datagroup = [];

  flagControl: boolean = false;
  @ViewChild('segment', { static: true }) segment: any;
  constructor(
    private nav: NavController,
    private gpi: GroceryService,
    private api: ApiService,
    private util: UtilService,
    private nativeGeocoder: NativeGeocoder,
    private modalController: ModalController,
    private spinnerService: NgxSpinnerService,
    private translate: TranslateService,

  ) {

    this.flagControl = true;
    this.cuurecy = this.api.currency;
    this.cartData = this.gpi.cartData;
    this.data = JSON.parse(localStorage.getItem("store-detail"));

    // this.data.forEach((element) => {
    //   this.totalItem += element.sell_price * element.qty;
    // });

    // this.toPay = this.totalItem + (this.store.delivery_charge || 0) - (this.data.discount || 0);

    // this.data.toPay = this.toPay;

    // this.util.startLoad();
    this.spinnerService.show();
    console.log(this.gpi.storeID);
    
    if (this.gpi.storeID != undefined) {
      this.api
      .getDataWithToken("groceryShopDetail/" + this.gpi.storeID)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.store = res.data;
            
            this.mapData();
            this.flagControl = false;
            this.getOrdersGrocerys('113');
            
            // this.charge = this.store.delivery_charge;

            // if (this.store.delivery_type == "Shop") {
            //   this.event = "pickup";
            //   this.store.delivery_charge = 0;

            // } else if (this.store.delivery_type == "Home") {
            //   this.event = "delivery";
            // } else {
            //   this.event = "delivery";
            // }

            // this.toPay = this.totalItem + (this.store.delivery_charge || 0) - (this.data.discount || 0);
            // this.data.toPay = this.toPay;

            // this.api
            //   .getDataWithToken(
            //     "getAddress/" + localStorage.getItem("isaddress")
            //   )
            //   .subscribe(
            //     (res: any) => {
            //       if (res.success) {
            //         this.spinnerService.hide();
            //         // this.util.dismissLoader();
            //         this.data.Deafult_address = res.data;
            //         this.mapData();
            //         this.data.userlat = res.data.lat;
            //         this.data.userlang = res.data.lang;
            //       }
            //     },
            //     (err) => {
            //       // this.util.dismissLoader();
            //       this.spinnerService.hide();
            //     }
            //   );
          }
        },
        (err) => {
          // this.util.dismissLoader();
          this.spinnerService.hide();
        });

    } else {
      this.mapData();
      this.flagControl = false;
      this.getOrdersGrocerys('113');
    }

  }

  ionViewWillEnter() {
    if (this.gpi.promocode) {
      this.countDiscount();
    }

    // if (this.chaneAddress) {
    //   this.util.startLoad();
    //   this.api
    //     .getDataWithToken("getAddress/" + localStorage.getItem("isaddress"))
    //     .subscribe(
    //       (res: any) => {
    //         if (res.success) {
    //           this.data.Deafult_address = res.data;
    //           this.mapData();
    //         }
    //         // this.util.dismissLoader();
    //         this.spinnerService.hide();
    //       },
    //       (err) => {
    //         // this.util.dismissLoader();
    //         this.spinnerService.hide();
    //       }
    //     );
    // }
  }

  initMap() { }

  ngOnInit() {
    // setTimeout(() => {
    //   console.log(this.segment);
    // }, 100);
  }

  paymentMethod() {

    if (this.datagroup.length) {

      if (this.event == "delivery") {
        this.delivery_type = "Home";

      } else {
        this.delivery_type = "Shop";
      }

      if (this.delivery_type == "Home") {
        this.deliveryHome();

      } else {
        this.deliveryShop();
      }

    } else {
      this.gpi.promocode = {};
      this.nav.back();
    }
  }

  applyCoupon() {
    if (this.data.length) {
      this.nav.navigateForward("grocery-promocode");
    } else {
      this.nav.back();
    }
  }

  countDiscount() {
    if (this.gpi.promocode.type == "amount") {
      this.data.discount = this.gpi.promocode.discount;
    } else {
      this.data.discount = this.totalItem * this.gpi.promocode.discount;
      this.data.discount = this.data.discount / 100;
    }

    this.saving = this.data.discount;
    this.toPay = this.totalItem + this.store.delivery_charge - this.data.discount;
    this.data.toPay = this.toPay;
  }

  addtocart(item) {
    let count = 0;
    this.cartData = JSON.parse(localStorage.getItem("store-detail")) || [];

    if (this.cartData && this.cartData.length > 0) {

      for (const data of this.cartData) {

        if (data.id === item.id) {
          // new changes
          data.qty = data.qty + 1;
          data.total = data.qty * data.sell_price;
          localStorage.setItem("store-detail", JSON.stringify(this.cartData));

          this.totalItem += item.sell_price;
          item.total = item.sell_price * item.qty;

          if (this.gpi.promocode) {
            this.countDiscount();
          }

          this.toPay = this.totalItem + (this.store.delivery_charge || 0) - (this.data.discount || 0);
          this.data.toPay = this.toPay;

          if (!this.flagControl) {
            this.getOrdersGrocerys('287');
          }
        }
      }
    }

  }

  minusQty(item) {

    this.cartData = JSON.parse(localStorage.getItem("store-detail")) || [];

    if (this.cartData && this.cartData.length > 0) {
      if (item.qty > 1) {
        let equalIndex;

        for (const data of this.cartData) {
          if (data.id === item.id) {
            data.qty--;
            this.totalItem -= data.sell_price;
            this.toPay = this.totalItem + (this.store.delivery_charge || 0) - (this.data.discount || 0);
            this.data.toPay = this.toPay;
            item.total = data.qty * data.sell_price;
            localStorage.setItem("store-detail", JSON.stringify(this.cartData));

            if (!this.flagControl) {
              this.getOrdersGrocerys('313');
            }
          }
        }

      } else {

        let equalIndex;

        this.cartData.forEach((element, ind) => {
          if (element.id == item.id) {
            element.qty = 0;
            this.totalItem -= element.sell_price;
            element.total = element.qty * element.sell_price;
            this.toPay = this.totalItem + (this.store.delivery_charge || 0) - (this.data.discount || 0);
            this.data.toPay = this.toPay;
            this.cartData.splice(ind, 1);
            localStorage.setItem("store-detail", JSON.stringify(this.cartData));

            if (!this.flagControl) {
              this.getOrdersGrocerys('334');
            }

            if (this.gpi.promocode) {
              this.countDiscount();
            }
          }
        });

        if (this.cartData.length === 0) {
          localStorage.removeItem("store-detail");
          this.nav.navigateRoot("/home");
        }
      }
    }

  }

  distance(lat1, lon1, lat2, lon2, unit) {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      let radlat1 = (Math.PI * lat1) / 180;
      let radlat2 = (Math.PI * lat2) / 180;
      let theta = lon1 - lon2;
      let radtheta = (Math.PI * theta) / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") {
        dist = dist * 1.609344;
      }
      if (unit == "N") {
        dist = dist * 0.8684;
      }
      return dist;
    }
  }

  segmentChanged() {
    this.getOrdersGrocerys('380')

    // if (this.event == "pickup") {
    //   this.store.delivery_charge = 0;

    //   this.toPay = this.totalItem + (this.store.delivery_charge || 0) - (this.data.discount || 0);
    //   this.data.toPay = this.toPay;

    //   if (this.gpi.promocode) {
    //     this.countDiscount();
    //   }

    // } else {

    //   this.store.delivery_charge = this.charge;

    //   this.toPay = this.totalItem + (this.store.delivery_charge || 0) - (this.data.discount || 0);
    //   this.data.toPay = this.toPay;

    //   if (this.gpi.promocode) {
    //     this.countDiscount();
    //   }
    // }
  }

  mapData() {
    let dataTemporals = _.clone(JSON.parse(localStorage.getItem("store-detail")));
    // this.FindAddress = this.data.Deafult_address.soc_name + " " + this.data.Deafult_address.street + " " + this.data.Deafult_address.city;
    this.FindAddress = this.api.soc_name + " " + this.api.street + " " + this.api.city;
    // + " " + this.data.Deafult_address.zipcode;
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5,
    };

    this.nativeGeocoder
      .forwardGeocode(this.FindAddress, options)
      .then((result: NativeGeocoderResult[]) => {

        this.agmMap = {
          lat: parseFloat(result[0].latitude),
          lng: parseFloat(result[0].longitude),
        };
        this.destination = {
          lat: dataTemporals[0].shop_latitude,
          lng: dataTemporals[0].longitude,
          // lat: parseFloat(this.store.latitude),
          // lng: parseFloat(this.store.longitude),
        };
        this.origin = {
          lat: parseFloat(result[0].latitude),
          lng: parseFloat(result[0].longitude),
        };

        this.spinnerService.hide();
      })
      .catch((error: any) => {
        this.spinnerService.hide();
        console.log(error);
      });

    this.spinnerService.hide();
  }

  getOrdersGrocerys(text) {

    let datagroup = [];
    let dataTemporals = _.clone(JSON.parse(localStorage.getItem("store-detail")));

    for (const data of dataTemporals) {
      let dataTemporal = _.clone(dataTemporals);
      let shops = [];
      shops = dataTemporal.filter((shop) => {
        if ((data.add == undefined || !data.add) && shop.shop_id == data.shop_id && ((this.event == 'delivery' && shop.delivery_type != 'Shop') || (this.event == 'pickup' && shop.delivery_type == 'Shop'))) {
          return _.clone(shop);
        }
      });

      if (shops.length > 0) {
        let dataNew = {
          shop_id: shops[0].shop_id,
          shopName: shops[0].shopName,
          orders: shops
        }

        datagroup.push(dataNew);

        for (const data of dataTemporals) {
          if (data.shop_id === shops[0].shop_id) {
            data.add = true;
          }
        }
      }
    }

    this.datagroup = datagroup;
    this.getPay();
  }

  getPay() {

    let delivery_charge = 0;
    this.toPay = 0;
    this.totalItem = 0;

    if (this.event != "pickup") {

      this.datagroup.forEach((data) => {
        for (const order of data.orders) {
          this.totalItem += order.sell_price * order.qty;
        }

        delivery_charge = delivery_charge + data.orders[0].delivery_charge;
        data.delivery_charge = data.orders[0].delivery_charge;
      });
    }


    this.store.delivery_charge = (delivery_charge || 0);
    this.delivery_charge = (delivery_charge || 0);
    this.charge = this.store.delivery_charge;
    this.toPay = this.totalItem + (delivery_charge || 0) - (this.data.discount || 0);
    this.data.toPay = (this.toPay || 0);
    this.gpi.orders = this.datagroup;
    this.spinnerService.hide();
  }

  deliveryHome() {
    console.log(this.datagroup);

    for (const data of this.datagroup) {

      this.radius = this.distance(
        parseFloat(this.api.lat),
        parseFloat(this.api.lang),
        parseFloat(data.orders[0].shop_latitude),
        parseFloat(data.orders[0].shop_longitude),
        "k"
      );

      if (this.radius <= this.store.radius) {

        this.gpi.cartData = this.data;

        this.delivery_type = this.event;
        this.data.delivery_type = this.delivery_type;
        this.delivery_charge = this.store.delivery_charge;
        this.data.delivery_charge = this.delivery_charge;
        this.gpi.info = this.data;

      } else {
        this.gpi.cartData = this.data;

        this.delivery_type = this.event;
        this.data.delivery_type = this.delivery_type;
        this.delivery_charge = this.store.delivery_charge;
        this.data.delivery_charge = this.delivery_charge;
        this.gpi.info = this.data;
      }
    }

    this.nav.navigateForward("/pay-method");

  }

  deliveryShop() {

    this.gpi.cartData = this.data;

    this.data.delivery_type = this.event;
    this.delivery_charge = this.store.delivery_charge;
    this.data.delivery_charge = this.delivery_charge;
    this.gpi.info = this.data;

    this.nav.navigateForward("/pay-method");

  }
}
