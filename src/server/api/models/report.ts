import { TRPCError } from "@trpc/server";
import { sql, type Kysely } from "kysely";
import { type Session } from "next-auth";
import { type Address } from "viem";
import { type GraphDB } from "~/server/db";
import { ReportStatus } from "~/server/enums";
import { hasPermission } from "~/utils/permissions";

function parseLocation(location: string | null) {
  if (!location) return null;
  const [x, y] = location.split(",");
  if (!x || !y) return null;
  return { x: parseFloat(x), y: parseFloat(y) };
}

export class FieldReportModel {
  private graphDB: Kysely<GraphDB>;

  constructor({ graphDB }: { graphDB: Kysely<GraphDB> }) {
    this.graphDB = graphDB;
  }

  async listFieldReports(input?: {
    limit?: number;
    cursor?: number;
    vouchers?: Address[];
    tags?: string[];
    creatorAddress?: Address;
    status?: keyof typeof ReportStatus;
    user?: Session["user"];
  }) {
    let query = this.graphDB
      .selectFrom("field_reports")
      .innerJoin("users", "users.id", "field_reports.created_by")
      .innerJoin(
        "personal_information",
        "personal_information.user_identifier",
        "users.id"
      )
      .innerJoin("accounts", "users.id", "accounts.user_identifier")
      .limit(input?.limit ?? 10)
      .offset(input?.cursor ?? 0)
      .orderBy("field_reports.id", "desc");

    // Filter by vouchers if provided
    if (input?.vouchers) {
      if (input.vouchers.length === 0) {
        // If an empty voucher array is provided, return no reports
        query = query.where("field_reports.id", "=", -1); // This creates a false condition since IDs are always positive
      } else {
        query = query.where("vouchers", "&&", [input.vouchers]);
      }
    }

    // Filter by tags if provided
    if (input?.tags && input.tags.length > 0) {
      const formattedTags = `{${input.tags.join(",")}}`;
      // @ts-expect-error tags is a string
      query = query.where("tags", "&&", formattedTags);
    }

    // Filter by creator address if provided
    if (input?.creatorAddress) {
      query = query.where(
        "accounts.blockchain_address",
        "=",
        input.creatorAddress
      );
    }

    // Filter by status if provided
    if (input?.status) {
      query = query.where("field_reports.status", "=", input.status);
    }

    // Apply visibility filters
    if (input?.user?.id !== undefined) {
      // If Logged in
      // IF Created by the user or approved reports or user is super admin, admin or staff
      if (input.user.role === "USER") {
        // If a specific status is requested and user has permission to see it, don't add additional filters
        if (input?.status && input.status !== ReportStatus.APPROVED) {
          // Check if user has permission to see this status
          const canView = hasPermission(input.user, false, "Reports", "VIEW");
          if (!canView) {
            // If no permission, only show user's own reports or approved reports
            query = query.where((eb) =>
              eb.or([
                eb("field_reports.created_by", "=", input.user!.id),
                eb("field_reports.status", "=", ReportStatus.APPROVED),
              ])
            );
          }
        } else {
          // Default behavior - show user's own reports or approved reports
          query = query.where((eb) =>
            eb.or([
              eb("field_reports.created_by", "=", input.user!.id),
              eb("field_reports.status", "=", ReportStatus.APPROVED),
            ])
          );
        }
      } else {
        // If super admin, admin or staff - show all reports (no additional filters)
      }
    } else {
      // Only show approved reports for unauthenticated users
      // But if a specific status is requested, don't allow it for unauthenticated users
      if (input?.status && input.status !== ReportStatus.APPROVED) {
        // Create a false condition - non-authenticated users can't see non-approved reports
        query = query.where("field_reports.id", "=", -1);
      } else {
        query = query.where("field_reports.status", "=", ReportStatus.APPROVED);
      }
    }

    const reports = await query
      .select(({ eb }) => [
        "field_reports.id",
        "field_reports.title",
        "field_reports.description",
        "field_reports.image_url",
        "field_reports.vouchers",
        "field_reports.tags",
        "field_reports.created_by",
        "field_reports.modified_by",
        "field_reports.created_at",
        "field_reports.updated_at",
        "field_reports.status",
        "field_reports.location",
        "accounts.blockchain_address as creator_address",
        sql<string>`concat(${eb.ref(
          "personal_information.given_names"
        )}, ' ', ${eb.ref("personal_information.family_name")})`.as(
          "creator_name"
        ),
      ])
      .execute();

    return reports.map((report) => ({
      ...report,
      status: report.status as keyof typeof ReportStatus,
      tags: report.tags ?? [],
      location: parseLocation(report.location),
    }));
  }

  async findFieldReportById(id: number) {
    const report = await this.graphDB
      .selectFrom("field_reports")
      .innerJoin("users", "users.id", "field_reports.created_by")
      .innerJoin(
        "personal_information",
        "personal_information.user_identifier",
        "users.id"
      )
      .innerJoin("accounts", "users.id", "accounts.user_identifier")
      .where("field_reports.id", "=", id)
      .select(({ eb }) => [
        "field_reports.id",
        "field_reports.title",
        "field_reports.description",
        "field_reports.image_url",
        "field_reports.vouchers",
        "field_reports.tags",
        "field_reports.report",
        "field_reports.rejection_reason",
        "field_reports.created_by",
        "field_reports.modified_by",
        "field_reports.created_at",
        "field_reports.updated_at",
        "field_reports.status",
        "field_reports.location",
        "field_reports.period_from",
        "field_reports.period_to",
        "accounts.blockchain_address as creator_address",
        sql<string>`concat(${eb.ref(
          "personal_information.given_names"
        )}, ' ', ${eb.ref("personal_information.family_name")})`.as(
          "creator_name"
        ),
      ])
      .executeTakeFirst();

    if (!report) return null;

    const location = parseLocation(report.location);
    const period =
      report.period_from && report.period_to
        ? {
            from: report.period_from,
            to: report.period_to,
          }
        : null;

    return {
      ...report,
      status: report.status as keyof typeof ReportStatus,
      tags: report.tags ?? [],
      location: location,
      period: period,
    };
  }

