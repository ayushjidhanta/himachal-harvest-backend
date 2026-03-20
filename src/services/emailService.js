const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  };
};

export const sendOrderNotificationEmail = async ({ order, to }) => {
  let nodemailer;
  try {
    const mod = await import("nodemailer");
    nodemailer = mod.default ?? mod;
  } catch {
    return { sent: false, reason: "nodemailer is not installed" };
  }

  const smtp = getSmtpConfig();
  if (!smtp) return { sent: false, reason: "SMTP not configured" };
  if (!to) return { sent: false, reason: "Missing recipient email" };

  const from = process.env.EMAIL_FROM || smtp.auth.user;
  const subject = `New order ${order.orderId} (₹${order.totals.total})`;
  const itemsText = order.items
    .map((i) => `- ${i.title} x${i.quantity} @ ₹${i.unitPrice} = ₹${i.unitPrice * i.quantity}`)
    .join("\n");

  const body = [
    `Order ID: ${order.orderId}`,
    `Status: ${order.status}`,
    "",
    `Customer: ${order.customer.firstName} ${order.customer.lastName}`,
    `Email: ${order.customer.email}`,
    `Phone: ${order.customer.phone || "-"}`,
    "",
    `Ship to: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`,
    "",
    "Items:",
    itemsText,
    "",
    `Subtotal: ₹${order.totals.subtotal}`,
    `Total: ₹${order.totals.total}`,
  ].join("\n");

  const transporter = nodemailer.createTransport(smtp);
  await transporter.sendMail({ from, to, subject, text: body });
  return { sent: true };
};
