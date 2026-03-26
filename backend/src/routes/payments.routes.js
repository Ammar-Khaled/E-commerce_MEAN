const express = require("express");

const router = express.Router();

const methods = [
    { code: "card", label: "Credit Card" },
    { code: "paypal", label: "PayPal" },
    { code: "cod", label: "Cash on Delivery" },
    { code: "wallet", label: "Wallet" },
];

router.get("/methods", (_req, res) => {
    return res.json({ methods });
});

router.post("/intent", (req, res) => {
    const { method, amount, currency = "USD" } = req.body;

    if (!method || !amount) {
        return res.status(400).json({ message: "method and amount are required" });
    }

    const exists = methods.some((item) => item.code === method);
    if (!exists) {
        return res.status(400).json({ message: "Unsupported payment method" });
    }

    return res.status(201).json({
        message: "Mock payment intent created",
        paymentIntent: {
            id: `pay_${Date.now()}`,
            method,
            amount: Number(amount),
            currency,
            status: "requires_confirmation",
        },
    });
});

module.exports = router;
