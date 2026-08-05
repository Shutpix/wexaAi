const { getSession } = require('../config/db');

const createCompany = async (company) => {
  const session = getSession();
  try {
    const result = await session.run(
      `CREATE (c:Company {id: randomUUID(), name: $name, location: $location})
       RETURN c`,
      { name: company.name, location: company.location }
    );
    return result.records[0].get('c').properties;
  } finally {
    await session.close();
  }
};

const listCompanies = async () => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (c:Company) RETURN c`
    );
    return result.records.map(record => record.get('c').properties);
  } finally {
    await session.close();
  }
};

module.exports = {
  createCompany,
  listCompanies
};
