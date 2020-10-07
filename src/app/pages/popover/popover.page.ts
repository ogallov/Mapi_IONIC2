import { ApiService } from "./../../service/api.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-popover",
  templateUrl: "./popover.page.html",
  styleUrls: ["./popover.page.scss"]
})

export class PopoverPage implements OnInit {
  data: any[];
  item: any | string = '';
  constructor(private api: ApiService) {
    this.data = this.api.menu;
    this.item = this.api.item;
    console.log(this.item);
    
  }

  ngOnInit() {}
}
