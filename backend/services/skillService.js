const { getSession } = require('../config/db');

const createSkill = async (skill) => {
  const session = getSession();
  try {
    const result = await session.run(
      `CREATE (s:Skill {id: randomUUID(), name: $name})
       RETURN s`,
      { name: skill.name }
    );
    return result.records[0].get('s').properties;
  } finally {
    await session.close();
  }
};

const listSkills = async () => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (s:Skill) RETURN s`
    );
    return result.records.map(record => record.get('s').properties);
  } finally {
    await session.close();
  }
};

module.exports = {
  createSkill,
  listSkills
};
