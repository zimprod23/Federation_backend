// import { Router, Request, Response, NextFunction } from "express";
// import { createAuthenticate } from "../middleware/authenticate";
// import { ApiResponseBuilder } from "../../../shared/api-response";
// import { IAuthTokenService } from "../../../domain/interfaces";
// import { MemberModel } from "../../../infrastructure/database/mongoose/models/MemberModel";
// import { ClubModel } from "../../../infrastructure/database/mongoose/models/ClubModel";
// import { CompetitionModel } from "../../../infrastructure/database/mongoose/models/CompetitionModel";

// export function statsRouter(authTokenSvc: IAuthTokenService): Router {
//   const router = Router();
//   const authenticate = createAuthenticate(authTokenSvc);

//   // GET /stats/dashboard
//   router.get(
//     "/dashboard",
//     authenticate,
//     async (_req: Request, res: Response, next: NextFunction) => {
//       try {
//         const [
//           membersByStatus,
//           membersByCategory,
//           membersByGender,
//           totalMembers,
//           totalClubs,
//           totalCompetitions,
//         ] = await Promise.all([
//           // Members grouped by status
//           MemberModel.aggregate([
//             { $group: { _id: "$status", count: { $sum: 1 } } },
//           ]),
//           // Members grouped by category (computed from dateOfBirth)
//           MemberModel.aggregate([
//             {
//               $addFields: {
//                 age: {
//                   $dateDiff: {
//                     startDate: "$dateOfBirth",
//                     endDate: "$$NOW",
//                     unit: "year",
//                   },
//                 },
//               },
//             },
//             {
//               $addFields: {
//                 category: {
//                   $switch: {
//                     branches: [
//                       { case: { $lt: ["$age", 18] }, then: "junior" },
//                       { case: { $lt: ["$age", 23] }, then: "u23" },
//                     ],
//                     default: "senior",
//                   },
//                 },
//               },
//             },
//             { $group: { _id: "$category", count: { $sum: 1 } } },
//           ]),
//           // Members grouped by gender
//           MemberModel.aggregate([
//             { $group: { _id: "$gender", count: { $sum: 1 } } },
//           ]),
//           // Totals
//           MemberModel.countDocuments(),
//           ClubModel.countDocuments({ status: "active" }),
//           CompetitionModel.countDocuments({ status: "open" }),
//         ]);

//         res.status(200).json(
//           ApiResponseBuilder.success({
//             totals: {
//               members: totalMembers,
//               activeClubs: totalClubs,
//               openCompetitions: totalCompetitions,
//             },
//             membersByStatus: membersByStatus.map((d) => ({
//               status: d._id as string,
//               count: d.count as number,
//             })),
//             membersByCategory: membersByCategory.map((d) => ({
//               category: d._id as string,
//               count: d.count as number,
//             })),
//             membersByGender: membersByGender.map((d) => ({
//               gender: d._id as string,
//               count: d.count as number,
//             })),
//           }),
//         );
//       } catch (err) {
//         next(err);
//       }
//     },
//   );

//   return router;
// }

import { Router, Request, Response, NextFunction } from "express";
import { createAuthenticate } from "../middleware/authenticate";
import { ApiResponseBuilder } from "../../../shared/api-response";
import { IAuthTokenService } from "../../../domain/interfaces";
import { DB } from "../../../infrastructure/database/connection";

export function statsRouter(authTokenSvc: IAuthTokenService): Router {
  const router = Router();
  const authenticate = createAuthenticate(authTokenSvc);

  router.get(
    "/dashboard",
    authenticate,
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const db = DB.conn;

        // 1. Members grouped by status
        const membersByStatus = db
          .prepare(
            `
          SELECT status as id, COUNT(*) as count 
          FROM members 
          GROUP BY status
        `,
          )
          .all() as { id: string; count: number }[];

        // 2. Members grouped by category (computed via age)
        // Note: strftime('%Y') - strftime('%Y', date_of_birth) provides the age in years
        const membersByCategory = db
          .prepare(
            `
          SELECT 
            CASE 
              WHEN (strftime('%Y', 'now') - strftime('%Y', date_of_birth)) < 18 THEN 'junior'
              WHEN (strftime('%Y', 'now') - strftime('%Y', date_of_birth)) < 23 THEN 'u23'
              ELSE 'senior'
            END as id,
            COUNT(*) as count
          FROM members
          GROUP BY id
        `,
          )
          .all() as { id: string; count: number }[];

        // 3. Members grouped by gender
        const membersByGender = db
          .prepare(
            `
          SELECT gender as id, COUNT(*) as count 
          FROM members 
          GROUP BY gender
        `,
          )
          .all() as { id: string; count: number }[];

        // 4. Individual Totals
        const totalMembers = db
          .prepare("SELECT COUNT(*) as count FROM members")
          .get() as { count: number };
        const totalClubs = db
          .prepare(
            "SELECT COUNT(*) as count FROM clubs WHERE status = 'active'",
          )
          .get() as { count: number };
        const totalCompetitions = db
          .prepare(
            "SELECT COUNT(*) as count FROM competitions WHERE status = 'open'",
          )
          .get() as { count: number };

        res.status(200).json(
          ApiResponseBuilder.success({
            totals: {
              members: totalMembers.count,
              activeClubs: totalClubs.count,
              openCompetitions: totalCompetitions.count,
            },
            membersByStatus: membersByStatus.map((d) => ({
              status: d.id,
              count: d.count,
            })),
            membersByCategory: membersByCategory.map((d) => ({
              category: d.id,
              count: d.count,
            })),
            membersByGender: membersByGender.map((d) => ({
              gender: d.id,
              count: d.count,
            })),
          }),
        );
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
