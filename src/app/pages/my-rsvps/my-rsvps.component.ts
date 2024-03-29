import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './../../auth/auth.service';
import { ApiService } from './../../core/api.service';
import { UtilsService } from './../../core/utils.service';
import { FilterSortService } from './../../core/filter-sort.service';
import { Subscription } from 'rxjs';
import { ProductModel } from './../../core/models/product.model';

@Component({
  selector: 'app-my-rsvps',
  templateUrl: './my-rsvps.component.html',
  styleUrls: ['./my-rsvps.component.scss']
})
export class MyRsvpsComponent implements OnInit, OnDestroy {
  pageTitle = 'My RSVPs';
  loggedInSub: Subscription;
  productListSub: Subscription;
  productList: ProductModel[];
  loading: boolean;
  error: boolean;
  userIdp: string;

  constructor(
    private title: Title,
    public auth: AuthService,
    private api: ApiService,
    public fs: FilterSortService,
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.loggedInSub = this.auth.loggedIn$.subscribe(
      loggedIn => {
        this.loading = true;
        if (loggedIn) {
          this._getProductList();
        }
      }
    );
    this.title.setTitle(this.pageTitle);
  }

  private _getProductList() {
    // Get products user has RSVPed to
    this.productListSub = this.api
      .getUserProducts$(this.auth.userProfile.sub)
      .subscribe(
        res => {
          this.productList = res;
          this.loading = false;
        },
        err => {
          console.error(err);
          this.loading = false;
          this.error = true;
        }
      );
  }

  ngOnDestroy() {
    this.loggedInSub.unsubscribe();
    this.productListSub.unsubscribe();
  }

}
