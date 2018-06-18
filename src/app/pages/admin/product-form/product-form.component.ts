import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from './../../../core/api.service';
import { ProductModel, FormProductModel } from './../../../core/models/product.model';
import { DatePipe } from '@angular/common';
import { dateValidator } from './../../../core/forms/date.validator';
import { dateRangeValidator } from './../../../core/forms/date-range.validator';
import { DATE_REGEX, TIME_REGEX, stringsToDate } from './../../../core/forms/formUtils.factory';
import { ProductFormService } from './product-form.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  providers: [ ProductFormService ]
})
export class ProductFormComponent implements OnInit, OnDestroy {
  @Input() product: ProductModel;
  isEdit: boolean;
  // FormBuilder form
  productForm: FormGroup;
  datesGroup: AbstractControl;
  // Model storing initial form values
  formProduct: FormProductModel;
  // Form validation and disabled logic
  formErrors: any;
  formChangeSub: Subscription;
  // Form submission
  submitProductObj: ProductModel;
  submitProductSub: Subscription;
  error: boolean;
  submitting: boolean;
  submitBtnText: string;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private datePipe: DatePipe,
    public ef: ProductFormService,
    private router: Router
  ) { }

  ngOnInit() {
    this.formErrors = this.ef.formErrors;
    this.isEdit = !!this.product;
    this.submitBtnText = this.isEdit ? 'Update Product' : 'Create Product';
    // Set initial form data
    this.formProduct = this._setFormProduct();
    // Use FormBuilder to construct the form
    this._buildForm();
  }

  private _setFormProduct() {
    if (!this.isEdit) {
      // If creating a new product, create new
      // FormProductModel with default null data
      return new FormProductModel(null, null, null, null, null, null, null);
    } else {
      // If editing existing product, create new
      // FormProductModel from existing data
      // Transform datetimes:
      // https://angular.io/api/common/DatePipe
      // _shortDate: 1/7/2017
      // 'shortTime': 12:05 PM
      const _shortDate = 'M/d/yyyy';
      return new FormProductModel(
        this.product.title,
        this.product.location,
        this.datePipe.transform(this.product.startDatetime, _shortDate),
        this.datePipe.transform(this.product.startDatetime, 'shortTime'),
        this.datePipe.transform(this.product.endDatetime, _shortDate),
        this.datePipe.transform(this.product.endDatetime, 'shortTime'),
        this.product.viewPublic,
        this.product.description
      );
    }
  }

  private _buildForm() {
    this.productForm = this.fb.group({
      title: [this.formProduct.title, [
        Validators.required,
        Validators.minLength(this.ef.textMin),
        Validators.maxLength(this.ef.titleMax)
      ]],
      location: [this.formProduct.location, [
        Validators.required,
        Validators.minLength(this.ef.textMin),
        Validators.maxLength(this.ef.locMax)
      ]],
      viewPublic: [this.formProduct.viewPublic,
        Validators.required
      ],
      description: [this.formProduct.description,
        Validators.maxLength(this.ef.descMax)
      ],
      datesGroup: this.fb.group({
        startDate: [this.formProduct.startDate, [
          Validators.required,
          Validators.maxLength(this.ef.dateMax),
          Validators.pattern(DATE_REGEX),
          dateValidator()
        ]],
        startTime: [this.formProduct.startTime, [
          Validators.required,
          Validators.maxLength(this.ef.timeMax),
          Validators.pattern(TIME_REGEX)
        ]],
        endDate: [this.formProduct.endDate, [
          Validators.required,
          Validators.maxLength(this.ef.dateMax),
          Validators.pattern(DATE_REGEX),
          dateValidator()
        ]],
        endTime: [this.formProduct.endTime, [
          Validators.required,
          Validators.maxLength(this.ef.timeMax),
          Validators.pattern(TIME_REGEX)
        ]]
      }, { validator: dateRangeValidator })
    });
    // Set local property to productForm datesGroup control
    this.datesGroup = this.productForm.get('datesGroup');

    // Subscribe to form value changes
    this.formChangeSub = this.productForm
      .valueChanges
      .subscribe(data => this._onValueChanged());

    // If edit: mark fields dirty to trigger immediate
    // validation in case editing an product that is no
    // longer valid (for example, an product in the past)
    if (this.isEdit) {
      const _markDirty = group => {
        for (const i in group.controls) {
          if (group.controls.hasOwnProperty(i)) {
            group.controls[i].markAsDirty();
          }
        }
      };
      _markDirty(this.productForm);
      _markDirty(this.datesGroup);
    }

    this._onValueChanged();
  }

  private _onValueChanged() {
    if (!this.productForm) { return; }
    const _setErrMsgs = (control: AbstractControl, errorsObj: any, field: string) => {
      if (control && control.dirty && control.invalid) {
        const messages = this.ef.validationMessages[field];
        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            errorsObj[field] += messages[key] + '<br>';
          }
        }
      }
    };

    // Check validation and set errors
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        if (field !== 'datesGroup') {
          // Set errors for fields not inside datesGroup
          // Clear previous error message (if any)
          this.formErrors[field] = '';
          _setErrMsgs(this.productForm.get(field), this.formErrors, field);
        } else {
          // Set errors for fields inside datesGroup
          const datesGroupErrors = this.formErrors['datesGroup'];
          for (const dateField in datesGroupErrors) {
            if (datesGroupErrors.hasOwnProperty(dateField)) {
              // Clear previous error message (if any)
              datesGroupErrors[dateField] = '';
              _setErrMsgs(this.datesGroup.get(dateField), datesGroupErrors, dateField);
            }
          }
        }
      }
    }
  }

  private _getSubmitObj() {
    const startDate = this.datesGroup.get('startDate').value;
    const startTime = this.datesGroup.get('startTime').value;
    const endDate = this.datesGroup.get('endDate').value;
    const endTime = this.datesGroup.get('endTime').value;
    // Convert form startDate/startTime and endDate/endTime
    // to JS dates and populate a new ProductModel for submission
    return new ProductModel(
      this.productForm.get('title').value,
      this.productForm.get('location').value,
      stringsToDate(startDate, startTime),
      stringsToDate(endDate, endTime),
      this.productForm.get('viewPublic').value,
      this.productForm.get('description').value,
      this.product ? this.product._id : null
    );
  }

  onSubmit() {
    this.submitting = true;
    this.submitProductObj = this._getSubmitObj();

    if (!this.isEdit) {
      this.submitProductSub = this.api
        .postProduct$(this.submitProductObj)
        .subscribe(
          data => this._handleSubmitSuccess(data),
          err => this._handleSubmitError(err)
        );
    } else {
      this.submitProductSub = this.api
        .editProduct$(this.product._id, this.submitProductObj)
        .subscribe(
          data => this._handleSubmitSuccess(data),
          err => this._handleSubmitError(err)
        );
    }
  }

  private _handleSubmitSuccess(res) {
    this.error = false;
    this.submitting = false;
    // Redirect to product detail
    this.router.navigate(['/product', res._id]);
  }

  private _handleSubmitError(err) {
    console.error(err);
    this.submitting = false;
    this.error = true;
  }

  resetForm() {
    this.productForm.reset();
  }

  ngOnDestroy() {
    if (this.submitProductSub) {
      this.submitProductSub.unsubscribe();
    }
    this.formChangeSub.unsubscribe();
  }

}
