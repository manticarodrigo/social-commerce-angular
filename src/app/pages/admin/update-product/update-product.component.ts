import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './../../../auth/auth.service';
import { ApiService } from './../../../core/api.service';
import { UtilsService } from './../../../core/utils.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductModel } from './../../../core/models/product.model';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.scss']
})
export class UpdateProductComponent implements OnInit, OnDestroy {
  pageTitle = 'Update Product';
  routeSub: Subscription;
  productSub: Subscription;
  product: ProductModel;
  loading: boolean;
  submitting: boolean;
  error: boolean;
  tabSub: Subscription;
  tab: string;
  private _id: string;

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private api: ApiService,
    public utils: UtilsService,
    private title: Title
  ) { }

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    // Set product ID from route params and subscribe
    this.routeSub = this.route.params
      .subscribe(params => {
        this._id = params['id'];
        this._getProduct();
      });

    // Subscribe to query params to watch for tab changes
    this.tabSub = this.route.queryParams
      .subscribe(queryParams => {
        this.tab = queryParams['tab'] || 'edit';
      });
  }

  private _getProduct() {
    this.loading = true;
    // GET product by ID
    this.productSub = this.api
      .getProductById$(this._id)
      .subscribe(
        res => {
          this.product = res;
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
    this.routeSub.unsubscribe();
    this.tabSub.unsubscribe();
    this.productSub.unsubscribe();
  }

}
