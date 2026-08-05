const { getSession } = require('../config/db');

const getFirstDegreeConnections = async (userId) => {
  const session = getSession();
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
};

const getNetwork = async (userId) => {
  const session = getSession();
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
};

const getReferrals = async (userId) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (u:User {id: $userId})-[:KNOWS]-(connection:User)-[:WORKS_AT]->(c:Company)
       RETURN DISTINCT c AS company, collect(connection) AS contacts`,
      { userId }
    );
    return result.records.map(record => ({
      company: record.get('company').properties,
      contacts: record.get('contacts').map(contact => contact.properties)
    }));
  } finally {
    await session.close();
  }
};

const getRecommendations = async (userId) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)<-[:HIRING_FOR]-(c:Company)
       OPTIONAL MATCH (u)-[:KNOWS]-(connection:User)-[:WORKS_AT]->(c)
       RETURN j AS job, c AS company, collect(s) AS matchedSkills, collect(DISTINCT connection) AS contacts
       ORDER BY size(matchedSkills) DESC, size(contacts) DESC`,
      { userId }
    );
    return result.records.map(record => ({
      job: record.get('job').properties,
      company: record.get('company').properties,
      matchedSkills: record.get('matchedSkills').map(s => s.properties),
      contacts: record.get('contacts').map(c => c.properties)
    }));
  } finally {
    await session.close();
  }
};

const getMutualConnections = async (user1Id, user2Id) => {
  const session = getSession();
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
};

const getSimilarSkills = async (userId) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(other:User)
       RETURN other, collect(s) AS sharedSkills, size(collect(s)) AS score
       ORDER BY score DESC
       LIMIT 10`,
      { userId }
    );
    return result.records.map(record => ({
      user: record.get('other').properties,
      sharedSkills: record.get('sharedSkills').map(s => s.properties),
      score: record.get('score').toInt()
    }));
  } finally {
    await session.close();
  }
};

module.exports = {
  getFirstDegreeConnections,
  getNetwork,
  getReferrals,
  getRecommendations,
  getMutualConnections,
  getSimilarSkills
};
