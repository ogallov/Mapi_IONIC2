import { OneSignal } from "@ionic-native/onesignal/ngx";
import { UtilService } from "./service/util.service";
import { ApiService } from "./service/api.service";
import { Component } from "@angular/core";

import { Platform, NavController, ToastController, AlertController } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { menuController } from "@ionic/core";
import { Router } from "@angular/router";
import { IonRouterOutlet } from "@ionic/angular";
import { QueryList, ViewChildren } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  agmMap: any = {
    lat: '',
    lng: ''
  }

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  public appPages = [
    {
      title: "Home",
      url: "/home",
      icon: "assets/icon-image/Icon-home.svg",
    },
    {
      title: "Notification",
      url: "/notification",
      icon: "assets/icon-image/bell.svg",
    },
    {
      title: "Promo Code",
      url: "/promocode/menu",
      icon: "assets/icon-image/coupon.svg",
    },
    {
      title: "Invite Friends",
      url: "/invite-friends",
      icon: "assets/icon-image/invite-user.svg",
    },
    {
      title: "Order History",
      url: "/order-history",
      icon: "assets/icon-image/chef-hat.svg",
    },
    {
      title: "Grocery Order",
      url: "/grocery-history",
      icon: "assets/icon-image/Twotone.svg",
    },
  ];
  userData: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private ntrl: NavController,
    private api: ApiService,
    private util: UtilService,
    private oneSignal: OneSignal,
    private toastController: ToastController,
    private router: Router,
    private translate: TranslateService,
    private geolocation: Geolocation,
    private alertCtrl: AlertController,
  ) {
    // blocked console.log
    // console.log = function () {};

    this.geolocation.getCurrentPosition().then((resp: any) => {
      console.log(resp);
      this.agmMap.lat = resp.coords.latitude;
      this.agmMap.lng = resp.coords.longitude;
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    document.documentElement.dir = localStorage.getItem("app_language") == "ar" ? "rtl" : "ltr";

    this.translate.setDefaultLang(
      localStorage.getItem("app_language") ? localStorage.getItem("app_language") : "es"
    );

    this.api.getData("keySetting").subscribe((res: any) => {
      const script = document.createElement("script");
      script.src = "https://maps.googleapis.com/maps/api/js?key=" + res.data.map_key;
      document.head.appendChild(script);
    });

    this.initializeApp();
    this.backButtonEvent();

    this.util.isUpdateProfile.subscribe((isLogin) => {
      if (localStorage.getItem("token")) {
        this.api.getDataWithToken("userDetail").subscribe((res: any) => {
          if (res.success) {
            console.log(res);
            this.userData = res.data;

            if (res.data.address_id) {
              this.api.address_id = res.data.address_id;
            }
          }
        });
      }
    });
    if (localStorage.getItem("token")) {
      this.ntrl.navigateRoot("/home");
    } else {
      this.ntrl.navigateRoot("login");
    }
  }

  initializeApp() {

    this.platform.ready().then(() => {
      setTimeout(() => {
        this.splashScreen.hide();
        this.api.getData("keySetting").subscribe(
          (res: any) => {
            if (res.success) {
              console.log(res);

              this.api.currency = res.data.currency_symbol;
              this.api.currencyType = res.data.currency;
              this.api.request_duration = res.data.request_duration;

              if (this.platform.is("cordova")) {

                // this.oneSignal.startInit(
                //   res.data.onesignal_app_id,
                //   res.data.onesignal_project_number
                // );

                // this.oneSignal
                //   .getIds()
                //   .then((ids) => (this.api.deviceToken = ids.userId));
                // this.oneSignal.endInit();

                this.setupPush(res);

              } else {
                this.api.deviceToken = null;
              }
            }
          },
          (err) => { }
        );
      }, 200);
    });
  }

  logout() {
    menuController.close();
    localStorage.removeItem("token");
    localStorage.removeItem("isaddress");
    localStorage.removeItem("isaddressBD");
    localStorage.removeItem("payment_type");
    localStorage.removeItem("store-detail");
    this.ntrl.navigateRoot(["login"]);
  }

  close() {
    menuController.close();
  }

  profile() {
    menuController.close();
    this.ntrl.navigateForward(["profile"]);
  }

  Setting() {
    menuController.close();
    this.ntrl.navigateForward("/profile/setting");
  }

  backButtonEvent() {
    this.platform.backButton.subscribe(async () => {
      this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
        if (outlet && outlet.canGoBack()) {
          outlet.pop();
        } else if (
          this.router.url === "/home" ||
          this.router.url === "/login" ||
          this.router.url === "/notification" ||
          this.router.url === "/promocode/menu" ||
          this.router.url === "/invite-friends" ||
          this.router.url === "/order-history" ||
          this.router.url === "/profile" ||
          this.router.url === "/login"
        ) {
          if (
            new Date().getTime() - this.lastTimeBackPress <
            this.timePeriodToExit
          ) {
            navigator["app"].exitApp();
          } else {
            this.showToast();
            this.lastTimeBackPress = new Date().getTime();
          }
        }
      });
    });
  }

  async showToast() {
    const toast = await this.toastController.create({
      message: "press back again to exit App.",
      duration: 1500,
    });
    toast.present();
  }

  setupPush(res: any) {
    // I recommend to put these into your environment.ts
    this.oneSignal.startInit(
      res.data.onesignal_app_id,
      res.data.onesignal_project_number
    );

    this.oneSignal
      .getIds()
      .then((ids) =>{
        this.api.deviceToken = ids.userId;
      });
    this.oneSignal.endInit();

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);

    // Notifcation was received in general
    this.oneSignal.handleNotificationReceived().subscribe(data => {
      console.log(data);
      
      let msg = data.payload.body;
      let title = data.payload.title;
      let additionalData = data.payload.additionalData;

      setTimeout(() => {
      // this.showAlert(title, msg, additionalData.task);
      this.showAlert(title, msg);
      }, 3000);

    });

    // Notification was really clicked/opened
    this.oneSignal.handleNotificationOpened().subscribe(data => {
      console.log(data);
      // Just a note that the data is a different place here!
      let additionalData = data.notification.payload.additionalData;

      setTimeout(() => {
        this.showAlert('Notification opened', 'You already read this before');
        // this.showAlert('Notification opened', 'You already read this before', additionalData.task);
      }, 3000);

    });

    this.oneSignal.endInit();
  }

  // async showAlert(title, msg, task) {
    async showAlert(title, msg) {
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: msg,
      buttons: [
        {
          text: 'Ok',
          // text: `Action: ${task}`,
          handler: () => {
            // E.g: Navigate to a specific screen
          }
        }
      ]
    })
    alert.present();
  }
}
