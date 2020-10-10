import { GroceryService } from "./../../service/grocery.service";
import { UtilService } from "../../service/util.service";
import { ApiService } from "../../service/api.service";
import { Component } from "@angular/core";
import * as moment from "moment";
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from "@ionic-native/native-geocoder/ngx";
import { ModalController, NavController, MenuController } from "@ionic/angular";
import { FilterPage } from "../filter/filter.page";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { NgxSpinnerService } from 'ngx-spinner';
import _ from "lodash";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})

export class HomePage {

  // string
  term: string;

  // number
  sellProduct = 0;

  // boolean
  isfood = true;
  flagControl: boolean = false;
  flagControlWillEnter: boolean = false;

  // any
  userAddress: any = {};
  err: any = {};
  currentTime: any;

  staticData: any = {
    feature: [
      {
        image: "assets/image/diamond.svg",
        text: "Most Popular",
        type: "popular",
      },
      {
        image: "assets/image/near.svg",
        text: "Great Offers",
      },
      {
        image: "assets/image/express.svg",
        text: "Pure Veg Places",
        type: "pureveg",
      },
      {
        image: "assets/image/pocket.svg",
        text: "Pocket Friendly",
        type: "lowcost",
      },
      {
        image: "assets/image/shop.svg",
        text: "Nearest Me",
        type: "nearest",
      },
    ],
  };

  slideOpts: any = {
    slidesPerView: "auto",
    centeredSlides: true,
    centeredSlidesBounds: true,
    spaceBetween: 20,
    initialSlide: 1,
    autoplay: {
      delay: 3000,
    },

    slideNextClass: "swiper-slide-next",
    slidePrevClass: "swiper-slide-next",
    slideActiveClass: "swiper-slide-active",
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  };

  data: any;
  dataTemporal: any;
  grocery: any = {};
  btnType = "Exclusive";
  currency: any;
  Address: any;

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

  innerWidth: any = window.innerWidth;
  banners: any = Array();

  address: any;

  constructor(
    private menu: MenuController,
    private modalController: ModalController,
    private navCtrl: NavController,
    private nativeGeocoder: NativeGeocoder,
    private api: ApiService,
    private util: UtilService,
    private gpi: GroceryService,
    private geolocation: Geolocation,
    private spinnerService: NgxSpinnerService,
  ) {
    this.menu.enable(true);
    this.spinnerService.show();

    this.flagControl = true;
    this.api.getData("keySetting").subscribe(
      async (res: any) => {
        this.sellProduct = res.data.sell_product;

        if (this.sellProduct == 2) {
          this.isfood = false;
        }

        this.initData();
        // this.spinnerService.hide();
      },
      (err) => {
        console.log("err", err);
        this.spinnerService.hide();
        this.flagControl = false;
      });
  }

  private async initData() {

    this.spinnerService.show();

    this.getAdvertisingBanner();

    this.api.getDataWithToken("home").subscribe(
      async (res: any) => {
        if (res.success) {
          this.dataTemporal = res.data;
          this.data = _.clone(res.data);
          console.log(this.dataTemporal);

          this.currency = this.api.currency;

          if (this.address) {
            this.filterRestaurants();
          }

          this.getGrocery();
        }
      },
      (err) => {
        this.spinnerService.hide();
        this.err = err;
        this.flagControl = false;
      }
    );
  }

  async getAdvertisingBanner() {
    this.api.getData("banner").subscribe((res: any) => {
      console.log(res);

      if (res.success) {
        this.banners = res.data;
      }
    }, error => {
      console.log(error);
      this.spinnerService.hide();
    });
  }

