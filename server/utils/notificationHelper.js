const db = require("../config/db").promise();

async function createNotification(
    userId,
    type,
    title,
    message
) {
    try {
        await db.query(
            `
            INSERT INTO notifications
            (
                user_id,
                type,
                title,
                message
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                userId,
                type,
                title,
                message
            ]
        );

        return true;
    } catch (error) {
        console.error(
            "Create notification error:",
            error
        );

        return false;
    }
}

module.exports = {
    createNotification
};