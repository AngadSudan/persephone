import neo4jClient from "../utils/neo4j";
class GraphService {
  async createUser(Id: string, userName: string, userEmail: string) {
    const userObj = {
      id: Id,
      name: userName,
      email: userEmail,
    };
    console.log("=============inside function");
    const user = await neo4jClient.createUserNode(userObj);
    if (!user) throw new Error("[NEO4j-QUERY-ERROR] - Unable to create User");
    console.log(user);
    console.log("=============outer function task over");
    return userObj;
  }

  async addUserProject(
    projectId: string,
    userId: string,
    skills: string[],
    projectName: string,
    projectLiveLink: string,
    projectGithubLink: string,
  ) {
    const user = await neo4jClient.getUserNode(userId);
    if (!user || user.length === 0)
      throw new Error("[NEO4J-QUERY-ERROR] - user not found in db");

    const projectNode = await neo4jClient.getProjectNode(projectId);
    if (projectNode && projectNode.length > 0) {
      throw new Error("[NEO4J-QUERY-ERROR]- project already added");
    }

    const skillNodePromises = [];
    for (let i = 0; i < skills.length; i++) {
      skillNodePromises[i] = neo4jClient.getSkill(skills[i]);
    }

    const data = await Promise.all(skillNodePromises);

    for (let i = 0; i < data.length; i++) {
      if (!data[i] || data[i]?.length === 0) {
        await neo4jClient.createSkill(skills[i]);
      }
    }

    const projectObject = {
      id: projectId,
      name: projectName,
      liveLink: projectLiveLink,
      githubLink: projectGithubLink,
    };
    const createdProject = await neo4jClient.createProjectNode(projectObject);

    //relations
    // skills
    for (let i = 0; i < skills.length; i++) {
      await neo4jClient.makeRelationBetweenProjectandSkills(
        projectId,
        skills[i],
      );
    }
    // user

    await neo4jClient.makeRelationBetweenUserandProject(userId, projectId);
  }

  async addJobListing(
    userId: string,
    skills: string[],
    jobId: string,
    companyId: string,
    jobName: string,
    jobStipend: string,
  ) {
    const user = await neo4jClient.getUserNode(userId);

    const jobListing = await neo4jClient.getJobListing(jobId);
    if (jobListing)
      throw new Error("[NEO4J-QUERY-ERROR]- JobListing already exists");

    const skillNodePromises = [];
    for (let i = 0; i < skills.length; i++) {
      skillNodePromises[i] = neo4jClient.getSkill(skills[i]);
    }

    const data = await Promise.all(skillNodePromises);

    for (let i = 0; i < data.length; i++) {
      if (!data[i] || data[i]?.length === 0) {
        await neo4jClient.createSkill(skills[i]);
      }
    }

    const JobObject = {
      id: jobId,
      companyId: companyId,
      name: jobName,
      stipend: jobStipend,
    };
    const createdJobListing = await neo4jClient.createJobListing(JobObject);

    for (let i = 0; i < skills.length; i++) {
      await neo4jClient.makeRelationBetweenJobandSkills(jobId, skills[i]);
    }

    return createdJobListing;
  }

  async addFriends(userId1: string, userId2: string) {
    const user1 = await neo4jClient.getUserNode(userId1);
    if (!user1 || user1.length === 0)
      throw new Error("[NEO4J-QUERY-ERROR] - User1 not found");

    const user2 = await neo4jClient.getUserNode(userId2);
    if (!user2 || user2.length === 0)
      throw new Error("[NEO4J-QUERY-ERROR] - User2 not found");

    const relationMade = await neo4jClient.makeRelationBetweenUser(
      userId1,
      userId2,
    );

    return relationMade;
  }

  // apply pagination here with PER_PAGE_SIZE = 15
  async getProjectRecommendation(pageNumber: number, userId: string) {
    const projects = await neo4jClient.getProjectRecommendation(
      userId,
      pageNumber,
    );

    if (!projects || projects.length === 0)
      throw new Error("[NEO4J-QUERY-ERROR] - Projects not found");

    const formattedProjects = [];

    for (let i = 0; i < projects.length; i++) {
      const node = projects[i]?.get("p").properties;

      formattedProjects.push({
        id: node.id,
        name: node.projectName,
        liveLink: node.liveLink,
        githubLink: node.githubLink,
      });
    }

    return formattedProjects;
  }
  async getJobRecommendation(pageNumber: number, userId: string) {
    const jobs = await neo4jClient.getJobRecommendation(userId, pageNumber);

    if (!jobs || jobs.length === 0)
      throw new Error("[NEO4J-QUERY-ERROR] - jobs not found");

    const formattedJobs = [];

    for (let i = 0; i < jobs.length; i++) {
      const node = jobs[i]?.get("j").properties;
      const score = jobs[i]?.get("score").toNumber();

      formattedJobs.push({
        id: node.id,
        name: node.name,
        stipend: node.stipend,
        companyId: node.companyId,
        score: score,
      });
    }

    return formattedJobs;
  }
  async getUserRecommendation(pageNumber: number, userId: string) {
    const users = await neo4jClient.getUserRecommendation(userId, pageNumber);
    if (!users) throw new Error("[NEO4J-QUERY-ERROR] - users not found in db");

    const formattedUsers = [];

    for (let i = 0; i < users.length; i++) {
      const node = users[i]?.get("rec").properties;

      formattedUsers.push({
        id: node.id,
        name: node.name,
        tagline: node.tagline,
      });
    }

    return formattedUsers;
  }
}

export default new GraphService();
