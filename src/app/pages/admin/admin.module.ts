import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from './../../core/core.module';
import { RouterModule } from '@angular/router';
import { ADMIN_ROUTES } from './admin.routes';
import { AdminComponent } from './admin.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { UpdateProductComponent } from './update-product/update-product.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { DeleteProductComponent } from './update-product/delete-product/delete-product.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(ADMIN_ROUTES)
  ],
  declarations: [
    AdminComponent,
    CreateProductComponent,
    UpdateProductComponent,
    ProductFormComponent,
    DeleteProductComponent
  ]
})
export class AdminModule { }
