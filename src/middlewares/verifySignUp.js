const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const dbClient = require('../services/dbClient');

exports.checkDuplicateUsernameOrEmail = async (req, res, next) => {
    const { email } = req.body;

    try {
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

        if (user) {
            return res.status(400).json({ error: "Username or email already exists" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error checking for duplicate username or email" });
    }
};