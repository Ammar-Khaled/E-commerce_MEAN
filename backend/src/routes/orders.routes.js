const express = require("express");
const { Order, Notification, getNextId } = require("../data/store");

const router = express.Router();

const canViewOrder = (order, actor) => {
    if (!actor || !actor.isAuthenticated) {
        return false;
    }

    if (actor.role === "admin") {
        return true;
    }

    if (order.userId === actor.userId) {
        return true;
    }

    return order.items.some((item) => item.sellerId === actor.userId);
};

router.get("/", async (req, res, next) => {
    try {
        const actor = req.actor;

        if (!actor || !actor.isAuthenticated) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (actor.role === "admin") {
            const orders = await Order.find({}).lean();
            return res.json({ count: orders.length, orders });
        }

        if (actor.role === "seller") {
            const sellerOrders = await Order.find({ "items.sellerId": actor.userId }).lean();
            return res.json({ count: sellerOrders.length, orders: sellerOrders });
        }

        const customerOrders = await Order.find({ userId: actor.userId }).lean();
        return res.json({ count: customerOrders.length, orders: customerOrders });
    } catch (error) {
        return next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const orderId = Number(req.params.id);
        const order = await Order.findOne({ id: orderId }).lean();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!canViewOrder(order, req.actor)) {
            return res.status(403).json({ message: "Not allowed to view this order" });
        }

        return res.json(order);
    } catch (error) {
        return next(error);
    }
});

router.patch("/:id/status", async (req, res, next) => {
    try {
        const actor = req.actor;
        if (!actor || !actor.isAuthenticated) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const orderId = Number(req.params.id);
        const { status } = req.body;
        const allowedStatuses = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findOne({ id: orderId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const isAdmin = actor.role === "admin";
        const isSellerOnOrder = order.items.some((item) => item.sellerId === actor.userId);

        if (!isAdmin && !isSellerOnOrder) {
            return res.status(403).json({ message: "Only admin or order seller can update status" });
        }

        order.status = status;
        order.updatedAt = new Date().toISOString();
        await order.save();

        if (order.userId) {
            await Notification.create({
                id: await getNextId(Notification),
                userId: order.userId,
                type: "order-status",
                message: `Order #${order.id} status updated to ${status}`,
                createdAt: new Date().toISOString(),
            });
        }

        return res.json({ message: "Order status updated", order });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
