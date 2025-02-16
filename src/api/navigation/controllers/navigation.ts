/**
 * navigation controller
 */

import { factories } from "@strapi/strapi";

let check = false;

export default factories.createCoreController("api::navigation.navigation");

// export default factories.createCoreController(
//   "api::navigation.navigation",
//   ({ strapi }) => ({
//     async find(ctx) {
//       try {
//         const data = await strapi.entityService.findMany(
//           "api::navigation.navigation",
//           {
//             populate: {
//               footer: {
//                 on: {
//                   "navigation.nav-group": {
//                     populate: "items.media",
//                   },
//                   "navigation.nav-text": {
//                     populate: "*",
//                   },
//                 },
//               },
//               navbar: {
//                 on: {
//                   "navigation.nav-group": {
//                     populate: "items.media",
//                   },
//                   "navigation.nav-text": {
//                     populate: "*",
//                   },
//                 },
//               },
//             },
//           }
//         );

//         return data;
//       } catch (error) {
//         ctx.throw(500, `Error fetching navigation data: ${error.message}`);
//       }
//     },
//   })
// );
