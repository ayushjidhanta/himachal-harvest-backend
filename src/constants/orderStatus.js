export const ORDER_STATUS = Object.freeze({
  CREATED: "created",
  CONFIRMED: "confirmed",
  DISPATCHED: "dispatched",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
});

export const ORDER_STATUS_VALUES = Object.freeze(Object.values(ORDER_STATUS));
