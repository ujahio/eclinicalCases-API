const { createUsersTable } = require('./users.ts');

// Create table only once
const initTables = async (dynamodb) => {
    await createUsersTable(dynamodb);
};

module.exports = { initTables };
