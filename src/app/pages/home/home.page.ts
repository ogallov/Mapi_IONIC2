import { GroceryService } from "./../../service/grocery.service";
import { UtilService } from "../../service/util.service";
import { ApiService } from "../../service/api.service";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import * as moment from "moment";
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from "@ionic-native/native-geocoder/ngx";
import { ModalController, NavController, MenuController, AlertController } from "@ionic/angular";
import { FilterPage } from "../filter/filter.page";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { NgxSpinnerService } from 'ngx-spinner';
import _ from "lodash";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})

export class HomePage implements OnInit {

  // string
  term: string = '';

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

  totalCategoriesItems = 0;

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
  groceryTemporal: any = {};
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
    private alertController: AlertController,
    private translate: TranslateService,
    private cd: ChangeDetectorRef,

  ) {
    this.menu.enable(true);
    this.api.filter = 'All';
    this.api.isfood = true;
  }

  async ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    if (!this.api.address_type || this.api.address_type === undefined || this.api.address_type === '') {
      await this.AlertConfirmGeolocation();

      this.spinnerService.show();

      this.flagControl = true;

      this.api.getData("keySetting").subscribe(
        async (res: any) => {
          this.sellProduct = res.data.sell_product;
          this.api.sell_product = res.data.sell_product;

          if (this.sellProduct == 2) {
            this.isfood = false;
            this.api.isfood = false;
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

  }

  private async initData() {

    this.spinnerService.show();

    this.getAdvertisingBanner();

    this.api.getDataWithToken("home").subscribe(
      async (res: any) => {
        if (res.success) {
          this.dataTemporal = res.data;
          this.api.restaurantsAll = _.clone(this.dataTemporal);
          this.data = _.clone(res.data);
          this.currency = this.api.currency;

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

      if (res.success) {
        this.banners = res.data;
        this.api.banners = res.data;
      }
    }, error => {
      console.log(error);
      this.spinnerService.hide();
    });
  }

  async ionViewWillEnter() {

    if (this.api.address_id && !this.api.geolocation && localStorage.getItem('isaddressBD') === 'true') {
      await this.getAddressBD();
    }

    if (this.api.address_type && this.api.address_type !== undefined && this.api.address_type !== '') {
      console.log(this.api);

      this.sellProduct = this.api.sell_product;
      this.isfood = this.api.isfood;
      this.dataTemporal = this.api.restaurantsAll;
      this.totalCategoriesItems = this.api.totalCategoriesItems;
      this.data = this.api.restaurantsFilter;
      this.banners = this.api.banners;
      this.groceryTemporal = this.api.groceryAll;
      this.grocery = this.api.grocery;
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
            this.api.filter = _.clone(element.name);
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

        } else if (filetype == "All") {

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

          if (this.api.address_id && !this.api.geolocation) {

            this.api
              .getDataWithToken(
                "getAddress/" + this.api.address_id
              )
              .subscribe((res: any) => {
                if (res.success) {
                  this.address = res.data;
                  this.api.address = res.data.soc_name + " " + res.data.street + " " + res.data.city;
                  this.api.address_type = res.data.address_type;
                  this.api.lat = res.data.lat;
                  this.api.lang = res.data.lang;
                  this.api.city = res.data.city;
                  this.api.street = res.data.street;
                  this.api.soc_name = res.data.soc_name;
                  this.api.geolocation = false;

                  if (this.dataTemporal && this.grocery.category && this.groceryTemporal) {
                    this.filterRestaurants();
                  }

                  const options: NativeGeocoderOptions = {
                    useLocale: true,
                    maxResults: 5,
                  };

                  this.nativeGeocoder
                    .forwardGeocode(this.api.address, options)
                    .then((result: NativeGeocoderResult[]) => {

                      this.data.shop.forEach((element) => {
                        element.distance = this.distance(
                          parseFloat(result[0].latitude),
                          parseFloat(result[0].longitude),
                          parseFloat(element.latitude),
                          parseFloat(element.longitude),
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

          } else if (this.api.geolocation) {

            const options: NativeGeocoderOptions = {
              useLocale: true,
              maxResults: 5,
            };

            this.nativeGeocoder
              .forwardGeocode(this.userAddress, options)
              .then((result: NativeGeocoderResult[]) => {

                this.data.shop.forEach((element) => {
                  element.distance = this.distance(
                    parseFloat(result[0].latitude),
                    parseFloat(result[0].longitude),
                    parseFloat(element.latitude),
                    parseFloat(element.longitude),
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

    let shops = this.dataTemporal['shop'].filter((shop: any) => {

      let radius = this.distance(
        parseFloat(this.api.lat),
        parseFloat(this.api.lang),
        parseFloat(shop.latitude),
        parseFloat(shop.longitude),
        "k"
      );

      if (radius <= shop.radius) {
        var format = 'HH:mm a'
        var date = moment().format("HH:mm a");

        // var time = moment() gives you current time. no format required.
        var time = moment(date, format);
        var beforeTime = moment(shop.open_time, format);
        var afterTime = moment(shop.close_time, format);

        if (time.isBetween(beforeTime, afterTime)) {
          shop.open = true;
        } else {
          shop.open = false;
        }

        return _.clone(shop);
      }

    });

    let items = [];

    for (const shop of shops) {
      for (const item of this.dataTemporal['item']) {

        if (item.shop_id == shop.id) {
          items.push(_.clone(item));
        }
      }
    }

    let categories = [];

    for (const category of this.dataTemporal['category']) {
      let count = 0;

      for (const item of items) {
        if (item.category_id === category.id) {
          count = count + 1;
        }
      }

      if (count > 0) {
        let cat = _.clone(category);
        cat.totalItems = count;
        categories.push(cat);
        this.totalCategoriesItems = this.totalCategoriesItems + 1;
      }
    }

    let store = [];
    console.log(this.groceryTemporal);

    store = this.groceryTemporal.Store.filter((grocery: any) => {

      var format = 'HH:mm a'
      var date = moment().format("HH:mm a");

      // var time = moment() gives you current time. no format required.
      var time = moment(date, format);
      var beforeTime = moment(grocery.open_time, format);
      var afterTime = moment(grocery.close_time, format);

      if (time.isBetween(beforeTime, afterTime)) {
        grocery.open = true;
      } else {
        grocery.open = false;
      }

      return _.clone(grocery);

    });

    let coupons = [];

    for (const shop of shops) {
      for (const coupon of this.groceryTemporal.coupon) {
        if (coupon.shop_id == coupon.id) {
          items.push(_.clone(coupon));
        }
      }
    }

    // data filters
    this.data.shop = shops;
    this.data.item = items;
    this.data.category = categories;

    // grocery filters
    this.grocery.Store = store;
    this.grocery.coupon = coupons;
    console.log(this.grocery);
    // save api
    this.api.grocery = this.grocery;
    this.api.restaurantsFilter = this.data;
    this.api.totalCategoriesItems = this.totalCategoriesItems;

    if (this.dataTemporal) {
      this.spinnerService.hide();
    }

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
              if (res.success) {
                this.grocery.category = res.data;

                this.grocery.Store.forEach((element) => {
                  element.away = Number(
                    this.distance(
                      parseFloat(this.api.lat),
                      parseFloat(this.api.lang),
                      parseFloat(element.latitude),
                      parseFloat(element.longitude),
                      "K"
                    ).toFixed(2)
                  );
                });

                this.groceryTemporal = _.clone(this.grocery);
                this.api.grocery = this.grocery;
                this.api.groceryAll = _.clone(this.grocery);

                if (this.api.address_type && this.api.address_type !== undefined && this.api.address_type !== '') {
                  this.filterRestaurants();
                }

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

  async getAddressBD() {

    if (!this.api.address_id) {
      this.getAddressGeolocation();
    }

    this.flagControlWillEnter = true;
    this.spinnerService.show();
    this.api
      .getDataWithToken("getAddress/" + this.api.address_id)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.address = res.data;
            this.api.address = res.data;
            this.api.address_type = res.data.address_type;
            this.api.lat = res.data.lat;
            this.api.lang = res.data.lang;
            this.api.city = res.data.city;
            this.api.street = res.data.street;
            this.api.soc_name = res.data.soc_name;
            this.api.geolocation = false;
            // filter resturant por coordinate

            if (this.dataTemporal && this.grocery.category && this.groceryTemporal) {
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
  }

  getAddressGeolocation() {

    this.spinnerService.show();

    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        resp.coords.latitude;
        resp.coords.longitude;
        this.api.lat = (resp.coords.latitude).toString();
        this.api.lang = (resp.coords.longitude).toString();

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
            // save api
            this.api.address_type = "Current Location";
            this.api.soc_name = result[0].subLocality;
            this.api.street = result[0].thoroughfare;
            this.api.city = result[0].locality;
            this.api.zipcode = result[0].postalCode;
            this.api.geolocation = true;

            if (this.dataTemporal && this.grocery.category && this.groceryTemporal) {
              this.filterRestaurants();
            }

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

  async AlertConfirmGeolocation() {
    this.translate.get(["home_page.Do_you_want_the_application_to_take_your_current_location?", "home_page.no"]).subscribe(async (val) => {

      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        // header: 'Confirm!',
        message: val['home_page.Do_you_want_the_application_to_take_your_current_location?'],
        buttons: [
          {
            text: val['home_page.no'],
            role: 'cancel',
            cssClass: 'secondary',
            handler: async (blah) => {
              await this.getAddressBD();
            }
          }, {
            text: 'Ok',
            handler: () => {
              this.getAddressGeolocation();
            }
          }
        ]
      });

      await alert.present();
    }, error => {
      console.log(error);

    });
  }

  async AlertCancelGeolocation() {
    this.translate.get(["home_page.Do_you_want_the_application_to_stop_accessing_your_current_location?", "home_page.no"]).subscribe(async (val) => {

      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        // header: 'Confirm!',
        message: val['home_page.Do_you_want_the_application_to_stop_accessing_your_current_location?'],
        buttons: [
          {
            text: val['home_page.no'],
            role: 'cancel',
            cssClass: 'secondary',
            handler: async (blah) => {

            }
          }, {
            text: 'Ok',
            handler: async () => {
              await this.getAddressBD();
            }
          }
        ]
      });

      await alert.present();
    }, error => {
      console.log(error);

    });
  }

}
