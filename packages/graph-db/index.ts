import neo4j from "neo4j-driver";
import type { Driver } from "neo4j-driver";
interface UserObject {
  name: string;
  email: string;
  tagline: string;
}

interface ProjectObject {
  name: string;
  liveLink: string;
  githubLink: string;
}

interface SkillObject {
  name: string;
}

interface JobObject {
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

  async createUserNode(username: string, options: UserObject) {}

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

  async deleteUserNode(username: string) {}
  async createProjectNode(name: string, options: ProjectObject) {}
  async getProjectNode(name: string) {}
  async deleteProjectNode(name: string) {}

  async getSkill(name: string) {}
  async createSkill(name: string) {}
  async deleteSkill(name: string) {}

  async createJobListing(name: string, options: JobObject) {}
  async getJobListing(name: string) {}
  async deleteJobListing(name: string) {}

  async makeRelationBetweenUser(user1: string, user2: string) {}
  async makeRelationBetweenUserandProject(
    username: string,
    projectName: string,
  ) {}
  async makeRelationBetweenProjectandSkills(
    projectName: string,
    skillName: string,
  ) {}
  async makeRelationBetweenJobandSkills(jobName: string, skillname: string) {}
}

export default GraphClient;
