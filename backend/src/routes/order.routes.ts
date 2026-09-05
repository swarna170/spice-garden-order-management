import { Hono } from "hono";

import {
  addItem,
  createOrder,
  deleteItem,
  getOrder,
  listOrders,
  updateStatus,
} from "../controllers/order.controller";

const orderRoutes = new Hono();

orderRoutes.get("/", listOrders);

orderRoutes.get("/:id", getOrder);

orderRoutes.post("/", createOrder);

orderRoutes.patch(
  "/:id/status",
  updateStatus
);

orderRoutes.post(
  "/:id/items",
  addItem
);

orderRoutes.delete(
  "/:id/items/:itemId",
  deleteItem
);

export default orderRoutes;
