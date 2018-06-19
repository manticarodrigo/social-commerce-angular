import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './../../auth/auth.service';
import { ApiService } from './../../core/api.service';
import { UtilsService } from './../../core/utils.service';
import { FilterSortService } from './../../core/filter-sort.service';
import { Subscription } from 'rxjs';
import { ProductModel } from './../../core/models/product.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  pageTitle = 'Admin';
  loggedInSub: Subscription;
  productsSub: Subscription;
  productList: ProductModel[];
  filteredProducts: ProductModel[];
  loading: boolean;
  error: boolean;
  query = '';

  constructor(
    private title: Title,
    public auth: AuthService,
    private api: ApiService,
    public utils: UtilsService,
    public fs: FilterSortService
  ) { }

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
    this._getProductList();
  }

  private _getProductList() {
    // Get all (admin) products
    this.productsSub = this.api
      .getAdminProducts$()
      .subscribe(
        res => {
          this.productList = res;
          this.filteredProducts = res;
          this.loading = false;
        },
        err => {
          console.error(err);
          this.loading = false;
          this.error = true;
        }
      );
  }

  searchProducts() {
    this.filteredProducts = this.fs.search(this.productList, this.query, '_id', 'mediumDate');
  }

  resetQuery() {
    this.query = '';
    this.filteredProducts = this.productList;
  }

  ngOnDestroy() {
    this.productsSub.unsubscribe();
  }

}
