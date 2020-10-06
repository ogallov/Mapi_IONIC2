import { UtilService } from "./../../service/util.service";
import { Camera } from "@ionic-native/camera/ngx";
import { ApiService } from "./../../service/api.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { NavController, ActionSheetController } from "@ionic/angular";
import * as moment from "moment";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})

export class ProfilePage implements OnInit, OnDestroy {
  segment: number = 4;
  subsegment: number = 1;
  userDetail: any = {};
  err: any = {};
  data: any = {};
  userSetting: any = {};
  imgProfile: any = "http://placehold.it/96x96";
  changeAddressBtn: any = false;
  imageUri: any;
  isNewProfile: boolean = false;
  coverImage: any;
  changeImage: any = {};
  userName: any;
  userLocation: any;
  isfrom: any;
  passwordData: any = {};
  lastIsAdrress: string = localStorage.getItem("isaddress");
  flagControlBtnOpen: boolean = false;

  language: string = localStorage.getItem('app_language') ? localStorage.getItem('app_language') : 'es';

  constructor(
    private ntrl: NavController,
    private api: ApiService,
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private util: UtilService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private spinnerService: NgxSpinnerService,

  ) {

  }

  ionViewWillEnter() {

    if (this.changeAddressBtn) {
      console.log(localStorage.getItem("isaddress"));
      
      this.api.getDataWithToken("getAddress/" + localStorage.getItem("isaddress"))
        .subscribe((res: any) => {
          console.log(res);

          if (res.success) {
            console.log(res.data);
            this.data.userAddress.soc_name = res.data['soc_name'];
            this.data.userAddress.street = res.data['street'];
            this.data.userAddress.city = res.data['city'];
            // this.data.userAddress.zipcode = res.data['zipcode'];
          }
        }, error => {
          console.log(error);
          this.spinnerService.hide();
          
        });
    }
  }

