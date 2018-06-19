class UserModel {
  constructor(
    public business: string,
    public name: string,
    public email: string,
    public phone: string,
    public dni: string,
    public ruc?: string,
    public bankAccountNumber?: string,
    public logisticProvider?: string,
    public businessLogo?: string,
    public _id?: string // _id is present if editing or returning from DB
  ) {}
}

export { UserModel };
