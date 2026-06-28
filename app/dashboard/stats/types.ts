export type MonthBucket = {
  month: string       // 'YYYY-MM', oldest → newest
  reservations: number
  cancelled: number
  newCustomers: number
}
