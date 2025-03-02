import { Struct } from "@strapi/types";
import { masterContents } from "./master";
import { defaultUploadPermission } from "./uploadRole";

export function generateName(
  collection: string,
  prefix: string,
  toLowerCase = false
) {
  const result = `${prefix}-${collection}`;
  return toLowerCase ? result.toLowerCase() : result;
}

export async function generateContentType(prefix: string) {
  const contentTypes = await Promise.all(
    Object.entries(masterContents).map(async ([content, { api, populate }]) => {
      const masterContent = strapi.contentTypes[api];

      if (!masterContent) {
        console.log(`Content type ${content} does not exist.`);
        return null;
      }

      const obj = {
        components: [],
        contentType: {
          draftAndPublish: masterContent.options?.draftAndPublish ?? true,
          displayName: generateName(
            masterContent.info?.displayName ?? content,
            prefix
          ),
          singularName: generateName(
            masterContent.info?.singularName ?? content,
            prefix,
            true
          ),
          pluralName: generateName(
            masterContent.info?.pluralName ?? content + "s",
            prefix,
            true
          ),
          description: `Auto generated from master ${content}`,
          pluginOptions: masterContent.pluginOptions ?? {},
          kind: masterContent.kind,
          collectionName: generateName(
            masterContent.collectionName ?? content,
            prefix,
            true
          ),
          attributes: masterContent.attributes ?? {},
        },
      };

      return obj;
    })
  );

  console.log();

  await strapi
    .plugin("content-type-builder")
    .services["content-types"].createContentTypes(contentTypes);
}

export async function createRoleAndUser(
  companyName: string,
  prefix: string,
  companyEmail: string,
  roleName: string,
  password: string
) {
  // Define permissions
  const contents = Object.entries(masterContents).map(([coll, _]) => {
    const api = `api::${generateName(coll, prefix, true)}.${generateName(coll, prefix, true)}`;
    return strapi.contentTypes[api];
  });

  if (contents.length === 0) {
    throw new Error("No content types found.");
  }

  // Define allowed access actions
  const allowed_access = ["create", "read", "update", "delete", "publish"];
  const permissions = [];

  defaultUploadPermission.forEach(async (data) => {
    let existingPermission = await strapi.db
      .query("admin::permission")
      .findOne({
        where: {
          action: data.action,
          subject: data.subject,
        },
      });

    if (existingPermission) {
      await strapi.db.query("admin::permission").update({
        where: { id: existingPermission.id },
        data,
      });
    } else {
      existingPermission = await strapi.db
        .query("admin::permission")
        .create({ data });
    }

    permissions.push(existingPermission.id);
  });

  for (const content of contents) {
    for (const access of allowed_access) {
      try {
        const data = {
          action: `plugin::content-manager.explorer.${access}`,
          subject: `${content.uid}`,
          conditions: [],
          properties: {
            fields: Object.keys(content.attributes),
          },
        };

        let existingPermission = await strapi.db
          .query("admin::permission")
          .findOne({
            where: {
              action: data.action,
              subject: data.subject,
            },
          });

        if (existingPermission) {
          await strapi.db.query("admin::permission").update({
            where: { id: existingPermission.id },
            data,
          });
        } else {
          existingPermission = await strapi.db
            .query("admin::permission")
            .create({ data });
        }

        permissions.push(existingPermission.id);
      } catch (err) {
        throw new Error(
          `Error checking or creating/updating permission: ${err}`
        );
      }
    }
  }

  let createdAdminRole;
  try {
    const data = {
      name: roleName,
      description: `Role for ${companyName}`,
      type: "authenticated",
      permissions,
    };

    createdAdminRole = await strapi.db.query("admin::role").create({
      data,
    });
  } catch (err) {
    throw new Error(`Failed to create admin role: ${err}`);
  }

  // Create User with the respective role
  try {
    await strapi.admin.services.user.create({
      email: companyEmail,
      password,
      firstname: companyName,
      isActive: true,
      roles: [createdAdminRole.id],
    });
  } catch (err) {
    throw new Error(`Failed to register admin user: ${err}`);
  }
}

export async function insertPlaceholderData(companyName: string) {
  const name = companyName.replace(/\s+/g, "").toLowerCase();

  const contentData = Object.entries(masterContents).map(
    ([content, { api, populate }]) => {
      return {
        content,
        from: api,
        to: `api::${generateName(content, name, true)}.${generateName(content, name, true)}`,
        populate,
      };
    }
  );

  for (const data of contentData) {
    console.log("Status: Obtaining data from " + data.from);
    console.log(JSON.stringify(data));
    const records = await strapi.entityService.findMany(data.from as any, {
      populate: data.populate as any,
    });
    console.log("Status: Passed");
    console.log("Result: ");
    console.log(JSON.stringify(records));
    console.log("");

    if (Array.isArray(records)) {
      console.log("Status: Inserting data (array) to " + data.to);
      for (const record of records) {
        const { id, createdAt, updatedAt, ...rest } = record;
        await strapi.entityService.create(data.to as any, {
          data: {
            ...rest,
            publishedAt: record.publishedAt || new Date(),
          },
        });
      }
    } else {
      console.log("Status: Inserting data (object) to " + data.to);
      const { id, createdAt, updatedAt, ...rest } = records;
      const insert = {
        ...rest,
        publishedAt: records.publishedAt || new Date(),
      };
      console.log(JSON.stringify(data));
      await strapi.entityService.create(data.to as any, {
        data: insert,
      });
    }

    console.log("Done!");
    console.log("");
  }
}

export async function checkExistingUserAndRole(
  companyEmail: string,
  roleName: string
) {
  let existingUser;
  try {
    existingUser = await strapi.db.query("admin::user").findOne({
      where: {
        email: companyEmail,
      },
    });

    if (existingUser) {
      throw new Error(
        `An admin user with the email ${companyEmail} already exists.`
      );
    }
  } catch (err) {
    throw new Error(`Error checking user existence: ${err}`);
  }

  // Check if the role already exists
  let existingRole;
  try {
    existingRole = await strapi.db.query("admin::role").findOne({
      where: {
        name: roleName,
      },
    });

    if (existingRole) {
      throw new Error(
        `The role "${roleName}" already exists. Cannot create a duplicate role.`
      );
    }
  } catch (err) {
    throw new Error(`Error checking role existence: ${err}`);
  }
}
