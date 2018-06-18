import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { expandCollapse } from './../../../core/expand-collapse.animation';
import { AuthService } from './../../../auth/auth.service';
import { ApiService } from './../../../core/api.service';
import { UtilsService } from './../../../core/utils.service';
import { FilterSortService } from './../../../core/filter-sort.service';
import { OrderModel } from './../../../core/models/order.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order',
  animations: [expandCollapse],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy {
  @Input() productId: string;
  @Input() productPast: boolean;
  ordersSub: Subscription;
  orders: OrderModel[];
  loading: boolean;
  error: boolean;
  userOrder: OrderModel;
  totalAttending: number;
  footerTense: string;
  showEditForm: boolean;
  editBtnText: string;
  showAllOrders = false;
  showOrdersText = 'View All Orders';

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public utils: UtilsService,
    public fs: FilterSortService
  ) { }

  ngOnInit() {
    this.footerTense = !this.productPast ? 'plan to attend this product.' : 'attended this product.';
    this._getOrders();
    this.toggleEditForm(false);
  }

  private _getOrders() {
    this.loading = true;
    // Get Orders by product ID
    this.ordersSub = this.api
      .getOrdersByProductId$(this.productId)
      .subscribe(
        res => {
          this.orders = res;
          this._updateOrderState();
          this.loading = false;
        },
        err => {
          console.error(err);
          this.loading = false;
          this.error = true;
        }
      );
  }

  toggleEditForm(setVal?: boolean) {
    this.showEditForm = setVal !== undefined ? setVal : !this.showEditForm;
    this.editBtnText = this.showEditForm ? 'Cancel Edit' : 'Edit My Order';
  }

  toggleShowOrders() {
    this.showAllOrders = !this.showAllOrders;
    this.showOrdersText = this.showAllOrders ? 'Hide Orders' : 'Show All Orders';
  }

  onSubmitOrder(e) {
    if (e.order) {
      this.userOrder = e.order;
      this._updateOrderState(true);
      this.toggleEditForm(false);
    }
  }

  private _updateOrderState(changed?: boolean) {
    // If Order matching user ID is already
    // in Order array, set as initial Order
    const _initialUserOrder = this.orders.filter(order => {
        return order.userId === this.auth.userProfile.sub;
      })[0];

    // If user has not Ordered before and has made
    // a change, push new Order to local Orders store
    if (!_initialUserOrder && this.userOrder && changed) {
      this.orders.push(this.userOrder);
    }
    this._setUserOrderGetAttending(changed);
  }

  private _setUserOrderGetAttending(changed?: boolean) {
    // Iterate over Orders to get/set user's Order
    // and get total number of attending guests
    let guests = 0;
    const orderArr = this.orders.map(order => {
      // If user has an existing Order
      if (order.userId === this.auth.userProfile.sub) {
        if (changed) {
          // If user edited their Order, set with updated data
          order = this.userOrder;
        } else {
          // If no changes were made, set userOrder property
          // (This applies on ngOnInit)
          this.userOrder = order;
        }
      }
      // Count total number of attendees
      // + additional guests
      if (order.attending) {
        guests++;
        if (order.guests) {
          guests += order.guests;
        }
      }
      return order;
    });
    this.orders = orderArr;
    this.totalAttending = guests;
  }

  ngOnDestroy() {
    this.ordersSub.unsubscribe();
  }

}
