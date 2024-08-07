const jwt = require('jsonwebtoken');
const dbClient = require('../services/dbClient');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb"); 7
const { updateUserPassword, generateOtp, storeOtpInDb, getOtpFromDb, encryptPassword, decryptPassword } = require('../utils/api_utils');

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

exports.signup = async (req, res) => {
    console.log("heyy", req.body)
    const { firstname, lastname, email, password, roles } = req.body;

    if (!firstname) {
        return res.status(400).json({ error: '"firstname" must be a string' });
    } else if (!lastname || typeof lastname !== "string") {
        return res.status(400).json({ error: '"lastname" must be a string' });
    } else if (!email || typeof email !== "string") {
        return res.status(400).json({ error: '"email" must be a string' });
    } else if (!password || typeof password !== "string") {
        return res.status(400).json({ error: '"password" must be a string' });
    }

    let originalPassword = decryptPassword(password, process.env.secretKey);
    const hashedPassword = bcrypt.hashSync(originalPassword, 10);
    const userId = uuidv4();
    const created_on = new Date(Date.now()).toISOString();

    const user = {
        id: userId,
        firstname,
        lastname,
        email,
        password: hashedPassword,
        created_on,
        status: 'active',
        signUpLevel: 1,
        paymentStatus: 'inactive',
        roles: roles || ['user'],
    };

    const params = {
        TableName: "Users",
        Item: user,
    };

    try {
        const command = new PutCommand(params);
        const result = await dbClient.send(command);
        console.log("result: ", result)

        // Remove password from the user object before sending response
        delete user.password;

        res.status(201).json({
            message: 'User was registered successfully!',
            data: user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Could not create user: ${error}` });
    }
};


exports.signin = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: '"email" is required' });
    } else if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: '"email" must be a valid email address' });
    } else if (!password || typeof password !== "string") {
        return res.status(400).json({ error: '"password" must be a string' });
    }

    try {
        let originalPassword = decryptPassword(password, process.env.secretKey);

        const params = {
            TableName: "Users",
            FilterExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": email,
            },
        };

        const command = new ScanCommand(params);
        const result = await dbClient.send(command);

        const user = result.Items[0];

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const hashedPassword = user.password;
        const isValid = bcrypt.compareSync(originalPassword, hashedPassword);

        if (!isValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const token = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user.UserID,
                email: user.email,
                roles: user.roles,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not login: " + error });
    }
};

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateOtp();
        console.log("\n Your OTP is: ", otp + "\n");
        await storeOtpInDb(email, otp);
        res.status(200).json({
            message: "OTP sent to your email. Please verify and reset password.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not send OTP: " + error });
    }
};

exports.verifyOtpAndResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        let originalPassword = decryptPassword(newPassword, process.env.secretKey);
        const storedOtp = await getOtpFromDb(email);
        const hashedPassword = bcrypt.hashSync(originalPassword, 4);

        if (otp !== storedOtp) {
            return res.status(401).json({ error: "Invalid OTP" });
        }
        await updateUserPassword(email, hashedPassword);
        res.status(200).json({
            message: "Password reset successfully!",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not reset password: " + error });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const params = {
            TableName: "Users",
        };

        const command = new ScanCommand(params);
        const result = await dbClient.send(command);

        const users = result.Items;

        res.status(200).json({
            message: "Users retrieved successfully!",
            data: users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not retrieve users: " + error });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const email = req.validatedUser.email;
        const { newPassword } = req.body;
        let originalPassword = decryptPassword(newPassword, process.env.secretKey);
        const hashedPassword = bcrypt.hashSync(originalPassword, 4);

        const updatedUser = await updateUserPassword(email, hashedPassword);
        res.status(200).json({
            message: "Password updated successfully!",
            data: updatedUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not update password: " + error });
    }
};