  async createFieldReport(
    reportData: {
      title: string;
      description: string;
      report: string;
      vouchers: string[];
      image_url: string | null;
      tags: string[];
      location: {
        x: number;
        y: number;
      } | null;
      period: {
        from: Date;
        to: Date;
      } | null;
      status?: keyof typeof ReportStatus;
      rejectionReason?: string;
    },
    userId: number
  ) {
    return this.graphDB.transaction().execute(async (trx) => {
      const report = await trx
        .insertInto("field_reports")
        .values({
          title: reportData.title,
          report: reportData.report,
          description: reportData.description,
          vouchers: reportData.vouchers,
          image_url: reportData.image_url,
          tags: reportData.tags,
          location: reportData.location
            ? `${reportData.location.x}, ${reportData.location.y}`
            : null,
          period_from: reportData.period?.from,
          period_to: reportData.period?.to,
          created_by: userId,
          modified_by: userId,
          status: reportData.status ?? ReportStatus.DRAFT,
          rejection_reason: reportData.rejectionReason,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return report;
    });
  }

  async updateFieldReport(
    id: number,
    updateData: Partial<{
      title: string;
      report: string;
      description: string;
      vouchers: string[];
      image_url: string | null;
      tags: string[];
      location: {
        x: number;
        y: number;
      } | null;
      period: {
        from: Date;
        to: Date;
      } | null;
    }>,
    user: Session["user"]
  ) {
    const report = await this.findFieldReportById(id);
    if (!report) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Report not found",
      });
    }
    const isOwner = report.created_by === user?.id;
    const canUpdate = hasPermission(user, isOwner, "Reports", "UPDATE");
    if (!canUpdate) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to update this report",
      });
    }
    return this.graphDB
      .updateTable("field_reports")
      .set({
        title: updateData.title,
        description: updateData.description,
        report: updateData.report,
        vouchers: updateData.vouchers,
        location: updateData.location
          ? `${updateData.location.x}, ${updateData.location.y}`
          : null,
        tags: updateData.tags,
        modified_by: user.id,
        image_url: updateData.image_url,
        period_from: updateData.period?.from,
        period_to: updateData.period?.to,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async updateReportStatus(
    id: number,
    status: keyof typeof ReportStatus,
    rejectionReason: string | null | undefined,
    user: Session["user"]
  ) {
    // Validate status transition
    const currentReport = await this.findFieldReportById(id);
    if (!currentReport) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Report not found",
      });
    }
    const isOwner = currentReport.created_by === user?.id;
    if (status === ReportStatus.APPROVED) {
      const canApprove = hasPermission(user, isOwner, "Reports", "APPROVE");
      if (!canApprove) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to Approve this report",
        });
      }
    } else if (status === ReportStatus.REJECTED) {
      const canReject = hasPermission(user, isOwner, "Reports", "REJECT");
      if (!canReject) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to Reject this report",
        });
      }
    } else if (status === ReportStatus.SUBMITTED) {
      const canSubmit = hasPermission(user, isOwner, "Reports", "SUBMIT");
      if (!canSubmit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to Submit this report",
        });
      }
    }
    // Ensure rejection reason is provided when rejecting
    if (status === ReportStatus.REJECTED && !rejectionReason) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Rejection reason is required when rejecting a report",
      });
    }

    return this.graphDB
      .updateTable("field_reports")
      .set({
        status,
        rejection_reason: rejectionReason,
        modified_by: user.id,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteFieldReport(id: number, user: Session["user"]) {
    const report = await this.findFieldReportById(id);
    if (!report) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Report not found",
      });
    }
    const isOwner = report.created_by === user?.id;
    const canDelete = hasPermission(user, isOwner, "Reports", "DELETE");
    if (!canDelete) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to delete this report",
      });
    }
    return this.graphDB
      .deleteFrom("field_reports")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // Added method to get statistics by tag
  async getStatsByTag(input: {
    from: Date;
    to: Date;
    user?: Session["user"];
  }): Promise<{ tag: string; count: number }[]> {
    // Base query to unnest tags and filter by date range
    const query = this.graphDB
      .selectFrom((eb) =>
        eb
          .selectFrom("field_reports")
          // Use sql.raw to unnest the tags array
          .select(sql<string>`unnest(tags)`.as("tag"))
          .where("created_at", ">=", input.from)
          .where("created_at", "<=", input.to)
          .as("report_tags")
      )
      .select(["tag", sql<number>`count(*)::int`.as("count")])
      .groupBy("tag")
      .orderBy("count", "desc");

    // TODO: Apply visibility filters similar to listFieldReports if needed
    // This is complex because we've already aggregated.
    // A simple approach might be to filter the field_reports *before* unnesting,
    // but that requires adjusting the base query significantly.
    // For now, assuming stats are based on *all* reports in the date range.
    // Consider revisiting this if granular permissions are required for stats.

    const stats = await query.execute();

    return stats;
  }
}
