import { v4 as uuidv4 } from "uuid";
import Product from "../model/product-schema.js";
import { asTrimmedString, badRequest, isNonEmptyString } from "../utils/validation.js";

export const getProducts = async (req, res) => {
  try {
    const data = await Product.find({});
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error?.message ?? "Internal Server Error" });
  }
};

export const getProductsById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({ id: id });

    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error?.message ?? "Internal Server Error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const payload = req.body ?? {};

    const id = asTrimmedString(payload.id) || uuidv4();
    const url = asTrimmedString(payload.url);
    const detailUrl = asTrimmedString(payload.detailUrl);

    const title = payload.title ?? {};
    const price = payload.price ?? {};

    const shortTitle = asTrimmedString(title.shortTitle);
    const longTitle = asTrimmedString(title.longTitle);

    const cost = Number(price.cost);
    const mrp = Number(price.mrp);

    const quantity = payload.quantity === undefined ? 1 : Number(payload.quantity);

    const description = asTrimmedString(payload.description);
    const discount = asTrimmedString(payload.discount);
    const tagline = asTrimmedString(payload.tagline);
    const seller = asTrimmedString(payload.seller);

    if (!isNonEmptyString(url)) return badRequest(res, "url is required");
    if (!isNonEmptyString(shortTitle)) return badRequest(res, "title.shortTitle is required");
    if (!Number.isFinite(cost) || cost < 0) return badRequest(res, "price.cost must be a number >= 0");
    if (!Number.isFinite(mrp) || mrp < 0) return badRequest(res, "price.mrp must be a number >= 0");
    if (!Number.isFinite(quantity) || quantity < 0) return badRequest(res, "quantity must be a number >= 0");

    const existing = await Product.findOne({ id }).lean();
    if (existing) {
      return res.status(409).json({ ok: false, error: { message: "Product id already exists" } });
    }

    const created = await Product.create({
      id,
      url,
      detailUrl: detailUrl || url,
      title: { shortTitle, longTitle: longTitle || shortTitle },
      price: { cost, mrp },
      quantity,
      description,
      discount,
      tagline,
      seller,
    });

    return res.status(201).json({ ok: true, data: created });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};

export const updateProductById = async (req, res) => {
  try {
    const id = asTrimmedString(req.params.id);
    if (!isNonEmptyString(id)) return badRequest(res, "id param is required");

    const payload = req.body ?? {};
    const update = {};

    if (payload.url !== undefined) {
      const url = asTrimmedString(payload.url);
      if (!isNonEmptyString(url)) return badRequest(res, "url must be a non-empty string");
      update.url = url;
    }

    if (payload.detailUrl !== undefined) update.detailUrl = asTrimmedString(payload.detailUrl);

    if (payload.title !== undefined) {
      const title = payload.title ?? {};
      const shortTitle = asTrimmedString(title.shortTitle);
      const longTitle = asTrimmedString(title.longTitle);
      if (!isNonEmptyString(shortTitle)) return badRequest(res, "title.shortTitle must be a non-empty string");
      update.title = { shortTitle, longTitle: longTitle || shortTitle };
    }

    if (payload.price !== undefined) {
      const price = payload.price ?? {};
      const cost = price.cost === undefined ? undefined : Number(price.cost);
      const mrp = price.mrp === undefined ? undefined : Number(price.mrp);
      if (cost !== undefined && (!Number.isFinite(cost) || cost < 0)) return badRequest(res, "price.cost must be a number >= 0");
      if (mrp !== undefined && (!Number.isFinite(mrp) || mrp < 0)) return badRequest(res, "price.mrp must be a number >= 0");

      const existing = await Product.findOne({ id }).lean();
      if (!existing) return res.status(404).json({ ok: false, error: { message: "Product not found" } });

      update.price = {
        cost: cost !== undefined ? cost : Number(existing?.price?.cost ?? 0),
        mrp: mrp !== undefined ? mrp : Number(existing?.price?.mrp ?? 0),
      };
    }

    if (payload.quantity !== undefined) {
      const quantity = Number(payload.quantity);
      if (!Number.isFinite(quantity) || quantity < 0) return badRequest(res, "quantity must be a number >= 0");
      update.quantity = quantity;
    }

    if (payload.description !== undefined) update.description = asTrimmedString(payload.description);
    if (payload.discount !== undefined) update.discount = asTrimmedString(payload.discount);
    if (payload.tagline !== undefined) update.tagline = asTrimmedString(payload.tagline);
    if (payload.seller !== undefined) update.seller = asTrimmedString(payload.seller);

    if (Object.keys(update).length === 0) return badRequest(res, "No updatable fields provided");

    const updated = await Product.findOneAndUpdate({ id }, { $set: update }, { new: true });
    if (!updated) return res.status(404).json({ ok: false, error: { message: "Product not found" } });

    return res.status(200).json({ ok: true, data: updated });
  } catch (error) {
    return res.status(500).json({ ok: false, error: { message: error?.message ?? "Internal Server Error" } });
  }
};
