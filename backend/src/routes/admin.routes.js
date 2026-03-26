const express = require("express");
const {
    User,
    Product,
    Category,
    Order,
    PromoCode,
    Banner,
    getNextId,
} = require("../data/store");

const router = express.Router();

const requireAdmin = (req, res) => {
    if (!req.actor || !req.actor.isAuthenticated || req.actor.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return false;
    }

    return true;
};

router.get("/dashboard", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const [users, products, orders, categories] = await Promise.all([
            User.countDocuments({ isDeleted: false }),
            Product.countDocuments(),
            Order.countDocuments(),
            Category.countDocuments(),
        ]);

        return res.json({ users, products, orders, categories });
    } catch (error) {
        return next(error);
    }
});

router.get("/users", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const users = await User.find({}).lean();
        return res.json({ count: users.length, users });
    } catch (error) {
        return next(error);
    }
});

router.patch("/users/:id/restrict", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const user = await User.findOneAndUpdate(
            { id: Number(req.params.id) },
            { $set: { isActive: Boolean(req.body.isActive) } },
            { new: true }
        ).lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ message: "User status updated", user });
    } catch (error) {
        return next(error);
    }
});

router.delete("/users/:id", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const user = await User.findOneAndUpdate(
            { id: Number(req.params.id) },
            { $set: { isDeleted: true, isActive: false } },
            { new: true }
        ).lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ message: "User soft deleted", user });
    } catch (error) {
        return next(error);
    }
});

router.post("/categories", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "name is required" });
        }

        const category = await Category.create({ id: await getNextId(Category), name });
        return res.status(201).json({ message: "Category created", category });
    } catch (error) {
        return next(error);
    }
});

router.post("/products", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const { name, description, price, categoryId, stock = 0, sellerId = req.actor.userId } = req.body;

        if (!name || price === undefined || !categoryId) {
            return res.status(400).json({ message: "name, price, and categoryId are required" });
        }

        const category = await Category.findOne({ id: Number(categoryId) }).lean();
        if (!category) {
            return res.status(400).json({ message: "Invalid categoryId" });
        }

        const product = await Product.create({
            id: await getNextId(Product),
            name,
            description: description || "",
            price: Number(price),
            currency: "USD",
            categoryId: Number(categoryId),
            stock: Number(stock),
            sellerId: Number(sellerId),
            images: [],
        });

        return res.status(201).json({ message: "Product created", product });
    } catch (error) {
        return next(error);
    }
});

router.patch("/orders/:id/shipping", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const order = await Order.findOneAndUpdate(
            { id: Number(req.params.id) },
            { $set: { shippingStatus: req.body.shippingStatus || "processing" } },
            { new: true }
        ).lean();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json({ message: "Shipping status updated", order });
    } catch (error) {
        return next(error);
    }
});

router.get("/promos", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const promoCodes = await PromoCode.find({}).lean();
        return res.json({ count: promoCodes.length, promoCodes });
    } catch (error) {
        return next(error);
    }
});

router.post("/promos", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const { code, discountType = "percent", discountValue = 0 } = req.body;
        if (!code) {
            return res.status(400).json({ message: "code is required" });
        }

        const normalizedCode = String(code).toUpperCase();
        const existing = await PromoCode.findOne({ code: normalizedCode }).lean();
        if (existing) {
            return res.status(409).json({ message: "Promo code already exists" });
        }

        const promoCode = await PromoCode.create({
            code: normalizedCode,
            discountType,
            discountValue: Number(discountValue),
            isActive: true,
        });

        return res.status(201).json({ message: "Promo code created", promoCode });
    } catch (error) {
        return next(error);
    }
});

router.patch("/promos/:code/disable", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const promoCode = await PromoCode.findOneAndUpdate(
            { code: String(req.params.code).toUpperCase() },
            { $set: { isActive: false } },
            { new: true }
        ).lean();

        if (!promoCode) {
            return res.status(404).json({ message: "Promo code not found" });
        }

        return res.json({ message: "Promo code disabled", promoCode });
    } catch (error) {
        return next(error);
    }
});

router.get("/banners", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const banners = await Banner.find({}).lean();
        return res.json({ count: banners.length, banners });
    } catch (error) {
        return next(error);
    }
});

router.post("/banners", async (req, res, next) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const { title, image, isActive = true } = req.body;
        if (!title || !image) {
            return res.status(400).json({ message: "title and image are required" });
        }

        const banner = await Banner.create({
            id: await getNextId(Banner),
            title,
            image,
            isActive: Boolean(isActive),
        });

        return res.status(201).json({ message: "Banner created", banner });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
