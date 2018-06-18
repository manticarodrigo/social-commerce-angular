import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './../auth/auth.service';
import { throwError as ObservableThrowError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { ProductModel } from './models/product.model';
import { OrderModel } from './models/order.model';

@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  // GET list of public, future products
  getProducts$(): Observable<ProductModel[]> {
    return this.http
      .get<ProductModel[]>(`${ENV.BASE_API}products`)
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // GET all products - private and public (admin only)
  getAdminProducts$(): Observable<ProductModel[]> {
    return this.http
      .get<ProductModel[]>(`${ENV.BASE_API}products/admin`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // GET an product by ID (login required)
  getProductById$(id: string): Observable<ProductModel> {
    return this.http
      .get<ProductModel>(`${ENV.BASE_API}product/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // GET Orders by product ID (login required)
  getOrdersByProductId$(productId: string): Observable<OrderModel[]> {
    return this.http
      .get<OrderModel[]>(`${ENV.BASE_API}product/${productId}/orders`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // POST new product (admin only)
  postProduct$(product: ProductModel): Observable<ProductModel> {
    return this.http
      .post<ProductModel>(`${ENV.BASE_API}product/new`, product, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // PUT existing product (admin only)
  editProduct$(id: string, product: ProductModel): Observable<ProductModel> {
    return this.http
      .put<ProductModel>(`${ENV.BASE_API}product/${id}`, product, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // DELETE existing product and all associated Orders (admin only)
  deleteProduct$(id: string): Observable<any> {
    return this.http
      .delete(`${ENV.BASE_API}product/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // GET all products a specific user has Ordered to (login required)
  getUserProducts$(userId: string): Observable<ProductModel[]> {
    return this.http
      .get<ProductModel[]>(`${ENV.BASE_API}products/${userId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // POST new Order (login required)
  postOrder$(order: OrderModel): Observable<OrderModel> {
    return this.http
      .post<OrderModel>(`${ENV.BASE_API}order/new`, order, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // PUT existing Order (login required)
  editOrder$(id: string, order: OrderModel): Observable<OrderModel> {
    return this.http
      .put(`${ENV.BASE_API}order/${id}`, order, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  private _handleError(err: HttpErrorResponse | any): Observable<any> {
    const errorMsg = err.message || 'Error: Unable to complete request.';
    if (err.message && err.message.indexOf('No JWT present') > -1) {
      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }

}