  ngOnInit() {

    // await this.util.startLoad();
    this.spinnerService.show();
    this.api.getDataWithToken("viewReview").subscribe((res: any) => {
      if (res.success) {
        this.data = res.data;
        // this.util.dismissLoader();
        this.spinnerService.hide();
        this.data.review.forEach((element) => {
          element.created_at = moment(element.created_at).fromNow();
        });
        this.userName = res.data.userDetail.name;
        this.userLocation = res.data.userDetail.location;
        this.userDetail = this.data.userDetail;

        if (res.data.userDetail.cover_image == null) {
          this.coverImage = false;
        } else {
          this.coverImage = this.userDetail.imagePath + this.data.userDetail.cover_image;
        }

        this.imgProfile = this.userDetail.imagePath + this.userDetail.image;
        // this.data.address = localStorage.getItem("address");
        this.data.address = localStorage.getItem("isaddress");

        if (this.userDetail.enable_notification == 1) {
          this.userSetting.enable_notification = true;
        } else {
          this.userSetting.enable_notification = false;
        }

        if (this.userDetail.enable_location == 1) {
          this.userSetting.enable_location = true;
        } else {
          this.userSetting.enable_location = false;
        }

        if (this.userDetail.enable_call == 1) {
          this.userSetting.enable_call = true;
        } else {
          this.userSetting.enable_call = false;
        }
      }
    }, error => {
      console.log(error);
      this.spinnerService.hide();
    });

    this.route.params.subscribe((params) => {
      this.isfrom = params["id"];
      if (this.isfrom == "setting") {
        this.segment = 4;
      }
    }, error => {
      console.log(error);
      this.spinnerService.hide();
    });

    if (this.lastIsAdrress !== '') {
      // message
      if (this.flagControlBtnOpen) {
        this.translate.get('toasts').subscribe(async val => {
          this.util.presentToast(val.The_selected_address_has_not_been_saved);
        }, error => {
          console.log(error);
          this.spinnerService.hide();
        })
      }
      // set address last
      localStorage.setItem('isaddress', this.lastIsAdrress);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

    if (this.lastIsAdrress !== '') {
      // message
      if (this.flagControlBtnOpen) {
        this.translate.get('toasts').subscribe(async val => {
          this.util.presentToast(val.The_selected_address_has_not_been_saved);
        }, error => {
          console.log(error);
          this.spinnerService.hide();
        })
      }
      // set address last
      localStorage.setItem('isaddress', this.lastIsAdrress);
    }
  }

  back() {
    this.ntrl.back();
  }

  async editProfile() {

    if (this.segment == 3) {

      // await this.util.startLoad();
      this.spinnerService.show();
      this.api.postDataWithToken("editProfile", this.userDetail).subscribe(
        (res: any) => {

          if (res.success) {
            this.err = {};
            // this.util.dismissLoader();
            this.spinnerService.hide();
            this.translate.get('toasts').subscribe(async val => {
              this.util.presentToast(val.profile_set_success);
            })

            this.util.isUpdateProfile.next(true);

            this.api.getDataWithToken("viewReview").subscribe((res: any) => {

              if (res.success) {
                this.data = res.data;
                // this.util.dismissLoader();
                this.spinnerService.hide();

                this.data.review.forEach((element) => {
                  element.created_at = moment(element.created_at).fromNow();
                });

                this.userName = res.data.userDetail.name;
                this.userLocation = res.data.userDetail.location;
                this.userDetail = this.data.userDetail;

                if (res.data.userDetail.cover_image == null) {
                  this.coverImage = false;
                } else {
                  this.coverImage = this.userDetail.imagePath + this.data.userDetail.cover_image;
                }

                this.imgProfile = this.userDetail.imagePath + this.userDetail.image;
                // this.data.address = localStorage.getItem("address");
                this.data.address = localStorage.getItem("isaddress");

                if (this.userDetail.enable_notification == 1) {
                  this.userSetting.enable_notification = true;
                } else {
                  this.userSetting.enable_notification = false;
                }
                if (this.userDetail.enable_location == 1) {
                  this.userSetting.enable_location = true;
                } else {
                  this.userSetting.enable_location = false;
                }
                if (this.userDetail.enable_call == 1) {
                  this.userSetting.enable_call = true;
                } else {
                  this.userSetting.enable_call = false;
                }
              }
            });
          }
        },
        (err) => {
          if (err.error.msg) {
            // this.util.dismissLoader();
            this.spinnerService.hide();
            this.util.presentToast(err.error.msg);
          }
          this.err = err.error.errors;
          // this.util.dismissLoader();
          this.spinnerService.hide();
        }
      );

    } else if (this.segment == 5) {

      // await this.util.startLoad();
      this.spinnerService.show();
      this.api.postDataWithToken("changePassword", this.passwordData).subscribe(
        (res: any) => {
          if (res.success) {
            // this.util.dismissLoader();
            this.spinnerService.hide();
            this.passwordData.password = "";
            this.passwordData.confirmPassword = "";
            this.err = {};
            this.util.presentToast(res.msg);
          }
        },
        (err) => {
          // this.util.dismissLoader();
          this.spinnerService.hide();
          this.err = err.error.errors;
        }
      );

    } else {

      if (this.userSetting.enable_notification) {
        this.userSetting.enable_notification = 1;
      } else {
        this.userSetting.enable_notification = 0;
      }
      if (this.userSetting.enable_location) {
        this.userSetting.enable_location = 1;
      } else {
        this.userSetting.enable_location = 0;
      }
      if (this.userSetting.enable_call) {
        this.userSetting.enable_call = 1;
      } else {
        this.userSetting.enable_call = 0;
      }

      this.userSetting.address_id = localStorage.getItem("isaddress");
      // await this.util.startLoad();
      this.spinnerService.show();
      this.api
        .postDataWithToken("saveSetting", this.userSetting)
        .subscribe((res: any) => {
          if (res.success) {
            this.lastIsAdrress = '';
            localStorage.setItem("isaddressBD", "true");
            // this.util.dismissLoader();
            this.spinnerService.hide();
            this.translate.get('toasts').subscribe(async val => {
              this.util.presentToast(val.setting_set_success);
            }, errs => {
              console.log(errs);
              this.spinnerService.hide();
            });
          }
        }, error => {
          console.log(error);
          this.spinnerService.hide();
        });
    }
  }

  changeAddress() {
    this.changeAddressBtn = true;
    this.flagControlBtnOpen = true;
    this.ntrl.navigateForward("/select-address");
  }

  async chageProfileOption() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: "Select method",
      buttons: [
        {
          text: "Camera",
          role: "destructive",
          icon: "camera",
          handler: () => {
            this.getCamera();
          },
        },
        {
          text: "Gallary",
          icon: "photos",
          handler: () => {
            this.getGallery();
          },
        },
        {
          text: "Cancel",
          icon: "close",
          handler: () => { },
        },
      ],
    });
    await actionSheet.present();
  }

  getGallery() {
    const cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
    };

    this.camera.getPicture(cameraOptions).then(
      (fileUri) => {
        this.imgProfile = "data:image/jpg;base64," + fileUri;
        this.imageUri = fileUri;
        this.isNewProfile = true;

        this.changeImage.image = this.imageUri;
        this.changeImage.image_type = "profile";
        this.api
          .postDataWithToken("changeImage", this.changeImage)
          .subscribe((res: any) => {
            if (res.success) {

            }
          });
      },
      (err) => { }
    );
  }

  getCamera() {

    const cameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
    };

    this.camera.getPicture(cameraOptions).then(
      (fileUri) => {
        this.imgProfile = "data:image/jpg;base64," + fileUri;
        this.imageUri = fileUri;
        this.isNewProfile = true;
      },
      (err) => { }
    );

  }

  editCoverimg() {
    const cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
    };

    this.camera.getPicture(cameraOptions).then(
      (fileUri) => {
        this.coverImage = "data:image/jpg;base64," + fileUri;
        this.imageUri = fileUri;
        this.changeImage.image = this.imageUri;
        this.changeImage.image_type = "cover";
        this.api
          .postDataWithToken("changeImage", this.changeImage)
          .subscribe((res: any) => {
            if (res.success) {

            }
          });
      },
      (err) => { }
    );
  }

  uploadGalleryimg() {
    const cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
    };

    this.camera.getPicture(cameraOptions).then(
      (fileUri) => {
        this.imageUri = fileUri;
        this.changeImage.image = this.imageUri;

        this.api
          .postDataWithToken("addPhoto", this.changeImage)
          .subscribe((res: any) => {

            if (res.success) {
              this.api.getDataWithToken("viewReview").subscribe((res: any) => {
                if (res.success) {
                  this.data = res.data;
                  this.data.review.forEach((element) => {
                    element.created_at = moment(element.created_at).fromNow();
                  });

                  this.userDetail = this.data.userDetail;
                  this.coverImage = this.userDetail.imagePath + this.data.userDetail.cover_image;
                  this.imgProfile = this.userDetail.imagePath + this.userDetail.image;
                  // this.data.address = localStorage.getItem("address");
                  this.data.address = localStorage.getItem("isaddress");

                  if (this.userDetail.enable_notification == 1) {
                    this.userSetting.enable_notification = true;
                  } else {
                    this.userSetting.enable_notification = false;
                  }
                  if (this.userDetail.enable_location == 1) {
                    this.userSetting.enable_location = true;
                  } else {
                    this.userSetting.enable_location = false;
                  }
                  if (this.userDetail.enable_call == 1) {
                    this.userSetting.enable_call = true;
                  } else {
                    this.userSetting.enable_call = false;
                  }
                }
              });
            }
          });
      },
      (err) => { }
    );
  }

  async onLanguageChange() {
    localStorage.setItem('app_language', this.language);
    document.documentElement.dir = this.language == 'ar' ? 'rtl' : 'ltr';
    this.translate.setDefaultLang(this.language);
  }
}