  ionViewWillEnter() {

    if (localStorage.getItem("isaddress") != "false") {
      if (!this.userAddress.soc_name || localStorage.getItem('isaddressBD') === 'true') {
        this.flagControlWillEnter = true;
        this.spinnerService.show();
        this.api
          .getDataWithToken("getAddress/" + localStorage.getItem("isaddress"))
          .subscribe(
            (res: any) => {
              if (res.success) {
                console.log(res);
                this.address = res.data;
                this.userAddress = res.data;
                // filter resturant por coordinate

                if (this.dataTemporal) {
                  this.filterRestaurants();
                }

                localStorage.setItem("isaddressBD", "false");
                this.flagControlWillEnter = false;

                if (!this.flagControl && !this.flagControlWillEnter) {
                  this.spinnerService.hide();
                }
              }
            },
            (err) => {
              this.err = err;
              this.spinnerService.hide();
            }
          );

      } else {
        this.spinnerService.hide();
      }


    } else {
      this.spinnerService.show();

      this.geolocation
        .getCurrentPosition()
        .then((resp) => {

          resp.coords.latitude;
          resp.coords.longitude;
          this.userAddress.lat = resp.coords.latitude;
          this.userAddress.lang = resp.coords.longitude;

          const options: NativeGeocoderOptions = {
            useLocale: true,
            maxResults: 5,
          };

          this.nativeGeocoder
            .reverseGeocode(
              resp.coords.latitude,
              resp.coords.longitude,
              options
            )
            .then((result: NativeGeocoderResult[]) => {
              // this.util.dismissLoader();
              this.userAddress.address_type = "Current Location";
              this.userAddress.soc_name = result[0].subLocality;
              this.userAddress.street = result[0].thoroughfare;
              this.userAddress.city = result[0].locality;
              // this.userAddress.zipcode = result[0].postalCode;
              this.spinnerService.hide();
            })
            .catch((error: any) => {
              console.log(error);
              this.spinnerService.hide();
            });
        })
        .catch((error) => {
          // this.util.dismissLoader();
          console.log('Error getting location', error);
          this.spinnerService.hide();
        });

      this.spinnerService.hide();
    }
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: FilterPage,
      cssClass: "filterModal",
      backdropDismiss: true,
    });

    modal.onDidDismiss().then((res) => {
      if (res["data"] != undefined) {
        let filetype;
        res.data.forEach((element) => {
          if (element.checked == true) {
            filetype = element.name;
          }
        });

        if (filetype == "Cost High to Low") {
          this.data.shop.sort((a, b) => {
            if (a.avarage_plate_price > b.avarage_plate_price) {
              return -1;
            }
            if (a.avarage_plate_price < b.avarage_plate_price) {
              return 1;
            }
            return 0;
          });

        } else if (filetype == "Top Rated" || filetype == "Most Popular") {
          this.data.shop.sort((a, b) => {

            if (a.rate > b.rate) {
              return -1;
            }
            if (a.rate < b.rate) {
              return 1;
            }
            return 0;
          });

        } else if (filetype == "Cost Low to High") {
          this.data.shop.sort((a, b) => {
            if (a.avarage_plate_price < b.avarage_plate_price) {
              return -1;
            }
            if (a.avarage_plate_price > b.avarage_plate_price) {
              return 1;
            }
            return 0;
          });

        } else if (filetype == "Open Now") {
          this.currentTime = moment().format("HH:mm");
          this.data.shop = this.data.shop.filter((a) => {
            a.open_time = moment("2019-07-19 " + a.open_time).format("HH:mm");
            a.close_time = moment("2019-07-19 " + a.close_time).format("HH:mm");
            if (
              this.currentTime >= a.open_time &&
              this.currentTime <= a.close_time
            ) {
              return a;
            }
          });

        } else {

          if (localStorage.getItem("isaddress") != "false") {

            this.api
              .getDataWithToken(
                "getAddress/" + localStorage.getItem("isaddress")
              )
              .subscribe((res: any) => {
                if (res.success) {
                  console.log(res);
                  this.address = res.data;
                  this.Address = res.data.soc_name + " " + res.data.street + " " + res.data.city;
                  // + " " + res.data.zipcode;
                  // filter resturant por coordinate

                  if (this.dataTemporal) {
                    this.filterRestaurants();
                  }

                  const options: NativeGeocoderOptions = {
                    useLocale: true,
                    maxResults: 5,
                  };

                  this.nativeGeocoder
                    .forwardGeocode(this.Address, options)
                    .then((result: NativeGeocoderResult[]) => {
                      this.data.shop.forEach((element) => {
                        element.distance = this.distance(
                          result[0].latitude,
                          result[0].longitude,
                          element.latitude,
                          element.longitude,
                          "K"
                        );
                      });

                      this.data.shop.sort((a, b) => {
                        if (a.distance < b.distance) {
                          return -1;
                        }
                        if (a.distance > b.distance) {
                          return 1;
                        }
                      });
                    })
                    .catch((error: any) => {
                      console.log(error);
                      this.spinnerService.hide();
                    });
                }
              }, error => {
                console.log(error);
                this.spinnerService.hide();
              });

          } else {

            const options: NativeGeocoderOptions = {
              useLocale: true,
              maxResults: 5,
            };

            this.nativeGeocoder
              .forwardGeocode(this.userAddress, options)
              .then((result: NativeGeocoderResult[]) => {
                this.data.shop.forEach((element) => {
                  element.distance = this.distance(
                    result[0].latitude,
                    result[0].longitude,
                    element.latitude,
                    element.longitude,
                    "K"
                  );
                });

                this.data.shop.sort((a, b) => {
                  if (a.distance < b.distance) {
                    return -1;
                  }
                  if (a.distance > b.distance) {
                    return 1;
                  }
                });
              })
              .catch((error: any) => {
                console.log(error);
                this.spinnerService.hide();
              });
          }
        }
      }
    });

    return await modal.present();
  }

  detail() {
    this.navCtrl.navigateForward(["restaurant-detail"]);
  }

  resturantDetail(id) {
    this.api.detailId = id;
    this.navCtrl.navigateForward(["restaurant-detail"]);
  }

  distance(lat1, lon1, lat2, lon2, unit) {

    if (lat1 == lat2 && lon1 == lon2) {
      return 0;

    } else {
      const radlat1 = (Math.PI * lat1) / 180;
      const radlat2 = (Math.PI * lat2) / 180;
      const theta = lon1 - lon2;
      const radtheta = (Math.PI * theta) / 180;
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

  feature(type) {
    if (type) {
      this.api.filterType = type;
      this.navCtrl.navigateForward("/category");
    } else {
      this.navCtrl.navigateForward("/promocode/menu");
    }
  }

  categoryData(id) {
    this.navCtrl.navigateForward("/category/" + id);
  }

  filterRestaurants() {
    console.log('filter');
    this.data['shop'] = [];
    this.data['item'] = [];

    let shops = this.dataTemporal['shop'].filter((shop: any) => {

      let radius = this.distance(
        parseFloat(this.address.lat),
        parseFloat(this.address.lang),
        parseFloat(shop.latitude),
        parseFloat(shop.longitude),
        "k"
      );

      if (radius <= shop.radius) {
        return _.clone(shop);
      }

    });

    let items = [];
    for (const shop of shops) {
      for (const item of this.dataTemporal['item']) {
        if (item.shop_id == shop.id) {
          items.push(item);
        }
      }
    }

    this.data['item'] = _.clone(items);
    this.data['shop'] = _.clone(shops);

  }

  async getGrocery() {

    this.spinnerService.show();

    this.api.getDataWithToken("groceryShop").subscribe(
      (res: any) => {
        if (res.success) {
          this.grocery.Store = res.data.shop;
          this.grocery.coupon = res.data.coupon;

          this.api.getDataWithToken("groceryCategory").subscribe(
            async (res: any) => {
              console.log(res);
              if (res.success) {
                this.grocery.category = res.data;
                console.log(this.grocery.category);

                this.grocery.Store.forEach((element) => {
                  element.away = Number(
                    this.distance(
                      this.userAddress.lat,
                      this.userAddress.lang,
                      element.latitude,
                      element.longitude,
                      "K"
                    ).toFixed(2)
                  );
                });

                this.flagControl = false;
                this.spinnerService.hide();
              }
            },
            (err) => {
              this.spinnerService.hide();
              this.err = err;
              this.flagControl = false;
            }
          );
        }
      },
      (err) => {
        this.err = err;
      }
    );
  }

  storeList() {
    this.navCtrl.navigateForward("store");
  }

  storeDetail(id) {
    this.gpi.storeID = id;
    this.navCtrl.navigateForward("/store-detail");
  }

  subcategory(id) {
    this.gpi.catId = id;
    this.navCtrl.navigateForward("store");
  }

  getCategory() {
    this.navCtrl.navigateForward("/grocery-category");
  }
}
