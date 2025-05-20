import { type Kysely } from "kysely";
import { type GraphDB } from "~/server/db";

export class TagModel {
  constructor(private db: Kysely<GraphDB>) {}

  async createTag(name: string) {
    return this.db
      .insertInto("tags")
      .values({ tag: name })
      .returning(["id", "tag"])
      .executeTakeFirstOrThrow();
  }

  async getTagByName(name: string) {
    return this.db
      .selectFrom("tags")
      .selectAll()
      .where("tag", "=", name)
      .executeTakeFirst();
  }

  async listTags() {
    return this.db
      .selectFrom("tags")
      .orderBy((eb) => eb.fn("LOWER", ["tag"]), "asc")
      .selectAll()
      .execute();
  }

  async addTagToPool(poolId: number, tagName: string) {
    let tag = await this.getTagByName(tagName);
    if (!tag) {
      tag = await this.createTag(tagName);
    }
    await this.db
      .insertInto("swap_pool_tags")
      .values({
        swap_pool: poolId,
        tag: tag.id,
      })
      .execute();
  }

  async updatePoolTags(poolId: number, tags: string[]) {
    const existingTags = await this.db
      .selectFrom("swap_pool_tags")
      .innerJoin("tags", "swap_pool_tags.tag", "tags.id")
      .where("swap_pool_tags.swap_pool", "=", poolId)
      .select(["tags.tag as tag_name", "tags.id as tag_id"])
      .execute();

    const existingTagNames = existingTags.map((tag) => tag.tag_name);
    const tagsToAdd = tags.filter((tag) => !existingTagNames.includes(tag));
    const tagsToRemove = existingTags.filter(
      (tag) => !tags.includes(tag.tag_name)
    );

    // Add new tags
    for (const tagName of tagsToAdd) {
      await this.addTagToPool(poolId, tagName);
    }

    // Remove tags
    for (const tag of tagsToRemove) {
      await this.db
        .deleteFrom("swap_pool_tags")
        .where("swap_pool", "=", poolId)
        .where("tag", "=", tag.tag_id)
        .execute();
    }
  }

  async getPoolTags(poolId: number) {
    const tags = await this.db
      .selectFrom("swap_pool_tags")
      .innerJoin("tags", "swap_pool_tags.tag", "tags.id")
      .where("swap_pool_tags.swap_pool", "=", poolId)
      .select("tags.tag")
      .execute();

    return tags.map((t) => t.tag);
  }
}
