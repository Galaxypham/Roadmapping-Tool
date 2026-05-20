import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { daysSince, formatDate, formatTimestamp } from "./format.js";
import { getDashboardFilterSummary, hasActiveDashboardFilters } from "./dashboardFilters.js";

const RESTRICTED = "Restricted";

function buildFilename(filters) {
  const date = new Date().toISOString().slice(0, 10);
  if (hasActiveDashboardFilters(filters)) {
    return `ps-dashboard-filtered-${date}.pdf`;
  }
  return `ps-dashboard-${date}.pdf`;
}

function rowForCase(caseObj, canView) {
  if (!canView) {
    return [
      caseObj.case_number,
      RESTRICTED,
      RESTRICTED,
      RESTRICTED,
      RESTRICTED,
      RESTRICTED,
      RESTRICTED,
      RESTRICTED,
      RESTRICTED,
      RESTRICTED,
    ];
  }

  return [
    caseObj.case_number,
    caseObj.request_type || "-",
    caseObj.priority || "-",
    caseObj.pipeline_status || "-",
    caseObj.lifecycle_status || "-",
    caseObj.requestor_name || "-",
    caseObj.team || "-",
    formatDate(caseObj.created_at),
    formatDate(caseObj.updated_at),
    `${daysSince(caseObj.status_changed_at)}d`,
  ];
}

export function exportDashboardPdf({
  cases,
  totalCount,
  filters,
  canViewCase,
  userName,
  role,
}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("Problem Statement Dashboard", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Exported ${formatTimestamp(new Date().toISOString())}`, margin, y + 16);

  if (userName) {
    doc.text(
      `Exported by ${userName}${role ? ` (${role})` : ""}`,
      pageWidth - margin,
      y + 16,
      { align: "right" },
    );
  }

  y += 36;

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.text("Export settings", margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  getDashboardFilterSummary(filters).forEach((line) => {
    doc.text(`• ${line}`, margin + 8, y);
    y += 12;
  });

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text(`${cases.length} of ${totalCount} cases included`, margin, y);
  y += 18;

  if (cases.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("No cases match the current filters.", margin, y);
    doc.save(buildFilename(filters));
    return;
  }

  autoTable(doc, {
    startY: y,
    head: [[
      "Case",
      "Type",
      "Priority",
      "Pipeline",
      "Lifecycle",
      "Requestor",
      "Team",
      "Submitted",
      "Updated",
      "Days in status",
    ]],
    body: cases.map((c) => rowForCase(c, canViewCase(c))),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      overflow: "linebreak",
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [100, 116, 139],
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 120 },
      5: { cellWidth: 72 },
      6: { cellWidth: 72 },
    },
  });

  doc.save(buildFilename(filters));
}

// Roadmap export: a focused snapshot of every roadmapped case in PM-set
// order. No filter summary, no per-stage minutiae — just rank, title, type,
// priority, RICE, and ownership info, suitable for sharing with leadership.
export function exportRoadmapPdf({ cases, canViewCase, userName, role }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("Product Roadmap", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Exported ${formatTimestamp(new Date().toISOString())}`,
    margin,
    y + 16,
  );

  if (userName) {
    doc.text(
      `Exported by ${userName}${role ? ` (${role})` : ""}`,
      pageWidth - margin,
      y + 16,
      { align: "right" },
    );
  }

  y += 36;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `${cases.length} ${cases.length === 1 ? "case" : "cases"} on the roadmap`,
    margin,
    y,
  );
  y += 18;

  const date = new Date().toISOString().slice(0, 10);
  const filename = `roadmap-${date}.pdf`;

  if (cases.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Nothing on the roadmap right now.", margin, y);
    doc.save(filename);
    return;
  }

  autoTable(doc, {
    startY: y,
    head: [[
      "Rank",
      "Case",
      "Type",
      "Priority",
      "RICE",
      "Lifecycle",
      "Requestor",
      "Team",
    ]],
    body: cases.map((c, i) => {
      const view = canViewCase(c);
      if (!view) {
        return [
          String(i + 1),
          c.case_number,
          RESTRICTED,
          RESTRICTED,
          RESTRICTED,
          RESTRICTED,
          RESTRICTED,
          RESTRICTED,
        ];
      }
      const rice = c.rice?.weighted_total;
      return [
        String(i + 1),
        c.case_number,
        c.request_type || "-",
        c.priority || "-",
        rice != null ? String(rice) : "—",
        c.lifecycle_status || "-",
        c.requestor_name || "-",
        c.team || "-",
      ];
    }),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 5,
      overflow: "linebreak",
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [100, 116, 139],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 36, halign: "center" },
      1: { cellWidth: 130 },
      4: { cellWidth: 36, halign: "center" },
    },
  });

  doc.save(filename);
}

// Lifecycle export: roadmapped cases grouped by lifecycle stage, in roadmap-rank
// order within each stage. Mirrors the on-screen Lifecycle view so a PM can
// share a single PDF snapshot of where every roadmapped case sits in the PLC.
export function exportLifecyclePdf({ stages, groups, canViewCase, userName, role }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("Product Lifecycle", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Exported ${formatTimestamp(new Date().toISOString())}`,
    margin,
    y + 16,
  );

  if (userName) {
    doc.text(
      `Exported by ${userName}${role ? ` (${role})` : ""}`,
      pageWidth - margin,
      y + 16,
      { align: "right" },
    );
  }

  y += 36;

  const totalCases = stages.reduce(
    (sum, s) => sum + (groups[s] || []).length,
    0,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `${totalCases} ${totalCases === 1 ? "case" : "cases"} on the roadmap across ${stages.length} stages`,
    margin,
    y,
  );
  y += 18;

  const date = new Date().toISOString().slice(0, 10);
  const filename = `lifecycle-${date}.pdf`;

  if (totalCases === 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Nothing on the roadmap right now.", margin, y);
    doc.save(filename);
    return;
  }

  for (const stage of stages) {
    const list = groups[stage] || [];

    if (y > pageHeight - margin - 80) {
      doc.addPage();
      y = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${stage} (${list.length})`, margin, y);
    y += 10;

    if (list.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("No cases in this stage.", margin + 8, y + 10);
      y += 24;
      continue;
    }

    autoTable(doc, {
      startY: y + 4,
      head: [["Rank", "Case", "Type", "Priority", "RICE", "Requestor", "Team"]],
      body: list.map((c) => {
        const view = canViewCase(c);
        const rank = Number.isFinite(c.roadmap_rank)
          ? String(c.roadmap_rank + 1)
          : "—";
        if (!view) {
          return [
            rank,
            c.case_number,
            RESTRICTED,
            RESTRICTED,
            RESTRICTED,
            RESTRICTED,
            RESTRICTED,
          ];
        }
        const rice = c.rice?.weighted_total;
        return [
          rank,
          c.case_number,
          c.request_type || "-",
          c.priority || "-",
          rice != null ? String(rice) : "—",
          c.requestor_name || "-",
          c.team || "-",
        ];
      }),
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        overflow: "linebreak",
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [100, 116, 139],
        fontStyle: "bold",
        fontSize: 7.5,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 36, halign: "center" },
        1: { cellWidth: 130 },
        4: { cellWidth: 36, halign: "center" },
      },
    });

    y = doc.lastAutoTable.finalY + 16;
  }

  doc.save(filename);
}
