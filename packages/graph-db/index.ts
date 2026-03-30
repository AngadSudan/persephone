import neo4j from "neo4j-driver";
import type { Driver } from "neo4j-driver";
interface UserObject {
  id: string;
  name: string;
  email: string;
  // tagline: string;
}

interface ProjectObject {
  id: string;
  name: string;
  liveLink: string;
  githubLink: string;
}

interface SkillObject {
  name: string;
}

interface JobObject {
  id: string;
  companyId: string;
  name: string;
  stipend: string;
}

class GraphClient {
  url: string | null;
  isConnected: boolean;
  client: Driver | null;

  constructor(url: string) {
    this.url = url;
    this.isConnected = false;

    this.client = neo4j.driver(
      this.url!,
      neo4j.auth.basic("neo4j", "password"),
    );
  }

  async createUserNode(options: UserObject) {
    console.log("===========inside inner function ==========")
    const query = `
    MERGE (n:User {email: $email})
    SET
    n.id = $id,
    n.name = $name,
    n.tagline = $tagline
    RETURN n
    `;
    
    const session = this.client?.session();
    
    try {
      const result = await session?.run(query, {
        id: options.id,
        name: options.name,
        email: options.email,
        tagline: options.tagline || "default tagline",
      });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));
      
      return result?.records;
    } catch (error: any) {
      console.log(error);
      throw new Error(error.message);
    } finally {
      await session?.close();
      console.log("===========exiting inner function ==========")
    }
  }

  async getUserNode(userID: string) {
    const query = `
        MATCH (n:User {id: $id})
        RETURN n;
      `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { id: userID });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }

  async deleteUserNode(userId: string) {
    const query = `
      MATCH (n:User {id: $id})
      DETACH DELETE n
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { id: userId });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async createProjectNode(options: ProjectObject) {
    const query = `
      MERGE (p:Project {id: $id})
      SET
        p.projectName = $projectName,
        p.liveLink = $projectLiveLink,
        p.githubLink = $projectGithubLink
      RETURN p
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
        id: options.id,
        projectName: options.name,
        projectLiveLink: options.liveLink,
        projectGithubLink: options.githubLink,
      });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async getProjectNode(id: string) {
    const query = `
      MATCH(p:Project {id: $id})
      RETURN p
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { id: id });

      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async deleteProjectNode(id: string) {
    const query = `
      MATCH (p:Project {id: $id})
      DETACH DELETE p
    `;

    const session = this.client?.session();
    try {
      const result = await session?.run(query, { id: id });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }

  async getSkill(skillName: string) {
    const query = `
      MATCH(s:Skill {name: $name})
      return s
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { name: skillName });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async createSkill(skillName: string) {
    const query = `
      MERGE (s:Skill {name: $name})
      RETURN s
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { name: skillName });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async deleteSkill(skillName: string) {
    const query = `
      MATCH (s:Skill {name: $name})
      DETACH DELETE s
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { name: skillName });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }

  async createJobListing(options: JobObject) {
    const query = `
      MERGE (j:JobListing {id:$id})
      SET
        j.companyId = $companyId,
        j.name = $name,
        j.stipend = $stipend
      RETURN j
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
        id: options.id,
        companyId: options.companyId,
        name: options.name,
        stipend: options.stipend,
      });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async getJobListing(id: string) {
    const query = `
      MATCH(j:JobListing {id: $id})
      return j
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
        id: id,
      });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async deleteJobListing(id: string) {
    const query = `
    MATCH (j:JobListing {id: $id})
    DETACH DELETE j
  `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { id });

      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.summary;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }

  async makeRelationBetweenUser(id1: string, id2: string) {
    const query = `
      MATCH (u1:User {id: $id1})
      MATCH (u2:User {id: $id2})
      MERGE (u1)-[:FRIEND]->(u2)
      MERGE (u2)-[:FRIEND]->(u1)
      RETURN u1, u2
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { id1, id2 });

      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.summary;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async makeRelationBetweenUserandProject(userID: string, projectId: string) {
    const query = `
    MATCH (u:User {id: $userID})
    MATCH (p:Project {id: $projectId})
    MERGE (u)-[:CREATED]->(p)
    MERGE (p)-[:CREATED_BY]->(u)
    RETURN u, p
  `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { userID, projectId });

      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.summary;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async makeRelationBetweenProjectandSkills(
    projectId: string,
    skillName: string,
  ) {
    const query = `
    MATCH (p:Project {id: $projectId})
    MATCH (s:Skill {name: $skillName})
    MERGE (p)-[:HAS_SKILL]->(s)
    RETURN p, s
  `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { projectId, skillName });

      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.summary;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async makeRelationBetweenJobandSkills(jobId: string, skillName: string) {
    const query = `
    MATCH (j:JobListing {id: $jobId})
    MATCH (s:Skill {name: $skillName})
    MERGE (j)-[:REQUIRES]->(s)
    RETURN j, s
  `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
        jobId,
        skillName,
      });

      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.summary;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }

  // recommendation controllers to be made here
  async getUserRecommendation(userID: string, pageNumber: number) {
    const pageSize = 10;
    const skip = (pageNumber - 1) * pageSize;

    const query = `
      MATCH (u:User {id: $userID})-[:FRIEND]->(:User)-[:FRIEND]->(rec:User)
      WHERE rec.id <> $userID
      AND NOT (u)-[:FRIEND]->(rec)
      RETURN DISTINCT rec
      SKIP $skip
      LIMIT $limit
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
        userID,
        skip: neo4j.int(skip),
        limit: neo4j.int(pageSize),
      });

      return result?.records;
    } finally {
      await session?.close();
    }
  }

  async getProjectRecommendation(userId: string, pageNumber: number) {
    const pageSize = 10;
    const skip = (pageNumber - 1) * pageSize;

    const query = `
    MATCH (u:User {id: $userId})-[:FRIEND]->(f:User)
    MATCH (f)-[:CREATED]->(p:Project)
    RETURN DISTINCT p
    SKIP $skip
    LIMIT $limit
  `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
        userId,
        skip: neo4j.int(skip),
        limit: neo4j.int(pageSize),
      });

      return result?.records;
    } finally {
      await session?.close();
    }
  }
  async getJobRecommendation(userId: string, pageNumber: number) {
    const pageSize = 10;
    const skip = (pageNumber - 1) * pageSize;

    const query = `
    MATCH (u:User {id: $userId})-[:CREATED]->(p:Project)-[:HAS_SKILL]->(s:Skill)
    MATCH (j:JobListing)-[:REQUIRES]->(s)
    RETURN j, COUNT(s) AS score
    ORDER BY score DESC
    SKIP $skip
    LIMIT $limit
  `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
        userId,
        skip: neo4j.int(skip),
        limit: neo4j.int(pageSize),
      });

      return result?.records;
    } finally {
      await session?.close();
    }
  }
}

export default GraphClient;
