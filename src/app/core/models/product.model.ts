class ProductModel {
  constructor(
    public title: string,
    public price: number,
    public stock: number,
    public photo?: string,
    public description?: string,
    public _id?: string // _id is present if editing or returning from DB
  ) {}
}

class FormProductModel {
  constructor(
    public title: string,
    public price: number,
    public stock: number,
    public photo?: string,
    public description?: string
  ) {}
}

export { ProductModel, FormProductModel };
