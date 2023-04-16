import { createUsersTable } from './users';

// Create table only once
export const initTables = async (dynamodb) => {
  try {
    await createUsersTable(dynamodb);
  } catch (error) {
    throw new Error('error creating dynamo db table')
  }
};