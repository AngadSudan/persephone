import neo4j from "neo4j-driver";
import type { Driver } from "neo4j-driver";
interface UserObject {
  name: string;
  email: string;
  tagline: string;
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
    const query = `
      MERGE (n:User {email: $email})
      SET
        n.name = $name,
        n.tagline = $tagline
      RETURN n
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
        name: options.name,
        email: options.email,
        tagline: options.tagline,
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

  async getUserNode(username: string) {
    const query = `
        MATCH (n:User {name: $name})
        RETURN n;
      `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { name: username });
      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }

  async deleteUserNode(username: string) {
    const query = `
      MATCH (n:User {name: $name})
      DETACH DELETE n
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { name: username });
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
      MERGE (p:Project {name: $projectName})
      SET
        p.liveLink = $projectLiveLink,
        p.githubLink = $projectGithubLink
      RETURN p
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
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
  async getProjectNode(name: string) {
    const query = `
      MATCH(p:Project {name: $projectName})
      RETURN p
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { projectName: name });

      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.records;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async deleteProjectNode(name: string) {
    const query = `
      MATCH (p:Project {name: $projectName})
      DETACH DELETE p
    `;

    const session = this.client?.session();
    try {
      const result = await session?.run(query, { projectName: name });
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
      MATCH (s:Skill {name: $skillName})
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
      MERGE (j:JobListing {companyId: $companyId, name: $name})
      SET
        j.name = $name,
        j.stipend = $stipend
      RETURN j
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
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
  async getJobListing(companyId: string, name: string) {
    const query = `
      MATCH(j:JobListing {name: $jobName, companyId: $id})
      return j
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
        jobName: name,
        id: companyId,
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
  async deleteJobListing(companyId: string, name: string) {
    const query = `
    MATCH (j:JobListing {companyId: $companyId, name: $name})
    DETACH DELETE j
  `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { companyId, name });

      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.summary;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }

  async makeRelationBetweenUser(email1: string, email2: string) {
    const query = `
      MATCH (u1:User {email: $email1})
      MATCH (u2:User {email: $email2})
      MERGE (u1)-[:FRIEND]->(u2)
      RETURN u1, u2
    `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { email1, email2 });

      console.log(JSON.stringify(result?.records, null, 2));
      console.log(JSON.stringify(result?.summary, null, 2));

      return result?.summary;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await session?.close();
    }
  }
  async makeRelationBetweenUserandProject(
    userEmail: string,
    projectId: string,
  ) {
    const query = `
    MATCH (u:User {email: $userEmail})
    MATCH (p:Project {projectId: $projectId})
    MERGE (u)-[:CREATED]->(p)
    RETURN u, p
  `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, { userEmail, projectId });

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
    MATCH (p:Project {projectId: $projectId})
    MATCH (s:Skill {name: $skillName})
    MERGE (p)-[:USES]->(s)
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
  async makeRelationBetweenJobandSkills(
    companyId: string,
    jobName: string,
    skillName: string,
  ) {
    const query = `
    MATCH (j:JobListing {companyId: $companyId, name: $jobName})
    MATCH (s:Skill {name: $skillName})
    MERGE (j)-[:REQUIRES]->(s)
    RETURN j, s
  `;

    const session = this.client?.session();

    try {
      const result = await session?.run(query, {
        companyId,
        jobName,
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
}

export default GraphClient;
