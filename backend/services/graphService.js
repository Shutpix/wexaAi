const { runWithRetry } = require('../config/db');

const getFirstDegreeConnections = async (userId) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId})-[:KNOWS]->(connection:User)
         RETURN connection`,
        { userId }
      );
      return result.records.map(record => record.get('connection').properties);
    } finally {
      await session.close();
    }
  });
};

const getNetwork = async (userId) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId})-[:KNOWS*2..3]-(connection:User)
         WHERE u <> connection AND NOT (u)-[:KNOWS]-(connection)
         RETURN DISTINCT connection`,
        { userId }
      );
      return result.records.map(record => record.get('connection').properties);
    } finally {
      await session.close();
    }
  });
};

const getReferrals = async (userId) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId})-[:KNOWS]-(connection:User)-[:WORKS_AT]->(c:Company)
         RETURN DISTINCT c AS company, collect(connection) AS contacts`,
        { userId }
      );
      return result.records.map(record => ({
        company: record.get('company').properties,
        contacts: record.get('contacts').map(contact => contact.properties),
      }));
    } finally {
      await session.close();
    }
  });
};

const getRecommendations = async (userId) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)<-[:HIRING_FOR]-(c:Company)
         WITH u, j, c, collect(DISTINCT s) AS matchedSkills
         OPTIONAL MATCH (u)-[:KNOWS]-(contact:User)-[:WORKS_AT]->(c)
         RETURN j AS job, c AS company, matchedSkills, collect(DISTINCT contact) AS contacts
         ORDER BY size(matchedSkills) DESC`,
        { userId }
      );
      return result.records.map(record => ({
        job: record.get('job').properties,
        company: record.get('company').properties,
        matchedSkills: record.get('matchedSkills').map(s => s.properties),
        contacts: record.get('contacts').map(c => c.properties),
      }));
    } finally {
      await session.close();
    }
  });
};

const getMutualConnections = async (user1Id, user2Id) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `MATCH (u1:User {id: $user1Id})-[:KNOWS]-(mutual:User)-[:KNOWS]-(u2:User {id: $user2Id})
         RETURN DISTINCT mutual`,
        { user1Id, user2Id }
      );
      return result.records.map(record => record.get('mutual').properties);
    } finally {
      await session.close();
    }
  });
};

const getSimilarSkills = async (userId) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(other:User)
         WHERE u <> other
         RETURN other, collect(s) AS sharedSkills, size(collect(s)) AS score
         ORDER BY score DESC
         LIMIT 10`,
        { userId }
      );
      return result.records.map(record => ({
        user: record.get('other').properties,
        sharedSkills: record.get('sharedSkills').map(s => s.properties),
        score: record.get('score'),
      }));
    } finally {
      await session.close();
    }
  });
};

module.exports = {
  getFirstDegreeConnections,
  getNetwork,
  getReferrals,
  getRecommendations,
  getMutualConnections,
  getSimilarSkills,
};
