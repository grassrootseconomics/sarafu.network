import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
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

const listReportsInput = z
  .object({
    limit: z.number().min(1).max(2000).nullish(),
    cursor: z.number().nullish(),
    vouchers: z.array(z.string().refine(isAddress)).optional(),
    tags: z.array(z.string()).optional(),
    creatorAddress: z
      .string()
      .refine(isAddress, {
        message: "Invalid Ethereum address",
      })
      .optional(),
    status: z.nativeEnum(ReportStatus).optional(),
  })
  .optional();

export const reportRouter = router({
  list: publicProcedure
    .input(listReportsInput)
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor ?? 0;
      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      const user = ctx.session?.user;

      // If user is not logged in, only show approved reports
      const reports = await reportModel.listFieldReports({
        ...input,
        limit: limit,
        cursor: cursor,
        user: user,
      });

      return {
        items: reports,
        nextCursor: reports.length === limit ? cursor + limit : undefined,
      };
    }),

  findById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      const report = await reportModel.findFieldReportById(input.id);
      if (!report) {
        return null;
      }
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
      if (!existingReport) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }
      const isOwner = existingReport.created_by === user.id;

      // Check if user has permission to update reports
      if (!hasPermission(user, isOwner, "Reports", "UPDATE")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this report",
        });
      }

      const result = await reportModel.updateFieldReport(input.id, input, user);
      revalidatePath(`/reports/${result?.id}`, "page");
      return result;
    }),

  updateStatus: authenticatedProcedure
    .input(updateReportStatusInput)
    .mutation(async ({ ctx, input }) => {
      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      const user = ctx.user;

      // Get existing report to check ownership
      const existingReport = await reportModel.findFieldReportById(input.id);
      if (!existingReport) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }
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

      const report = await reportModel.updateReportStatus(
        input.id,
        input.status,
        input.rejectionReason,
        user
      );
      revalidatePath(`/reports/${report?.id}`, "page");
      return report;
    }),

  delete: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      const user = ctx.user;
      return reportModel.deleteFieldReport(input.id, user);
    }),

  // Added procedure to get report statistics by tag
  getStatsByTag: publicProcedure // Consider authenticatedProcedure + permissions
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        vouchers: z.array(z.string().refine(isAddress))
      })

    )
    .query(async ({ ctx, input }) => {
      const reportModel = new FieldReportModel({ graphDB: ctx.graphDB });
      const user = ctx.session?.user; // Pass user if permissions are needed in the model

      // Validate date range (optional but good practice)
      if (input.from > input.to) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "'from' date cannot be after 'to' date.",
        });
      }

      const stats = await reportModel.getStatsByTag({
        from: input.from,
        to: input.to,
        user: user, // Pass user for potential future permission checks in the model
        vouchers: input.vouchers
      });

      return stats;
    }),
});
