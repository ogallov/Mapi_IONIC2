import { UtilService } from "./../../service/util.service";
import { ApiService } from "./../../service/api.service";
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { NavController, ModalController } from "@ionic/angular";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { NativeGeocoder } from "@ionic-native/native-geocoder/ngx";
import { TranslateService } from "@ngx-translate/core";
import { SuccessModalPage } from '../success-modal/success-modal.page';
declare var google: any;
@Component({
  selector: "app-cart",
  templateUrl: "./cart.page.html",
  styleUrls: ["./cart.page.scss"],
})
export class CartPage implements OnInit {
  @ViewChild("map", { static: true }) mapElement: ElementRef;
  map: any;
  avtiveSegment: any = "About";
  icons: any = {};
  data: any = {};
  userlat: any;
  userlang: any;
  cartData: any = [];
  totalPrice: any = 0;
  totalItem: any = 0;
  chaneAddress = false;
  dirService = new google.maps.DirectionsService();
  dirRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
  FindAddress: any;
  currency: any;
  geocoder = new google.maps.Geocoder();
  radius: any;
  err: any;

  constructor(
    private ntrl: NavController,
    private api: ApiService,
    private util: UtilService,
    private translate: TranslateService,
    private modalController: ModalController,
  ) {
    this.currency = this.api.currency;
    this.data = this.api.cartData;
    this.data.cartData = this.api.cartData.cartDetail;
    this.data.discount = 0;
    this.data.saving = this.data.discount;
    this.data.cartData.forEach((element) => {
      this.totalItem += element.price * element.qty;
    });

    this.data.toPay =
      this.totalItem +
      this.data.rastaurant_charge +
      this.data.delivery_charge -
      this.data.discount;
    this.api
      .getDataWithToken("getAddress/" + localStorage.getItem("isaddress"))
      .subscribe((res: any) => {
        if (res.success) {
          this.data.Deafult_address = res.data;
          this.userlat = res.data.lat;
          this.userlang = res.data.lang;
        }
      });
  }

  ionViewWillEnter() {
    if (this.api.promocode.id) {
      this.countDiscount();
    }
    if (this.chaneAddress) {
      this.util.startLoad();
      this.api
        .getDataWithToken("getAddress/" + localStorage.getItem("isaddress"))
        .subscribe((res: any) => {
          if (res.success) {
            this.data.Deafult_address = res.data;
          }
        });
    }
  }

