const { runWithRetry } = require('../config/db');

const createJob = async (job) => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(
        `CREATE (j:Job {id: randomUUID(), title: $title, location: $location, salary: $salary}) RETURN j`,
        { title: job.title, location: job.location, salary: Number(job.salary) }
      );
      return result.records[0].get('j').properties;
    } finally {
      await session.close();
    }
  });
};

const listJobs = async () => {
  return runWithRetry(async (session) => {
    try {
      const result = await session.run(`MATCH (j:Job) RETURN j`);
      return result.records.map(record => record.get('j').properties);
    } finally {
      await session.close();
    }
  });
};

module.exports = { createJob, listJobs };
