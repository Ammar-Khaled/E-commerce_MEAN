const express = require("express");
const bcrypt = require("bcryptjs");
const { User, SellerProfile } = require("../data/models");
const { getNextId } = require("../utils/model.utils");
const { JWT_EXPIRES_IN, signAccessToken } = require("../utils/jwt.utils");

const router = express.Router();
const VALID_ROLES = ["customer", "seller", "admin"];
const BCRYPT_ROUNDS = 10;

const sanitizeUser = (userDoc) => {
    if (!userDoc) {
        return null;
    }

    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    delete user.__v;
    delete user._id;
    return user;
};

router.post("/register", async (req, res, next) => {
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

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const newUser = await User.create({
        id: await getNextId(User),
        name,
        email: normalizedEmail,
        phone: phone || null,
        password: hashedPassword,
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

    const token = signAccessToken(newUser);

    return res.status(201).json({
        message: "User registered successfully. Confirmation email flow is pending integration.",
        token,
        tokenType: "Bearer",
        expiresIn: JWT_EXPIRES_IN,
        user: sanitizeUser(newUser),
    });

});

router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        email: String(email).toLowerCase(),
        isActive: true,
        isDeleted: false,
    });

    if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials or inactive account" });
    }

    let isValidPassword = false;
    if (String(user.password).startsWith("$2")) {
        isValidPassword = await bcrypt.compare(password, user.password);
    } else {
        isValidPassword = user.password === password;
        if (isValidPassword) {
            user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
            await user.save();
        }
    }

    if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials or inactive account" });
    }

    const token = signAccessToken(user);

    return res.json({
        message: "Login successful",
        token,
        tokenType: "Bearer",
        expiresIn: JWT_EXPIRES_IN,
        user: sanitizeUser(user),
    });

});

router.post("/social/google", async (req, res, next) => {
    try {
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

        const token = signAccessToken(user);

        return res.json({
            message: "Google sign-in successful",
            token,
            tokenType: "Bearer",
            expiresIn: JWT_EXPIRES_IN,
            user: sanitizeUser(user),
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
