class ProductModel {
  constructor(
    public title: string,
    public location: string,
    public startDatetime: Date,
    public endDatetime: Date,
    public viewPublic: boolean,
    public description?: string,
    public _id?: string, // _id is present if editing or returning from DB
  ) { }
}

class FormProductModel {
  constructor(
    public title: string,
    public location: string,
    public startDate: string,
    public startTime: string,
    public endDate: string,
    public endTime: string,
    public viewPublic: boolean,
    public description?: string
  ) { }
}

export { ProductModel, FormProductModel };
