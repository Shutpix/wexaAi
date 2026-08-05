const { runWithRetry } = require('../config/db');

const createUser = async (user) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `CREATE (u:User {id: randomUUID(), name: $name, email: $email, experience: $experience})
         RETURN u`,
        { name: user.name, email: user.email, experience: Number(user.experience) }
      );
      return result.records[0].get('u').properties;
    } finally {
      await session.close();
    }
  });
};

const getUser = async (id) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `MATCH (u:User {id: $id}) RETURN u`,
        { id }
      );
      if (result.records.length === 0) return null;
      return result.records[0].get('u').properties;
    } finally {
      await session.close();
    }
  });
};

const listUsers = async () => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(`MATCH (u:User) RETURN u`);
      return result.records.map(record => record.get('u').properties);
    } finally {
      await session.close();
    }
  });
};

const updateUser = async (id, user) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `MATCH (u:User {id: $id})
         SET u.name = $name, u.email = $email, u.experience = $experience
         RETURN u`,
        { id, name: user.name, email: user.email, experience: Number(user.experience) }
      );
      if (result.records.length === 0) return null;
      return result.records[0].get('u').properties;
    } finally {
      await session.close();
    }
  });
};

const deleteUser = async (id) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `MATCH (u:User {id: $id}) DETACH DELETE u RETURN count(u) AS count`,
        { id }
      );
      return result.records[0].get('count') > 0;
    } finally {
      await session.close();
    }
  });
};

module.exports = { createUser, getUser, listUsers, updateUser, deleteUser };
