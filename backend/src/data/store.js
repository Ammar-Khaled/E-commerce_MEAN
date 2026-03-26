const {
    User,
    Category,
    Product,
    Review,
    SellerProfile,
    Order,
    Cart,
    PromoCode,
    Banner,
    Notification,
    NewsletterSubscriber,
} = require("./models");

const getNextId = async (Model) => {
    const latest = await Model.findOne({}, { id: 1 }).sort({ id: -1 }).lean();
    return latest ? latest.id + 1 : 1;
};

const findUserById = async (id) => {
    return User.findOne({ id: Number(id) }).lean();
};

const findProductById = async (id) => {
    return Product.findOne({ id: Number(id) }).lean();
};

const getCart = async (ownerKey) => {
    let cart = await Cart.findOne({ ownerKey });
    if (!cart) {
        cart = await Cart.create({ ownerKey, items: [], promoCode: null });
    }

    return cart;
};

module.exports = {
    User,
    Category,
    Product,
    Review,
    SellerProfile,
    Order,
    Cart,
    PromoCode,
    Banner,
    Notification,
    NewsletterSubscriber,
    getNextId,
    findUserById,
    findProductById,
    getCart,
};
