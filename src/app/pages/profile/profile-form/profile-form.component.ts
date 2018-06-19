import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from './../../../core/api.service';
import { UserModel, FormUserModel } from './../../../core/models/user.model';
import { DatePipe } from '@angular/common';
import { ProfileFormService } from './profile-form.service';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  providers: [ ProfileFormService ]
})
export class ProfileFormComponent implements OnInit, OnDestroy {
  @Input() user: UserModel;
  isEdit: boolean;
  // FormBuilder form
  profileForm: FormGroup;
  // Model storing initial form values
  formProfile: FormUserModel;
  // Form validation and disabled logic
  formErrors: any;
  formChangeSub: Subscription;
  // Form submission
  submitProfileObj: UserModel;
  submitProfileSub: Subscription;
  error: boolean;
  submitting: boolean;
  submitBtnText: string;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private datePipe: DatePipe,
    public ef: ProfileFormService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log(this.user)
    this.formErrors = this.ef.formErrors;
    this.isEdit = !this.user;
    this.submitBtnText = this.isEdit ? 'Update Profile' : 'Create Profile';
    // Set initial form data
    this.formProfile = this._setFormProfile();
    // Use FormBuilder to construct the form
    this._buildForm();
  }

  private _setFormProfile() {
    if (!this.isEdit) {
      // If creating a new profile, create new
      // FormProfileModel with default null data
      return new FormUserModel(null, null, null, null, null);
    } else {
      // If editing existing profile, create new
      // FormProfileModel from existing data
      return new FormUserModel(
        this.user.business,
        this.user.name,
        this.user.email,
        this.user.phone,
        this.user.dni,
        this.user.ruc,
        this.user.bankAccountNumber,
        this.user.logisticProvider,
        this.user.businessLogo
      );
    }
  }

  private _buildForm() {
    this.profileForm = this.fb.group({
      business: [this.formProfile.business, [
        // Validators.required,
      ]],
      name: [this.formProfile.name,
        // Validators.required,
      ],
      email: [this.formProfile.email,
        // Validators.required,
      ],
      phone: [this.formProfile.phone,
        // Validators.required,
      ],
      dni: [this.formProfile.dni,
        // Validators.required,
      ],
      ruc: [this.formProfile.ruc,
        null
      ],
      bankAccountNumber: [this.formProfile.bankAccountNumber,
        null
      ],
      logisticProvider: [this.formProfile.logisticProvider,
        null
      ],
      businessLogo: [this.formProfile.businessLogo,
        null
      ],
    });

    // Subscribe to form value changes
    this.formChangeSub = this.profileForm
      .valueChanges
      .subscribe(data => this._onValueChanged());

    // If edit: mark fields dirty to trigger immediate
    // validation in case editing an profile that is no
    // longer valid (for example, an profile in the past)
    if (this.isEdit) {
      const _markDirty = group => {
        for (const i in group.controls) {
          if (group.controls.hasOwnProperty(i)) {
            group.controls[i].markAsDirty();
          }
        }
      };
      _markDirty(this.profileForm);
    }

    this._onValueChanged();
  }

  private _onValueChanged() {
    if (!this.profileForm) { return; }
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
        _setErrMsgs(this.profileForm.get(field), this.formErrors, field);
      }
    }
  }

  private _getSubmitObj() {
    return new UserModel(
      this.profileForm.get('business').value,
      this.profileForm.get('name').value,
      this.profileForm.get('email').value,
      this.profileForm.get('phone').value,
      this.profileForm.get('dni').value,
      this.profileForm.get('ruc').value,
      this.profileForm.get('bankAccountNumber').value,
      this.profileForm.get('logisticProvider').value,
      this.profileForm.get('businessLogo').value,
      this.user ? this.user._id : null
    );
  }

  onSubmit() {
    this.submitting = true;
    this.submitProfileObj = this._getSubmitObj();

    if (!this.isEdit) {
      this.submitProfileSub = this.api
        .postUser$(this.submitProfileObj)
        .subscribe(
          data => this._handleSubmitSuccess(data),
          err => this._handleSubmitError(err)
        );
    } else {
      this.submitProfileSub = this.api
        .editUser$(this.user._id, this.submitProfileObj)
        .subscribe(
          data => this._handleSubmitSuccess(data),
          err => this._handleSubmitError(err)
        );
    }
  }

  private _handleSubmitSuccess(res) {
    this.error = false;
    this.submitting = false;
    // Redirect to profile detail
    this.router.navigate(['/profile', res._id]);
  }

  private _handleSubmitError(err) {
    console.error(err);
    this.submitting = false;
    this.error = true;
  }

  resetForm() {
    this.profileForm.reset();
  }

  ngOnDestroy() {
    if (this.submitProfileSub) {
      this.submitProfileSub.unsubscribe();
    }
    this.formChangeSub.unsubscribe();
  }

}
