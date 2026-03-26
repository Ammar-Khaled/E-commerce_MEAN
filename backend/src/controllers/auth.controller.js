const { User, SellerProfile } = require("../data/models");
const { getNextId } = require("../utils/model.utils");

const VALID_ROLES = ["customer", "seller", "admin"];

const sanitizeUser = (userDoc) => {
    if (!userDoc) {
        return null;
    }

    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    delete user.__v;
    delete user._id;
    return user;
};

const register = async (req, res) => {
    const { name, email, phone, password, role = "customer" } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "name, email, and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
        return res.status(409).json({ message: "Email already exists" });
    }

    const normalizedRole = VALID_ROLES.includes(role) ? role : "customer";

    const newUser = await User.create({
        id: await getNextId(User),
        name,
        email: normalizedEmail,
        phone: phone || null,
        password,
        role: normalizedRole,
        address: null,
        paymentDetails: [],
        wishlist: [],
        loyaltyPoints: 0,
        isActive: true,
        isDeleted: false,
    });

    if (normalizedRole === "seller") {
        await SellerProfile.create({
            id: await getNextId(SellerProfile),
            userId: newUser.id,
            storeName: `${name} Store`,
            payoutMethod: "pending",
            isApproved: false,
        });
    }

    return res.status(201).json({
        message: "User registered successfully. Confirmation email flow is pending integration.",
        user: sanitizeUser(newUser),
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        email: String(email).toLowerCase(),
        password,
        isActive: true,
        isDeleted: false,
    });

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials or inactive account" });
    }

    return res.json({
        message: "Login successful",
        token: `mock-token-${user.id}`,
        user: sanitizeUser(user),
    });
};

const googleSocialLogin = async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ message: "email is required" });
    }

    const normalizedEmail = String(email).toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        user = await User.create({
            id: await getNextId(User),
            name: name || "Google User",
            email: normalizedEmail,
            phone: null,
            password: null,
            role: "customer",
            address: null,
            paymentDetails: [],
            wishlist: [],
            loyaltyPoints: 0,
            isActive: true,
            isDeleted: false,
        });
    }

    return res.json({
        message: "Google sign-in successful",
        token: `mock-google-token-${user.id}`,
        user: sanitizeUser(user),
    });
};

module.exports = {
    register,
    login,
    googleSocialLogin,
};
