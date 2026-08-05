const { faker } = require('@faker-js/faker');
const { initDriver, closeDriver } = require('../config/db');

const NUM_USERS = 20;
const NUM_COMPANIES = 8;
const NUM_SKILLS = 20;
const NUM_JOBS = 15;

const SKILLS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", 
  "Java", "Go", "AWS", "Docker", "Kubernetes", 
  "GraphQL", "MongoDB", "PostgreSQL", "Neo4j", "Redis", 
  "Machine Learning", "Data Science", "UI/UX Design", "Product Management", "Agile"
];

const seed = async () => {
  const driver = initDriver();
  const session = driver.session();

  try {
    console.log('Clearing existing data...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('Generating Users...');
    const users = Array.from({ length: NUM_USERS }).map(() => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      experience: faker.number.int({ min: 1, max: 20 })
    }));

    await session.run(
      `UNWIND $users AS user
       CREATE (u:User {id: user.id, name: user.name, email: user.email, experience: user.experience})`,
      { users }
    );

    console.log('Generating Companies...');
    const companies = Array.from({ length: NUM_COMPANIES }).map(() => ({
      id: faker.string.uuid(),
      name: faker.company.name(),
      location: faker.location.city()
    }));

    await session.run(
      `UNWIND $companies AS company
       CREATE (c:Company {id: company.id, name: company.name, location: company.location})`,
      { companies }
    );

    console.log('Generating Skills...');
    const skills = SKILLS.slice(0, NUM_SKILLS).map(name => ({
      id: faker.string.uuid(),
      name
    }));

    await session.run(
      `UNWIND $skills AS skill
       CREATE (s:Skill {id: skill.id, name: skill.name})`,
      { skills }
    );

    console.log('Generating Jobs...');
    const jobs = Array.from({ length: NUM_JOBS }).map(() => ({
      id: faker.string.uuid(),
      title: faker.person.jobTitle(),
      location: faker.location.city(),
      salary: faker.number.int({ min: 60000, max: 200000 })
    }));

    for (const job of jobs) {
      const company = faker.helpers.arrayElement(companies);
      await session.run(
        `MATCH (c:Company {id: $companyId})
         CREATE (j:Job {id: $job.id, title: $job.title, location: $job.location, salary: $job.salary})
         CREATE (c)-[:HIRING_FOR]->(j)`,
        { companyId: company.id, job }
      );
    }

    console.log('Generating Relationships...');

    // User KNOWS User
    for (const user of users) {
      const numConnections = faker.number.int({ min: 2, max: 5 });
      const connections = faker.helpers.arrayElements(users.filter(u => u.id !== user.id), numConnections);
      
      for (const connection of connections) {
        await session.run(
          `MATCH (u1:User {id: $u1Id}), (u2:User {id: $u2Id})
           MERGE (u1)-[:KNOWS]->(u2)
           MERGE (u2)-[:KNOWS]->(u1)`,
          { u1Id: user.id, u2Id: connection.id }
        );
      }
    }

    // User WORKS_AT Company
    for (const user of users) {
      if (faker.datatype.boolean({ probability: 0.8 })) {
        const company = faker.helpers.arrayElement(companies);
        await session.run(
          `MATCH (u:User {id: $userId}), (c:Company {id: $companyId})
           CREATE (u)-[:WORKS_AT]->(c)`,
          { userId: user.id, companyId: company.id }
        );
      }
    }

    // User HAS_SKILL Skill
    for (const user of users) {
      const numSkills = faker.number.int({ min: 3, max: 7 });
      const userSkills = faker.helpers.arrayElements(skills, numSkills);
      
      for (const skill of userSkills) {
        await session.run(
          `MATCH (u:User {id: $userId}), (s:Skill {id: $skillId})
           CREATE (u)-[:HAS_SKILL]->(s)`,
          { userId: user.id, skillId: skill.id }
        );
      }
    }

    // Job REQUIRES Skill
    for (const job of jobs) {
      const numSkills = faker.number.int({ min: 2, max: 5 });
      const jobSkills = faker.helpers.arrayElements(skills, numSkills);
      
      for (const skill of jobSkills) {
        await session.run(
          `MATCH (j:Job {id: $jobId}), (s:Skill {id: $skillId})
           CREATE (j)-[:REQUIRES]->(s)`,
          { jobId: job.id, skillId: skill.id }
        );
      }
    }

    console.log('Seed completed successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await session.close();
    await closeDriver();
  }
};

seed();
