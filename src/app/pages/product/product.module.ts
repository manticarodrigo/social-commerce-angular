import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from './../../core/core.module';
import { RouterModule } from '@angular/router';
import { EVENT_ROUTES } from './product.routes';
import { ProductComponent } from './product.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { OrderComponent } from './order/order.component';
import { OrderFormComponent } from './order/order-form/order-form.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(EVENT_ROUTES)
  ],
  declarations: [
    ProductComponent,
    ProductDetailComponent,
    OrderComponent,
    OrderFormComponent
  ]
})
export class ProductModule { }
