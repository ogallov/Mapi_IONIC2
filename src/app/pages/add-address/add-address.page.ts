import { element } from "protractor";
import { UtilService } from "./../../service/util.service";
import { Component, OnInit } from "@angular/core";
import { ModalController, ToastController } from "@ionic/angular";
import { ApiService } from "./../../service/api.service";
import {
  NativeGeocoder,
  NativeGeocoderOptions,
  NativeGeocoderResult
} from "@ionic-native/native-geocoder/ngx";
import { type } from "os";
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
declare var google;

@Component({
  selector: "app-add-address",
  templateUrl: "./add-address.page.html",
  styleUrls: ["./add-address.page.scss"]
})

export class AddAddressPage implements OnInit {
  addressData: any = {};
  isEdit: boolean = false;
  err: any = {};
  ischange = false;
  addressType: any = [
    { value: 'add_edit_address_page.home', name: 'Home', checked: true },
    { value: 'add_edit_address_page.office', name: 'Office', checked: false },
    { value: 'add_edit_address_page.other', name: 'Other', checked: false }
  ];
  geocoder = new google.maps.Geocoder();
  Centerlat = 22.308155;
  Centerlng = 70.800705;
  agmMap: any = {
    lat: '',
    lng: ''
  }
  map: any;
  TCenterlat: any;
  TCenterlng: any;

  flagControl: boolean = false;

  constructor(
    private modalController: ModalController,
    private api: ApiService,
    private util: UtilService,
    private geolocation: Geolocation,
    private translate: TranslateService,
    private spinnerService: NgxSpinnerService,
    private toastController: ToastController,

  ) {

    // open spinner
    this.spinnerService.show();

    this.geolocation.getCurrentPosition().then((resp: any) => {
      console.log(resp);
      this.agmMap.lat = resp.coords.latitude;
      this.agmMap.lng = resp.coords.longitude;
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    if (this.api.parseData && this.api.parseData.action) {
      this.isEdit = true;
      this.addressData = this.api.parseData;

      this.Centerlat = parseFloat(this.addressData.lat);
      this.Centerlng = parseFloat(this.addressData.lang);
      this.TCenterlat = parseFloat(this.addressData.lat);
      this.TCenterlng = parseFloat(this.addressData.lang);

      this.addressType.forEach(element => {
        if (this.addressData.address_type === element.name) {
          element.checked = true;
        } else {
          element.checked = false;
        }
      });

    } else {

      this.geolocation.getCurrentPosition().then((resp: any) => {
        console.log(resp);
        this.TCenterlat = resp.coords.latitude;
        this.TCenterlng = resp.coords.longitude;
      }).catch((error) => {
        console.log('Error getting location', error);
      });
    }

    // open spinner
    this.spinnerService.hide();
  }

  ngOnInit() { }

  setAddressType(type) {
    this.addressType.forEach(element => {
      element.checked = false;
    });
    type.checked = true;
  }

  closeModal() {
    this.isEdit = false;
    this.api.parseData = {};
    this.modalController.dismiss();
  }

  saveAddress() {

    if (this.isEdit == true) {

      this.addressType.forEach(element => {
        console.log(element);

        if (element.checked) {
          this.addressData.address_type = element.name;
        }
      });

      this.addressData.address_id = this.addressData.id;

      // await this.util.startLoad();
      this.spinnerService.show();
      this.addressData.lat = this.TCenterlat;
      this.addressData.lang = this.TCenterlng;
      this.api
        .postDataWithToken("editAddress", this.addressData)
        .subscribe(
          (res: any) => {
            console.log(res);

            if (res.success) {
              this.spinnerService.hide();
              // this.util.dismissLoader();
              this.translate.get('toasts').subscribe(async val => {
                this.util.presentToast(val.address_update);
              })
              this.api.parseData = {};
              this.ischange == true;
              this.modalController.dismiss(this.ischange);
            }
          },
          async (err) => {
            // this.util.dismissLoader();
            this.spinnerService.hide();
            this.err = err.error.errors;

            if (this.err['lat'] || this.err['lang']) {
              await this.showToast()
            }
          }
        );

    } else {

      this.flagControl = true;

      this.addressType.forEach(element => {
        if (element.checked) {
          this.addressData.address_type = element.name;
        }
      });

      this.spinnerService.show();
      // await this.util.startLoad();
      this.addressData.lat = this.TCenterlat;
      this.addressData.lang = this.TCenterlng;

      this.api.postDataWithToken("addAddress", this.addressData).subscribe(
        (res: any) => {
          if (res.success) {
            this.spinnerService.hide();
            // this.util.dismissLoader();

            if (localStorage.getItem("isaddress") == "false") {
              localStorage.setItem("isaddress", res.data.id);
            }

            this.isEdit = false;
            this.api.parseData = {};
            this.ischange = true;
            this.modalController.dismiss(this.ischange);
            this.flagControl = false;
          }
        },
        async (err) => {
          // this.util.dismissLoader();
          this.spinnerService.hide();
          this.err = err.error.errors;

          if (this.err['lat'] || this.err['lang']) {
            await this.showToast()
          }
          this.flagControl = false;
        }
      );
    }
  }

  centerChange($event) {
    this.TCenterlat = $event.coords.lat;
    this.TCenterlng = $event.coords.lng;
  }

  async showToast() {

    this.translate.get('add_edit_address_page.you_must_allow_access_to_your_location').subscribe(async (value) => {
      let message = value;
      const toast = await this.toastController.create({
        message: message,
        duration: 1500,
      });
      toast.present();
    });
  }
}
