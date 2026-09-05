import type { Customer } from "./order";

export type { Customer };

export interface CreateCustomerInput {
  name: string;
  email?: string | null;
  phone: string;
}
