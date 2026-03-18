import neo4jClient from "../utils/neo4j";
class GraphService {
    async addUserProject(projectId:string,userId:string,skills:string[], projectName:string, projectLiveLink:string, projectGithubLink:string ){
      const user = await neo4jClient.getUserNode(userId);
      if(!user) throw new Error("[NEO4J-QUERY-ERROR] - user not found in db");


      const projectNode = await neo4jClient.getProjectNode(projectId);
      if(projectNode){
        throw new Error("[NEO4J-QUERY-ERROR]- project already added")
      }

      const skillNodePromises = [];
      for(let i=0;i<skills.length;i++){
        skillNodePromises[i] = neo4jClient.getSkill(skills[i]);
      }

      const data = await Promise.all(skillNodePromises);

      for(let i=0;i<data.length;i++){
        if(!data[i]){
            await neo4jClient.createSkill(skills[i]);
        }
      }

      const projectObject = {
        id: projectId,
        name: projectName,
        liveLink: projectLiveLink,
        githubLink: projectGithubLink
      }
      const createdProject = await neo4jClient.createProjectNode(projectObject);

      //relations 
      // skills
      for(let i=0;i<skills.length;i++){
          await neo4jClient.makeRelationBetweenProjectandSkills(projectId, skills[i]) 
        }
      // user

      await neo4jClient.makeRelationBetweenUserandProject(userId,projectId);
    }

    async addJobListing(userId:string,skills:string[],jobId:string, companyId:string, jobName:string, jobStipend:string){
      const user = await neo4jClient.getUserNode(userId);
      if(!user) throw new Error("[NEO4J-QUERY-ERROR] - user not found in db");

      const jobListing = await neo4jClient.getJobListing(jobId);
      if(jobListing) throw new Error("[NEO4J-QUERY-ERROR]- JobListing already exists");

      const skillNodePromises = [];
      for(let i=0;i<skills.length;i++){
        skillNodePromises[i] = neo4jClient.getSkill(skills[i]);
      }

      const data = await Promise.all(skillNodePromises);

      for(let i=0;i<data.length;i++){
        if(!data){
          await neo4jClient.createSkill(skills[i]);
        }
      }

      const JobObject = {
        id: jobId,
        companyId:companyId,
        name: jobName,
        stipend: jobStipend,
      }
      const createdJobListing = await neo4jClient.createJobListing(JobObject);

      for(let i=0;i<skills.length;i++){
        await neo4jClient.makeRelationBetweenJobandSkills(jobId, skills[i]);
      }

      return createdJobListing;
    }

    async addFriends(userId1:string, userId2:string){
      const user1 = await neo4jClient.getUserNode(userId1);
      if(!user1) throw new Error("[NEO4J-QUERY-ERROR] - User1 not found");

      const user2 = await neo4jClient.getUserNode(userId2);
      if(user2) throw new Error("[NEO4J-QUERY-ERROR] - User2 not found");

      const relationMade = await neo4jClient.makeRelationBetweenUser(userId1,userId2);

      return relationMade;
    }



    // apply pagination here with PER_PAGE_SIZE = 15
    async getProjectRecommendation(pageNumber:number,projectId:string){
        await neo4jClient.getProjectRecommendation(projectId,pageNumber)
    }
    async getJobRecommendation(pageNumber:number,projectId:string){
        await neo4jClient.getUserRecommendation(projectId,pageNumber)
    }
    async getUserRecommendation(pageNumber:number,projectId:string){
        await neo4jClient.getJobRecommendation(projectId,pageNumber)
    }
}

export default new GraphService();