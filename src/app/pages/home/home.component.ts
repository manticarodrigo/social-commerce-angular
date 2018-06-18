import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService } from './../../core/api.service';
import { UtilsService } from './../../core/utils.service';
import { FilterSortService } from './../../core/filter-sort.service';
import { Subscription } from 'rxjs';
import { ProductModel } from './../../core/models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  pageTitle = 'Products';
  productListSub: Subscription;
  productList: ProductModel[];
  filteredProducts: ProductModel[];
  loading: boolean;
  error: boolean;
  query: '';

  constructor(
    private title: Title,
    public utils: UtilsService,
    private api: ApiService,
    public fs: FilterSortService
  ) { }

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
    this._getProductList();
  }

  private _getProductList() {
    this.loading = true;
    // Get future, public products
    this.productListSub = this.api
      .getProducts$()
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

  get noSearchResults(): boolean {
    return !!(!this.filteredProducts.length && this.query);
  }

  ngOnDestroy() {
    this.productListSub.unsubscribe();
  }

}
