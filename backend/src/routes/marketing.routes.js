const express = require("express");
const { PromoCode, Banner, User, NewsletterSubscriber } = require("../data/store");

const router = express.Router();

router.get("/promotions", async (_req, res, next) => {
    try {
        const [promoCodes, banners] = await Promise.all([
            PromoCode.find({ isActive: true }).lean(),
            Banner.find({ isActive: true }).lean(),
        ]);

        return res.json({ promoCodes, banners });
    } catch (error) {
        return next(error);
    }
});

router.post("/newsletter/subscribe", async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }

        const normalizedEmail = String(email).toLowerCase();

        await NewsletterSubscriber.updateOne(
            { email: normalizedEmail },
            { $set: { email: normalizedEmail } },
            { upsert: true }
        );

        return res.status(201).json({
            message: "Subscribed to newsletter",
            email: normalizedEmail,
        });
    } catch (error) {
        return next(error);
    }
});

router.post("/loyalty/reward", async (req, res, next) => {
    try {
        if (!req.actor || !req.actor.isAuthenticated || req.actor.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        const { userId, points = 0 } = req.body;
        const user = await User.findOneAndUpdate(
            { id: Number(userId) },
            { $inc: { loyaltyPoints: Number(points) } },
            { new: true }
        ).lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({
            message: "Loyalty points updated",
            userId: user.id,
            loyaltyPoints: user.loyaltyPoints,
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
