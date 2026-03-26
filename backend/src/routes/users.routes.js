const express = require("express");
const { User, Product, Order, Review } = require("../data/store");

const router = express.Router();

const requireAuth = (req, res) => {
    if (!req.actor || !req.actor.isAuthenticated) {
        res.status(401).json({ message: "Authentication required. Provide Bearer token." });
        return false;
    }

    return true;
};

router.get("/me", (req, res) => {
    if (!requireAuth(req, res)) {
        return;
    }

    return res.json(req.actor.user);
});

router.patch("/me", async (req, res, next) => {
    try {
        if (!requireAuth(req, res)) {
            return;
        }

        const { name, address, paymentDetails, phone } = req.body;
        const update = {};

        if (name !== undefined) update.name = name;
        if (address !== undefined) update.address = address;
        if (phone !== undefined) update.phone = phone;
        if (paymentDetails !== undefined && Array.isArray(paymentDetails)) update.paymentDetails = paymentDetails;

        const user = await User.findOneAndUpdate({ id: req.actor.userId }, { $set: update }, { new: true }).lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ message: "Profile updated", user });
    } catch (error) {
        return next(error);
    }
});

router.get("/me/wishlist", async (req, res, next) => {
    try {
        if (!requireAuth(req, res)) {
            return;
        }

        const user = await User.findOne({ id: req.actor.userId }).lean();
        const wishlistProducts = await Product.find({ id: { $in: user ? user.wishlist : [] } }).lean();
        return res.json({ count: wishlistProducts.length, items: wishlistProducts });
    } catch (error) {
        return next(error);
    }
});

router.post("/me/wishlist/:productId", async (req, res, next) => {
    try {
        if (!requireAuth(req, res)) {
            return;
        }

        const productId = Number(req.params.productId);
        const product = await Product.findOne({ id: productId }).lean();

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const user = await User.findOneAndUpdate(
            { id: req.actor.userId },
            { $addToSet: { wishlist: productId } },
            { new: true }
        ).lean();

        return res.status(201).json({ message: "Added to wishlist", wishlist: user ? user.wishlist : [] });
    } catch (error) {
        return next(error);
    }
});

router.delete("/me/wishlist/:productId", async (req, res, next) => {
    try {
        if (!requireAuth(req, res)) {
            return;
        }

        const productId = Number(req.params.productId);
        const user = await User.findOneAndUpdate(
            { id: req.actor.userId },
            { $pull: { wishlist: productId } },
            { new: true }
        ).lean();

        return res.json({ message: "Removed from wishlist", wishlist: user ? user.wishlist : [] });
    } catch (error) {
        return next(error);
    }
});

router.get("/me/favorites", async (req, res, next) => {
    try {
        if (!requireAuth(req, res)) {
            return;
        }

        const user = await User.findOne({ id: req.actor.userId }).lean();
        const favorites = await Product.find({ id: { $in: user ? user.wishlist : [] } }).lean();
        return res.json({ count: favorites.length, items: favorites });
    } catch (error) {
        return next(error);
    }
});

router.get("/me/orders", async (req, res, next) => {
    try {
        if (!requireAuth(req, res)) {
            return;
        }

        const myOrders = await Order.find({ userId: req.actor.userId }).lean();
        return res.json({ count: myOrders.length, orders: myOrders });
    } catch (error) {
        return next(error);
    }
});

router.get("/me/reviews", async (req, res, next) => {
    try {
        if (!requireAuth(req, res)) {
            return;
        }

        const myReviews = await Review.find({ userId: req.actor.userId }).lean();
        return res.json({ count: myReviews.length, reviews: myReviews });
    } catch (error) {
        return next(error);
    }
});

router.get("/roles", (_req, res) => {
    return res.json({ roles: ["customer", "seller", "admin"] });
});

router.get("/all", async (_req, res, next) => {
    try {
        const activeUsers = await User.find({ isDeleted: false }).lean();
        return res.json({ count: activeUsers.length, users: activeUsers });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
