export class OrderModel {
  constructor(
    public userId: string,
    public name: string,
    public productId: string,
    public attending: boolean,
    public guests?: number,
    public comments?: string,
    public _id?: string, // _id is present if editing or returning from DB
  ) { }
}
