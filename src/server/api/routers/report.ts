import { TRPCError } from "@trpc/server";
import { isAddress } from "viem";
import { z } from "zod";
import {
  authenticatedProcedure,
  publicProcedure,
  router,
} from "~/server/api/trpc";
import { ReportStatus } from "~/server/enums";
import { hasPermission } from "~/utils/permissions";
import { FieldReportModel } from "../models/report";

const createReportInput = z.object({
  title: z.string(),
  description: z.string(),
  report: z.string(),
  vouchers: z.array(z.string()),
  image_url: z.string().url().nullable(),
  tags: z.array(z.string()),
  location: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
  period: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .nullable(),
});

const updateReportInput = createReportInput.partial().extend({
  id: z.number(),
});

const updateReportStatusInput = z.object({
  id: z.number(),
  status: z.nativeEnum(ReportStatus),
  rejectionReason: z.string().optional().nullable(),
});

export const reportRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          vouchers: z.array(z.string().refine(isAddress)).optional(),
          tags: z.array(z.string()).optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      const user = ctx.session?.user;
      const userId = user?.id;

      // If user is not logged in, only show approved reports
      if (!userId) {
        return reportModel.listFieldReports({
          ...input,
          includeOnlyApproved: true,
          limit: input?.limit ?? 10,
          offset: input?.offset ?? 0,
        });
      }

      // Check if user has permission to view all reports
      const canViewAll = hasPermission(user, false, "Reports", "VIEW");

      return reportModel.listFieldReports({
        ...input,
        userId: canViewAll ? undefined : userId,
        includeOnlyApproved: !canViewAll,
        limit: input?.limit ?? 10,
        offset: input?.offset ?? 0,
      });
    }),

  findById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      const report = await reportModel.findFieldReportById(input.id);
      const user = ctx.session?.user;

      // If report is not approved, check permissions
      if (report.status !== ReportStatus.APPROVED) {
        // Allow if user is the owner or has VIEW permission
        const isOwner = report.created_by === user?.id;
        const canView = user && hasPermission(user, isOwner, "Reports", "VIEW");

        if (!canView) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view this report",
          });
        }
      }

      return report;
    }),

  create: authenticatedProcedure
    .input(createReportInput)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;

      // Check if user has permission to create reports
      if (!hasPermission(user, false, "Reports", "CREATE")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create reports",
        });
      }

      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      return reportModel.createFieldReport(input, user.id);
    }),

  update: authenticatedProcedure
    .input(updateReportInput)
    .mutation(async ({ ctx, input }) => {
      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      const user = ctx.user;

      // Get existing report to check ownership
      const existingReport = await reportModel.findFieldReportById(input.id);
      const isOwner = existingReport.created_by === user.id;

      // Check if user has permission to update reports
      if (!hasPermission(user, isOwner, "Reports", "UPDATE")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this report",
        });
      }

      return reportModel.updateFieldReport(input.id, input, user);
    }),

  updateStatus: authenticatedProcedure
    .input(updateReportStatusInput)
    .mutation(async ({ ctx, input }) => {
      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      const user = ctx.user;

      // Get existing report to check ownership
      const existingReport = await reportModel.findFieldReportById(input.id);
      const isOwner = existingReport.created_by === user.id;

      // Check permission based on the status change
      const action =
        input.status === ReportStatus.APPROVED
          ? "APPROVE"
          : input.status === ReportStatus.REJECTED
            ? "REJECT"
            : input.status === ReportStatus.SUBMITTED
              ? "SUBMIT"
              : "UPDATE";

      if (!hasPermission(user, isOwner, "Reports", action)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You don't have permission to ${action.toLowerCase()} this report`,
        });
      }

      return reportModel.updateReportStatus(
        input.id,
        input.status,
        input.rejectionReason,
        user
      );
    }),

  delete: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      const user = ctx.user;
      return reportModel.deleteFieldReport(input.id, user);
    }),
});
