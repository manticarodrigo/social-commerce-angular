import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from './../../../core/api.service';
import { ProductModel, FormProductModel } from './../../../core/models/product.model';
import { DatePipe } from '@angular/common';
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
      return new FormProductModel(null, null, null, null, null);
    } else {
      // If editing existing product, create new
      // FormProductModel from existing data
      return new FormProductModel(
        this.product.title,
        this.product.price,
        this.product.stock,
        this.product.photo,
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
      price: [this.formProduct.price,
        Validators.min(0)
      ],
      stock: [this.formProduct.stock,
        Validators.min(1)
      ],
      photo: [this.formProduct.photo,
        null
      ],
      description: [this.formProduct.description,
        Validators.maxLength(this.ef.descMax)
      ],
    });

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
        // Clear previous error message (if any)
        this.formErrors[field] = '';
        _setErrMsgs(this.productForm.get(field), this.formErrors, field);
      }
    }
  }

  private _getSubmitObj() {
    return new ProductModel(
      this.productForm.get('title').value,
      this.productForm.get('price').value,
      this.productForm.get('stock').value,
      this.productForm.get('photo').value,
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
