import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './../auth/auth.service';
import { throwError as ObservableThrowError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { UserModel } from './models/user.model';
import { ProductModel } from './models/product.model';
import { RsvpModel } from './models/rsvp.model';

@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  // GET an user by ID (login required)
  getUserById$(id: string): Observable<UserModel> {
    return this.http
      .get<UserModel>(`${ENV.BASE_API}user/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
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

  // GET RSVPs by product ID (login required)
  getRsvpsByProductId$(productId: string): Observable<RsvpModel[]> {
    return this.http
      .get<RsvpModel[]>(`${ENV.BASE_API}product/${productId}/rsvps`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // POST new user
  postUser$(user: UserModel): Observable<UserModel> {
    return this.http
      .post<UserModel>(`${ENV.BASE_API}user/new`, user, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // PUT existing user
  editUser$(id: string, user: UserModel): Observable<UserModel> {
    return this.http
      .put<UserModel>(`${ENV.BASE_API}user/${id}`, user, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // DELETE existing user
  deleteUser(id: string): Observable<any> {
    return this.http
      .delete(`${ENV.BASE_API}user/${id}`, {
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

  // DELETE existing product and all associated RSVPs (admin only)
  deleteProduct$(id: string): Observable<any> {
    return this.http
      .delete(`${ENV.BASE_API}product/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // GET all products a specific user has RSVPed to (login required)
  getUserProducts$(userId: string): Observable<ProductModel[]> {
    return this.http
      .get<ProductModel[]>(`${ENV.BASE_API}products/${userId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // POST new RSVP (login required)
  postRsvp$(rsvp: RsvpModel): Observable<RsvpModel> {
    return this.http
      .post<RsvpModel>(`${ENV.BASE_API}rsvp/new`, rsvp, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // PUT existing RSVP (login required)
  editRsvp$(id: string, rsvp: RsvpModel): Observable<RsvpModel> {
    return this.http
      .put(`${ENV.BASE_API}rsvp/${id}`, rsvp, {
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
