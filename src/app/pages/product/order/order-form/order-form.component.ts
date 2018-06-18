import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from './../../../../auth/auth.service';
import { Subscription } from 'rxjs';
import { ApiService } from './../../../../core/api.service';
import { OrderModel } from './../../../../core/models/order.model';
import { GUESTS_REGEX } from './../../../../core/forms/formUtils.factory';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit, OnDestroy {
  @Input() productId: string;
  @Input() order: OrderModel;
  @Output() submitOrder = new EventEmitter();
  GUESTS_REGEX = GUESTS_REGEX;
  isEdit: boolean;
  formOrder: OrderModel;
  submitOrderSub: Subscription;
  submitting: boolean;
  error: boolean;

  constructor(
    private auth: AuthService,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.isEdit = !!this.order;
    this._setFormOrder();
  }

  private _setFormOrder() {
    if (!this.isEdit) {
      // If creating a new Order,
      // create new OrderModel with default data
      this.formOrder = new OrderModel(
        this.auth.userProfile.sub,
        this.auth.userProfile.name,
        this.productId,
        null,
        0);
    } else {
      // If editing an existing Order,
      // create new OrderModel from existing data
      this.formOrder = new OrderModel(
        this.order.userId,
        this.order.name,
        this.order.productId,
        this.order.attending,
        this.order.guests,
        this.order.comments,
        this.order._id
      );
    }
  }

  changeAttendanceSetGuests() {
    // If attendance changed to no, set guests: 0
    if (!this.formOrder.attending) {
      this.formOrder.guests = 0;
    }
  }

  onSubmit() {
    this.submitting = true;
    if (!this.isEdit) {
      this.submitOrderSub = this.api
        .postOrder$(this.formOrder)
        .subscribe(
          data => this._handleSubmitSuccess(data),
          err => this._handleSubmitError(err)
        );
    } else {
      this.submitOrderSub = this.api
        .editOrder$(this.order._id, this.formOrder)
        .subscribe(
          data => this._handleSubmitSuccess(data),
          err => this._handleSubmitError(err)
        );
    }
  }

  private _handleSubmitSuccess(res) {
    const productObj = {
      isEdit: this.isEdit,
      order: res
    };
    this.submitOrder.emit(productObj);
    this.error = false;
    this.submitting = false;
  }

  private _handleSubmitError(err) {
    const productObj = {
      isEdit: this.isEdit,
      error: err
    };
    this.submitOrder.emit(productObj);
    console.error(err);
    this.submitting = false;
    this.error = true;
  }

  ngOnDestroy() {
    if (this.submitOrderSub) {
      this.submitOrderSub.unsubscribe();
    }
  }

}
