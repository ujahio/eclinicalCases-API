const { createUsersTable } = require('./users');

// Create table only once
export const initTables = async (dynamodb) => {
    await createUsersTable(dynamodb);
};

