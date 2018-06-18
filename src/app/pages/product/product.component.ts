import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './../../auth/auth.service';
import { ApiService } from './../../core/api.service';
import { UtilsService } from './../../core/utils.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductModel } from './../../core/models/product.model';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
  pageTitle: string;
  id: string;
  loggedInSub: Subscription;
  routeSub: Subscription;
  tabSub: Subscription;
  productSub: Subscription;
  product: ProductModel;
  loading: boolean;
  error: boolean;
  tab: string;
  productPast: boolean;

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private api: ApiService,
    public utils: UtilsService,
    private title: Title
  ) { }

  ngOnInit() {
    this.loggedInSub = this.auth.loggedIn$.subscribe(
      loggedIn => {
        this.loading = true;
        if (loggedIn) {
          this._routeSubs();
        }
      }
    );
  }

  private _routeSubs() {
    // Set product ID from route params and subscribe
    this.routeSub = this.route.params
      .subscribe(params => {
        this.id = params['id'];
        this._getProduct();
      });

    // Subscribe to query params to watch for tab changes
    this.tabSub = this.route.queryParams
      .subscribe(queryParams => {
        this.tab = queryParams['tab'] || 'details';
      });
  }

  private _getProduct() {
    // GET product by ID
    this.productSub = this.api
      .getProductById$(this.id)
      .subscribe(
        res => {
          this.product = res;
          this._setPageTitle(this.product.title);
          this.loading = false;
          this.productPast = this.utils.productPast(this.product.endDatetime);
        },
        err => {
          console.error(err);
          this.loading = false;
          this.error = true;
          this._setPageTitle('Product Details');
        }
      );
  }

  private _setPageTitle(title: string) {
    this.pageTitle = title;
    this.title.setTitle(title);
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.tabSub.unsubscribe();
    this.productSub.unsubscribe();
  }

}
