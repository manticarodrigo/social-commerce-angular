import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { UpdateProductComponent } from './update-product/update-product.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
  },
  {
    path: 'product/new',
    component: CreateProductComponent
  },
  {
    path: 'product/update/:id',
    component: UpdateProductComponent
  }
];
