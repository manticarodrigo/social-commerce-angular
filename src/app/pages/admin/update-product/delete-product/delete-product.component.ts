import { Component, OnDestroy, Input } from '@angular/core';
import { ProductModel } from './../../../../core/models/product.model';
import { Subscription } from 'rxjs';
import { ApiService } from './../../../../core/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-product',
  templateUrl: './delete-product.component.html',
  styleUrls: ['./delete-product.component.scss']
})
export class DeleteProductComponent implements OnDestroy {
  @Input() product: ProductModel;
  confirmDelete: string;
  deleteSub: Subscription;
  submitting: boolean;
  error: boolean;

  constructor(
    private api: ApiService,
    private router: Router
  ) { }

  removeProduct() {
    this.submitting = true;
    // DELETE product by ID
    this.deleteSub = this.api
      .deleteProduct$(this.product._id)
      .subscribe(
        res => {
          this.submitting = false;
          this.error = false;
          console.log(res.message);
          // If successfully deleted product, redirect to Admin
          this.router.navigate(['/admin']);
        },
        err => {
          console.error(err);
          this.submitting = false;
          this.error = true;
        }
      );
  }

  ngOnDestroy() {
    if (this.deleteSub) {
      this.deleteSub.unsubscribe();
    }
  }

}
