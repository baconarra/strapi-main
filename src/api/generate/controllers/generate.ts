import { Context } from "koa";
import {
  generateContentType,
  generateName,
  createRoleAndUser,
  insertPlaceholderData,
  checkExistingUserAndRole,
} from "../../../custom/generator";
import { NestedParams } from "@strapi/types/dist/modules/documents/params/populate";

export default {
  "company-content": async (ctx: Context) => {
    const { "company-name": companyName, "company-email": companyEmail } =
      ctx.request.body;

    if (!companyName || !companyEmail) {
      return ctx.badRequest(
        "Both 'company-name' and 'company-email' are required."
      );
    }

    const name = companyName.replace(/\s+/g, "");

    let existingUser;
    try {
      existingUser = await strapi.db.query("admin::user").findOne({
        where: { email: companyEmail },
      });

      if (existingUser) {
        return ctx.badRequest(
          `An admin user with the email ${companyEmail} already exists.`
        );
      }
    } catch (err) {
      return ctx.internalServerError(`Error checking user existence: ${err}`);
    }

    try {
      await generateContentType(name);
    } catch (err) {
      return ctx.internalServerError(`Failed to generate content type: ${err}`);
    }

    // Step 5: Return the password
    ctx.send({
      message: "Company Profile Content Structure created successfully.",
    });
  },
  "company-data": async (ctx: Context) => {
    const {
      "company-name": companyName,
      "company-email": companyEmail,
      password,
    } = ctx.request.body;

    // Validation
    if (!companyName || !companyEmail || !password) {
      return ctx.badRequest(
        "'company-name', 'company-email', and 'password' fields are required."
      );
    }

    const prefix = companyName.replace(/\s+/g, "");
    const roleName = `Admin-${prefix}`;

    try {
      await checkExistingUserAndRole(companyEmail, roleName);
      await insertPlaceholderData(companyName);
      await createRoleAndUser(
        companyName,
        prefix,
        companyEmail,
        roleName,
        password
      );
      ctx.send({
        message: "Company Profile Data created successfully",
      });
    } catch (e) {
      console.error(e.stack || e);
      return ctx.internalServerError(`Error creating role and user: ${e}`);
    }
  },
  test: async (ctx: Context) => {
    ctx.send("ok");
  },
};
