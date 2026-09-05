import { Hono } from "hono";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
} from "../controllers/customer.controller";

const customerRoutes = new Hono();

customerRoutes.get("/", listCustomers);

customerRoutes.post("/", createCustomer);

customerRoutes.patch("/:id", updateCustomer);

customerRoutes.delete("/:id", deleteCustomer);

export default customerRoutes;