  initMap() {
    this.FindAddress =
      this.data.Deafult_address.soc_name +
      " " +
      this.data.Deafult_address.street +
      " " +
      this.data.Deafult_address.city +
      " " +
      this.data.Deafult_address.zipcode;

    this.geocoder.geocode({ address: this.FindAddress }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        var styledMapType = new google.maps.StyledMapType(
          [
            {
              elementType: "geometry",
              stylers: [
                {
                  color: "#f5f5f5",
                },
              ],
            },
            {
              elementType: "labels.icon",
              stylers: [
                {
                  visibility: "off",
                },
              ],
            },
            {
              elementType: "labels.text.fill",
              stylers: [
                {
                  color: "#616161",
                },
              ],
            },
            {
              elementType: "labels.text.stroke",
              stylers: [
                {
                  color: "#f5f5f5",
                },
              ],
            },
            {
              featureType: "administrative.land_parcel",
              elementType: "labels.text.fill",
              stylers: [
                {
                  color: "#bdbdbd",
                },
              ],
            },
            {
              featureType: "poi",
              elementType: "geometry",
              stylers: [
                {
                  color: "#eeeeee",
                },
              ],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [
                {
                  color: "#757575",
                },
              ],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [
                {
                  color: "#e5e5e5",
                },
              ],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [
                {
                  color: "#9e9e9e",
                },
              ],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [
                {
                  color: "#ffffff",
                },
              ],
            },
            {
              featureType: "road.arterial",
              elementType: "labels.text.fill",
              stylers: [
                {
                  color: "#757575",
                },
              ],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [
                {
                  color: "#dadada",
                },
              ],
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [
                {
                  color: "#616161",
                },
              ],
            },
            {
              featureType: "road.local",
              elementType: "labels.text.fill",
              stylers: [
                {
                  color: "#9e9e9e",
                },
              ],
            },
            {
              featureType: "transit.line",
              elementType: "geometry",
              stylers: [
                {
                  color: "#e5e5e5",
                },
              ],
            },
            {
              featureType: "transit.station",
              elementType: "geometry",
              stylers: [
                {
                  color: "#eeeeee",
                },
              ],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [
                {
                  color: "#c9c9c9",
                },
              ],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [
                {
                  color: "#9e9e9e",
                },
              ],
            },
          ],
          { name: "Styled Map" }
        );
        let mapoption = {
          center: new google.maps.LatLng(
            results[0].geometry.location.lat(),
            results[0].geometry.location.lng()
          ),
          zoom: 15,
          streetViewControl: false,
          disableDefaultUI: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
        this.map = new google.maps.Map(
          this.mapElement.nativeElement,
          mapoption
        );
        this.map.mapTypes.set("styled_map", styledMapType);
        this.map.setMapTypeId("styled_map");
        var icons = {
          start: new google.maps.MarkerImage(
            "./assets/image/map_start.png",
            new google.maps.Size(40, 33),
            new google.maps.Point(0, 0),
            new google.maps.Point(0, 10)
          ),
          end: new google.maps.MarkerImage(
            "./assets/image/map.png",
            new google.maps.Size(40, 33),
            new google.maps.Point(0, 0),
            new google.maps.Point(0, 10)
          ),
        };
        let a =
          results[0].geometry.location.lat() +
          "," +
          results[0].geometry.location.lng();
        let b = this.data.latitude + "," + this.data.longitude;
        this.dirRenderer.setMap(this.map);
        var request = {
          origin: a,
          destination: b,
          travelMode: google.maps.TravelMode.DRIVING,
        };
        this.dirService.route(request, (result, status) => {
          if (status == google.maps.DirectionsStatus.OK) {
            var leg = result.routes[0].legs[0];
            this.icons.start = new google.maps.Marker({
              position: leg.start_location,
              map: this.map,
              icon: icons.start,
              title: "title",
            });

            this.icons.end = new google.maps.Marker({
              position: leg.end_location,
              map: this.map,
              icon: icons.end,
              title: "title",
            });

            this.dirRenderer.setDirections(result);
          }
        });
      }
    });
  }

  ngOnInit() {
    if (this.avtiveSegment == "About") setTimeout(() => this.initMap(), 1000);
  }

  payment_method() {
    if (this.data.cartData.length) {
      this.radius = this.distance(
        this.userlat,
        this.userlang,
        this.data.latitude,
        this.data.longitude,
        "k"
      );
      if (this.radius <= this.data.radius) {
        // this.ntrl.navigateForward(["payment-method"]);
        
        // new
        this.paymentMethod();

      } else {
        this.translate.get("toasts").subscribe(async (val) => {
          this.util.presentToast(val.order_is_out_range);
        });
      }
    } else {
      this.api.promocode = {};
      this.ntrl.back();
    }
  }

  back() {
    this.ntrl.back();
  }

  addtocart(item) {
    item.qty++;
    this.totalItem += item.price;
    item.total = item.price * item.qty;
    if (this.api.promocode.discount) {
      this.countDiscount();
    }
    this.data.toPay =
      this.totalItem +
      this.data.rastaurant_charge +
      this.data.delivery_charge -
      this.data.discount;
  }

  minusQty(item) {
    if (item.qty != 1) {
      item.qty--;
      this.totalItem -= item.price;
      this.data.toPay =
        this.totalItem +
        this.data.rastaurant_charge +
        this.data.delivery_charge -
        this.data.discount;
    } else {
      let equalIndex;
      let equalType;
      this.data.cartData.forEach((element, ind) => {
        if (element.id == item.id && element.type == item.type) {
          equalIndex = ind;
          equalType = item.type;
        }
      });

      if (equalIndex >= 0 && equalType) {
        if (item.qty == 1) {
          item.qty = 0;
          this.data.cartData.splice(equalIndex, 1);
          this.totalItem -= item.price;
          item.total = item.qty * item.price;
          this.data.toPay =
            this.totalItem +
            this.data.rastaurant_charge +
            this.data.delivery_charge -
            this.data.discount;
        } else {
          this.data.cartData[equalIndex] = item;
          item.total = item.qty * item.price;
          this.data.toPay =
            this.totalItem +
            this.data.rastaurant_charge +
            this.data.delivery_charge -
            this.data.discount;
        }
      }
    }

    if (this.api.promocode.discount) {
      this.countDiscount();
    }
  }

  getCartdata() { }

  ionViewWillLeave() {
    this.api.cartData.cartDetail = this.data.cartData;
    if (this.data.cartData.length) {
    } else {
      this.api.promocode = {};
    }
  }

  applyCoupon() {
    if (this.data.cartData.length) {
      this.ntrl.navigateForward("/promocode/" + this.api.detailId);
    } else {
      this.ntrl.back();
    }
  }

  countDiscount() {
    console.log("promocde", this.api.promocode);
    if (this.api.promocode.type == "amount") {
      this.data.discount = this.api.promocode.discount;
      this.data.saving = this.data.discount;
      this.data.toPay =
        this.totalItem +
        this.data.rastaurant_charge +
        this.data.delivery_charge -
        this.data.discount;
    } else {
      this.data.discount = this.totalItem * this.api.promocode.discount;
      this.data.discount = this.data.discount / 100;
      this.data.saving = this.data.discount;
      this.data.toPay =
        this.totalItem +
        this.data.rastaurant_charge +
        this.data.delivery_charge -
        this.data.discount;
    }
  }

  change_Address() {
    this.chaneAddress = true;
    this.ntrl.navigateForward("/select-address");
  }

  distance(lat1, lon1, lat2, lon2, unit) {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      let radlat1 = (Math.PI * lat1) / 180;
      let radlat2 = (Math.PI * lat2) / 180;
      let theta = lon1 - lon2;
      let radtheta = (Math.PI * theta) / 180;
      let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
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

  // <======================================  new  ==============================================>

  paymentMethod() {

    this.data.items = [];
    this.data.package_id = [];
    this.data.itemData = [];
    this.data.shopName = this.api.cartData.name;
    this.data.shop_id = this.api.cartData.id;
    this.data.payment = this.api.cartData.toPay;
    this.data.discount = this.api.cartData.discount;
    this.data.shop_charge = this.api.cartData.rastaurant_charge;
    this.data.delivery_charge = this.api.cartData.delivery_charge;
    this.data.coupon_price = this.api.cartData.discount;
    this.data.coupon_id = this.api.promocode.id;

    if (typeof this.data.items == "string") {
      this.data.items = [];
      this.data.package_id = [];
    }
    this.api.cartData.cartData.forEach(element => {
      if (element.type == "combo") {
        this.data.package_id.push(element.id);
        let pusher: any = {
          item: "",
          price: element.total,
          quantity: element.qty,
          package_id: element.id
        };
        this.data.itemData.push(pusher);
      } else {
        this.data.items.push(element.id);
        let pusher: any = {
          item: element.id,
          price: element.total,
          quantity: element.qty,
          package_id: ""
        };
        this.data.itemData.push(pusher);
      }
    });
    this.data.items = this.data.items.join();
    this.data.package_id = this.data.package_id.join();

    // if (this.online) {
    //   localStorage.setItem("payment_type", "online");
    //   if (this.razorPayment) {
    //     this.payWithRazor();
    //   } else {
    //     if (this.currencyType == "INR") {
    //       this.translate.get('toasts').subscribe(async val => {
    //         this.util.presentToast(val.payment_not_possible);
    //       })
    //     } else {
    //       this.paypalPay();
    //     }
    //   }
    // } else {
    localStorage.setItem("payment_type", "cash");

    this.data.payment_status = 0;
    this.data.payment_type = "LOCAL";

    this.util.startLoad();
    this.api.postDataWithToken("createOrder", this.data).subscribe(
      (res: any) => {
        if (res.success) {
          this.api.promocode = {};
          this.util.dismissLoader();
          this.api.checkOrderStatus = res.data.id;
          this.presentModal();
        }
      },
      err => {
        this.err = err.error.errors;
        this.util.dismissLoader();
      }
    );
    // }
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: SuccessModalPage,
      backdropDismiss: false,
      cssClass: "SuccessModal"
    });
    return await modal.present();
  }
}
