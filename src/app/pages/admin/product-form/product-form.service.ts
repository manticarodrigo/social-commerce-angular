import { Injectable } from '@angular/core';

@Injectable()
export class ProductFormService {
  validationMessages: any;
  // Set up errors object
  formErrors = {
    title: '',
    price: '',
    stock: '',
    photo: '',
    description: ''
  };
  // Min/maxlength validation
  textMin = 3;
  titleMax = 36;
  descMax = 200;

  constructor() {
    this.validationMessages = {
      title: {
        required: `Title is <strong>required</strong>.`,
        minlength: `Title must be ${this.textMin} characters or more.`,
        maxlength: `Title must be ${this.titleMax} characters or less.`
      },
      description: {
        maxlength: `Description must be ${this.descMax} characters or less.`
      }
    };
  }
}
