import { element } from "protractor";
import { UtilService } from "./../../service/util.service";
import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
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
    { name: "Home", checked: true },
    { name: "Office", checked: false },
    { name: "Other", checked: false }
  ];
  geocoder = new google.maps.Geocoder();
  Centerlat = 22.308155;
  Centerlng = 70.800705;
  agmMap:any = {
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

  ) {

    this.geolocation.getCurrentPosition().then((res:any) => {
      this.agmMap.lat = res.coords.latitude;
      this.agmMap.lng = res.coords.longitude;
  
    }, () => {});
    
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

    }  else {
      this.geolocation.getCurrentPosition().then((res:any) => {
       
        this.TCenterlat = res.coords.latitude;
        this.TCenterlng = res.coords.longitude;
      }, () => {});
    }
  }

  ngOnInit() {}
  
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
      console.log('edit true');
      
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
          (err) => {
            // this.util.dismissLoader();
            this.spinnerService.hide();
            this.err = err.error.errors;
          }
        );

    } else {

     this.flagControl =  true;
      
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
          }
        },
        (err) => {
          // this.util.dismissLoader();
          this.spinnerService.hide();
          this.err = err.error.errors;
        }
      );
    }
  }
  
  centerChange($event) {
    this.TCenterlat = $event.coords.lat;
    this.TCenterlng = $event.coords.lng;
  }
}
