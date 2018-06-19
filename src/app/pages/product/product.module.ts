import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from './../../core/core.module';
import { RouterModule } from '@angular/router';
import { PRODUCT_ROUTES } from './product.routes';
import { ProductComponent } from './product.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
// import { RsvpComponent } from './rsvp/rsvp.component';
// import { RsvpFormComponent } from './rsvp/rsvp-form/rsvp-form.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(PRODUCT_ROUTES)
  ],
  declarations: [
    ProductComponent,
    ProductDetailComponent
  ]
})
export class ProductModule { }
