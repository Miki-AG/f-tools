import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { getProjectConfig, getProjectReport, saveProjectConfig } from "@/lib/api";
import type { BootstrapConfig } from "@/lib/bootstrap";
import { FILTER_STATUSES, formatUpdatedParts, normalizeStatus, ticketHasLabel, toTicketNumber } from "@/lib/format";
import { dominantStatusForTone, playStatusChangeTone } from "@/lib/sound";
import type {
  ProjectSummary,
  TicketColumnKey,
  TicketColumnsByView,
  TicketColumnsConfig,
  TicketStatus,
  TicketSummary,
} from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ProjectPageProps {
  config: BootstrapConfig;
}

type StatusFilterMap = Record<TicketStatus, boolean>;
type VisibleTicketRow = {
  ticket: TicketSummary;
  depth: 0 | 1;
  isWorkstream: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
};

const COLUMN_OPTIONS: { key: TicketColumnKey; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "owner", label: "Owner" },
  { key: "labels", label: "Labels" },
  { key: "updated", label: "Updated" },
  { key: "updates", label: "Updates" },
];

function buildDefaultStatusFilters(): StatusFilterMap {
  return {
    open: true,
    doing: true,
    blocked: true,
    done: true,
    wontfix: true,
    parked: true,
  };
}

function buildDefaultDesktopColumns(): TicketColumnsConfig {
  return {
    id: true,
    title: true,
    type: false,
    status: true,
    priority: true,
    owner: true,
    labels: true,
    updated: true,
    updates: true,
  };
}

function buildDefaultMobileColumns(): TicketColumnsConfig {
  return {
    id: true,
    title: true,
    type: false,
    status: true,
    priority: false,
    owner: false,
    labels: false,
    updated: false,
    updates: false,
  };
}

function buildDefaultColumnsByView(): TicketColumnsByView {
  return {
    desktop: buildDefaultDesktopColumns(),
    mobile: buildDefaultMobileColumns(),
  };
}

function normalizeColumnsConfig(
  raw: Partial<TicketColumnsConfig> | undefined,
  defaults: TicketColumnsConfig
): TicketColumnsConfig {
  const source = raw || {};
  return {
    id: typeof source.id === "boolean" ? source.id : defaults.id,
    title: typeof source.title === "boolean" ? source.title : defaults.title,
    type: typeof source.type === "boolean" ? source.type : defaults.type,
    status: typeof source.status === "boolean" ? source.status : defaults.status,
    priority: typeof source.priority === "boolean" ? source.priority : defaults.priority,
    owner: typeof source.owner === "boolean" ? source.owner : defaults.owner,
    labels: typeof source.labels === "boolean" ? source.labels : defaults.labels,
    updated: typeof source.updated === "boolean" ? source.updated : defaults.updated,
    updates: typeof source.updates === "boolean" ? source.updates : defaults.updates,
  };
}

function normalizeColumnsByView(
  raw:
    | {
        desktop?: Partial<TicketColumnsConfig>;
        mobile?: Partial<TicketColumnsConfig>;
      }
    | undefined
): TicketColumnsByView {
  return {
    desktop: normalizeColumnsConfig(raw?.desktop, buildDefaultDesktopColumns()),
    mobile: normalizeColumnsConfig(raw?.mobile, buildDefaultMobileColumns()),
  };
}

function countEnabledColumns(columns: TicketColumnsConfig): number {
  return COLUMN_OPTIONS.reduce((count, column) => (columns[column.key] ? count + 1 : count), 0);
}

function getPrefsKey(projectId: string | null): string {
  return `f-report:prefs:project:${projectId || "default"}`;
}

function statusVariant(
  status: TicketStatus
): "secondary" | "outline" | "warning" | "success" | "danger" | "muted" {
  if (status === "open") return "outline";
  if (status === "doing") return "warning";
  if (status === "blocked") return "danger";
  if (status === "done") return "success";
  if (status === "wontfix") return "muted";
  return "secondary";
}

function statusToggleClasses(status: TicketStatus, active: boolean): string {
  if (!active) {
    return "bg-background text-muted-foreground hover:bg-muted/50";
  }

  if (status === "doing") return "bg-amber-500/20 text-amber-200";
  if (status === "blocked") return "bg-rose-500/20 text-rose-200";
  if (status === "done") return "bg-emerald-500/20 text-emerald-200";
  if (status === "wontfix") return "bg-zinc-500/25 text-zinc-200";
  if (status === "parked") return "bg-muted text-foreground";
  return "bg-slate-500/25 text-slate-100";
}

function ticketId(ticket: TicketSummary): string {
  return String(ticket.fileId || ticket.id || "").trim();
}

function ticketHierarchyText(ticket: TicketSummary): string {
  const parent = String(ticket.parent || "").trim();
  const dependsOn = Array.isArray(ticket.dependsOn) ? ticket.dependsOn.join(", ") : "";
  return [parent ? `parent ${parent}` : "", dependsOn ? `depends on ${dependsOn}` : ""]
    .filter((part) => part.length > 0)
    .join(" | ");
}

function isWorkstream(ticket: TicketSummary): boolean {
  return String(ticket.type || "").trim().toLowerCase() === "workstream";
}

function parentTicketId(ticket: TicketSummary): string {
  return String(ticket.parent || "").trim();
}

function normalizeTicketSelectionToken(value: unknown): string | null {
  const parsed = toTicketNumber(value);
  if (parsed === null || parsed < 0) return null;
  return String(parsed).padStart(4, "0");
}

function parseTicketSelectionInput(value: unknown): string[] {
  const seen = new Set<string>();
  const selected: string[] = [];

  for (const token of String(value || "").split(/[,\n]/)) {
    const normalized = normalizeTicketSelectionToken(token);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    selected.push(normalized);
  }

  return selected;
}

function rowSurfaceClasses(row: VisibleTicketRow): string {
  if (row.isWorkstream) {
    return "border-sky-500/25 bg-sky-500/5 shadow-sm";
  }
  if (row.depth === 1) {
    return "border-border/60 bg-card/40 border-dashed";
  }
  return "border-stone-500/15 bg-stone-500/[0.03]";
}

export function ProjectPage({ config }: ProjectPageProps) {
  const selectedProjectId = config.selectedProjectId;

  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [statusMessage, setStatusMessage] = useState("loading...");
  const [lastRefreshText, setLastRefreshText] = useState("last refresh: -");
  const [statusFilters, setStatusFilters] = useState<StatusFilterMap>(buildDefaultStatusFilters);
  const [ticketSelectionInput, setTicketSelectionInput] = useState("");
  const [labelFilter, setLabelFilter] = useState("");
  const [expandedWorkstreamIds, setExpandedWorkstreamIds] = useState<string[]>([]);
  const [isMobileChromeVisible, setIsMobileChromeVisible] = useState(false);
  const [columnConfigByView, setColumnConfigByView] = useState<TicketColumnsByView>(
    buildDefaultColumnsByView
  );
  const [isColumnPopupOpen, setIsColumnPopupOpen] = useState(false);

  const columnPopupRef = useRef<HTMLDivElement | null>(null);
  const previousStatusByTicketRef = useRef<Map<string, TicketStatus>>(new Map());
  const statusBaselineReadyRef = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(getPrefsKey(selectedProjectId));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      const next = buildDefaultStatusFilters();
      if (parsed.statusFilters && typeof parsed.statusFilters === "object") {
        for (const status of FILTER_STATUSES) {
          if (typeof parsed.statusFilters[status] === "boolean") {
            next[status] = parsed.statusFilters[status];
          }
        }
      }
      setStatusFilters(next);

      if (typeof parsed.ticketSelectionInput === "string") {
        setTicketSelectionInput(parsed.ticketSelectionInput);
      }
      if (typeof parsed.labelFilter === "string") {
        setLabelFilter(parsed.labelFilter);
      }
      if (Array.isArray(parsed.expandedWorkstreamIds)) {
        setExpandedWorkstreamIds(
          parsed.expandedWorkstreamIds
            .map((value: unknown) => String(value || "").trim())
            .filter((value: string) => value.length > 0)
        );
      }
    } catch (_err) {
      // Ignore malformed local preference payloads.
    }
  }, [selectedProjectId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        getPrefsKey(selectedProjectId),
        JSON.stringify({ statusFilters, ticketSelectionInput, labelFilter, expandedWorkstreamIds })
      );
    } catch (_err) {
      // Ignore local storage write failures.
    }
  }, [expandedWorkstreamIds, labelFilter, selectedProjectId, statusFilters, ticketSelectionInput]);

  useEffect(() => {
    let cancelled = false;

    async function loadColumns() {
      if (!selectedProjectId) {
        setColumnConfigByView(buildDefaultColumnsByView());
        return;
      }
      try {
        const payload = await getProjectConfig(selectedProjectId);
        if (cancelled) return;
        const normalized = normalizeColumnsByView(payload.config?.columns);
        setColumnConfigByView(normalized);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unable to load column settings.";
        setStatusMessage(`Unable to load column settings: ${message}`);
      }
    }

    void loadColumns();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  const persistColumns = useCallback(
    async (target: "desktop" | "mobile", nextColumns: TicketColumnsConfig) => {
      if (!selectedProjectId) return;
      const payload = await saveProjectConfig(selectedProjectId, {
        columns: {
          [target]: nextColumns,
        },
      });
      setColumnConfigByView(normalizeColumnsByView(payload.config?.columns));
    },
    [selectedProjectId]
  );

  useEffect(() => {
    if (!isColumnPopupOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!columnPopupRef.current) return;
      if (columnPopupRef.current.contains(event.target as Node)) return;
      setIsColumnPopupOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsColumnPopupOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isColumnPopupOpen]);

  const refreshProject = useCallback(async () => {
    if (!selectedProjectId) {
      setProject(null);
      setTickets([]);
      setStatusMessage("Project not found.");
      setLastRefreshText(`last refresh: ${new Date().toLocaleTimeString()}`);
      return;
    }

    const data = await getProjectReport(selectedProjectId);
    const loadedTickets = Array.isArray(data.tickets) ? data.tickets : [];
    const loadedProject = data.project || null;
    const nextStatusByTicket = new Map<string, TicketStatus>();
    const changedStatuses: TicketStatus[] = [];

    for (const ticket of loadedTickets) {
      const id = ticketId(ticket);
      if (!id) continue;
      const nextStatus = normalizeStatus(ticket.status);
      nextStatusByTicket.set(id, nextStatus);
      if (!statusBaselineReadyRef.current) continue;
      const previousStatus = previousStatusByTicketRef.current.get(id);
      if (previousStatus && previousStatus !== nextStatus) {
        changedStatuses.push(nextStatus);
      }
    }

    if (statusBaselineReadyRef.current && changedStatuses.length > 0) {
      playStatusChangeTone(dominantStatusForTone(changedStatuses));
    }
    previousStatusByTicketRef.current = nextStatusByTicket;
    statusBaselineReadyRef.current = true;

    setProject(loadedProject);
    setTickets(loadedTickets);

    const selectedTicketIds = new Set(parseTicketSelectionInput(ticketSelectionInput));
    const baseFilteredTickets = loadedTickets.filter((ticket) => {
      if (!statusFilters[normalizeStatus(ticket.status)]) return false;
      if (!ticketHasLabel(ticket, labelFilter)) return false;
      return true;
    });
    const selectedWorkstreamIds = new Set(
      baseFilteredTickets
        .filter((ticket) => {
          const id = normalizeTicketSelectionToken(ticket.id || ticket.fileId);
          return selectedTicketIds.has(String(id || "")) && isWorkstream(ticket);
        })
        .map((ticket) => ticketId(ticket))
    );
    const visibleCount = baseFilteredTickets.filter((ticket) => {
      if (selectedTicketIds.size === 0) return true;

      const id = normalizeTicketSelectionToken(ticket.id || ticket.fileId);
      const parentId = parentTicketId(ticket);
      return selectedTicketIds.has(String(id || "")) || selectedWorkstreamIds.has(parentId);
    }).length;

    const popupMessage = data.popup?.message ? ` | popup: ${data.popup.message}` : "";
    const projectLabel = loadedProject?.path || selectedProjectId;
    setStatusMessage(
      `Project: ${projectLabel} | tickets: ${visibleCount}/${loadedTickets.length}${popupMessage}`
    );
    setLastRefreshText(`last refresh: ${new Date().toLocaleTimeString()}`);
  }, [labelFilter, selectedProjectId, statusFilters, ticketSelectionInput]);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        await refreshProject();
      } catch (err) {
        if (!alive) return;
        const message = err instanceof Error ? err.message : "Unable to load f-report data.";
        setStatusMessage(`Unable to load f-report data: ${message}`);
      }
    }

    run();
    const interval = window.setInterval(run, config.pollMs);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [config.pollMs, refreshProject]);

  const selectedTicketIds = useMemo(() => parseTicketSelectionInput(ticketSelectionInput), [ticketSelectionInput]);
  const selectedTicketIdSet = useMemo(() => new Set(selectedTicketIds), [selectedTicketIds]);

  const baseFilteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        if (!statusFilters[normalizeStatus(ticket.status)]) return false;
        if (!ticketHasLabel(ticket, labelFilter)) return false;
        return true;
      }),
    [labelFilter, statusFilters, tickets]
  );

  const selectedVisibleWorkstreamIds = useMemo(
    () =>
      new Set(
        baseFilteredTickets
          .filter((ticket) => {
            const id = normalizeTicketSelectionToken(ticket.id || ticket.fileId);
            return selectedTicketIdSet.has(String(id || "")) && isWorkstream(ticket);
          })
          .map((ticket) => ticketId(ticket))
      ),
    [baseFilteredTickets, selectedTicketIdSet]
  );

  const filteredTickets = useMemo(
    () =>
      baseFilteredTickets.filter((ticket) => {
        if (selectedTicketIdSet.size === 0) return true;

        const id = normalizeTicketSelectionToken(ticket.id || ticket.fileId);
        const parentId = parentTicketId(ticket);
        return selectedTicketIdSet.has(String(id || "")) || selectedVisibleWorkstreamIds.has(parentId);
      }),
    [baseFilteredTickets, selectedTicketIdSet, selectedVisibleWorkstreamIds]
  );

  const visibleRows = useMemo(() => {
    const workstreamIds = new Set(filteredTickets.filter(isWorkstream).map((ticket) => ticketId(ticket)));
    const childrenByWorkstream = new Map<string, TicketSummary[]>();

    for (const ticket of filteredTickets) {
      if (isWorkstream(ticket)) continue;
      const parentId = parentTicketId(ticket);
      if (!parentId || !workstreamIds.has(parentId)) continue;
      const existing = childrenByWorkstream.get(parentId);
      if (existing) existing.push(ticket);
      else childrenByWorkstream.set(parentId, [ticket]);
    }

    const rows: VisibleTicketRow[] = [];

    for (const ticket of filteredTickets) {
      if (isWorkstream(ticket)) {
        const id = ticketId(ticket);
        const children = childrenByWorkstream.get(id) || [];
        const expanded = expandedWorkstreamIds.includes(id);
        rows.push({
          ticket,
          depth: 0,
          isWorkstream: true,
          isExpanded: expanded,
          hasChildren: children.length > 0,
        });
        if (expanded) {
          for (const child of children) {
            rows.push({
              ticket: child,
              depth: 1,
              isWorkstream: false,
              isExpanded: false,
              hasChildren: false,
            });
          }
        }
        continue;
      }

      const parentId = parentTicketId(ticket);
      if (parentId && workstreamIds.has(parentId)) continue;

      rows.push({
        ticket,
        depth: 0,
        isWorkstream: false,
        isExpanded: false,
        hasChildren: false,
      });
    }

    return rows;
  }, [expandedWorkstreamIds, filteredTickets]);

  const visibleColumnCount = useMemo(
    () => Math.max(1, countEnabledColumns(columnConfigByView.desktop)),
    [columnConfigByView.desktop]
  );

  const toggleWorkstream = useCallback((workstreamId: string) => {
    setExpandedWorkstreamIds((current) =>
      current.includes(workstreamId)
        ? current.filter((id) => id !== workstreamId)
        : [...current, workstreamId]
    );
  }, []);

  const mobileTicketCards = useMemo(
    () =>
      visibleRows.map((row) => {
        const ticket = row.ticket;
        const status = normalizeStatus(ticket.status);
        const id = ticketId(ticket);

        return (
          <div
            className={cn(
              "rounded-lg border px-2 py-2 transition-colors",
              rowSurfaceClasses(row),
              row.depth === 1 ? "ml-6" : ""
            )}
            key={`mobile-${ticket.fileName || id || ticket.title}`}
          >
            <div className="grid grid-cols-[3.25rem_1fr_auto] items-start gap-x-2">
              <div className="flex items-start gap-1 font-mono text-xs text-foreground">
                {row.depth === 0 && row.isWorkstream ? (
                  <button
                    aria-label={row.isExpanded ? `Collapse workstream ${id}` : `Expand workstream ${id}`}
                    className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border border-border bg-background text-[10px] hover:bg-muted/50"
                    type="button"
                    onClick={() => toggleWorkstream(id)}
                  >
                    {row.isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  </button>
                ) : (
                  <span className="inline-block h-4 w-4" aria-hidden="true" />
                )}
                <span>{ticket.id || ticket.fileId || ""}</span>
              </div>
              <div>
                <a
                  className={cn(
                    "ticket-link text-xs text-primary hover:underline break-words [overflow-wrap:anywhere]",
                    row.isWorkstream ? "font-semibold tracking-[0.01em]" : "font-medium"
                  )}
                  href={`/project/${encodeURIComponent(selectedProjectId || "")}/ticket/${encodeURIComponent(id)}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {ticket.title || "(untitled)"}
                </a>
              </div>
              <Badge className={cn("w-fit", status === "doing" ? "status-doing-pulse" : "")} variant={statusVariant(status)}>
                {status}
              </Badge>
            </div>
            {ticketHierarchyText(ticket) ? (
              <div className="mt-2 text-[11px] text-muted-foreground">{ticketHierarchyText(ticket)}</div>
            ) : null}
          </div>
        );
      }),
    [selectedProjectId, toggleWorkstream, visibleRows]
  );

  const onToggleColumn = useCallback(
    (target: "desktop" | "mobile", columnKey: TicketColumnKey) => {
      setColumnConfigByView((current) => {
        const currentTargetColumns = current[target];
        const enabledCount = countEnabledColumns(currentTargetColumns);
        if (currentTargetColumns[columnKey] && enabledCount === 1) {
          setStatusMessage("At least one column must remain visible.");
          return current;
        }

        const nextTargetColumns = {
          ...currentTargetColumns,
          [columnKey]: !currentTargetColumns[columnKey],
        };
        const next = {
          ...current,
          [target]: nextTargetColumns,
        };

        void persistColumns(target, nextTargetColumns).catch((err) => {
          const message = err instanceof Error ? err.message : "Unable to save column settings.";
          setStatusMessage(`Unable to save column settings: ${message}`);
          setColumnConfigByView(current);
        });

        return next;
      });
    },
    [persistColumns]
  );

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto w-full max-w-[1440px]">
        <PageHeader
          intervalMs={config.pollMs}
          project={project}
          activeProjectPath={project?.path || "-"}
          lastRefreshText={lastRefreshText}
          hideMetaOnMobile={!isMobileChromeVisible}
        />

        <div className="mb-3 flex justify-end md:hidden">
          <button
            className="h-7 rounded-md border border-border bg-background px-2 text-[10px] font-semibold uppercase tracking-wide text-foreground hover:bg-muted/50"
            type="button"
            onClick={() => setIsMobileChromeVisible((current) => !current)}
          >
            {isMobileChromeVisible ? "Hide Controls" : "Show Controls"}
          </button>
        </div>

        <div
          className={cn(
            "mb-4 md:rounded-xl md:border md:bg-card md:text-card-foreground md:shadow",
            isMobileChromeVisible ? "block" : "hidden md:block"
          )}
        >
          <div className="space-y-4 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium text-muted-foreground">Ticket filters</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Show</span>
                <div className="inline-flex overflow-hidden rounded-md border border-border" id="status-filters">
                  {FILTER_STATUSES.map((status) => (
                    <button
                      key={status}
                      className={cn(
                        `filter-btn status-${status} h-7 border-l border-border px-2 text-[10px] font-semibold uppercase tracking-wide transition-colors first:border-l-0`,
                        statusToggleClasses(status, statusFilters[status])
                      )}
                      type="button"
                      onClick={() => {
                        setStatusFilters((current) => ({
                          ...current,
                          [status]: !current[status],
                        }));
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground" htmlFor="label-filter-input">
                    Label
                  </label>
                  <Input
                    id="label-filter-input"
                    className="h-9 w-40"
                    placeholder="e.g. BUG"
                    value={labelFilter}
                    onChange={(event) => setLabelFilter(event.currentTarget.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground" htmlFor="ticket-selection-input">
                    Tickets
                  </label>
                  <Input
                    id="ticket-selection-input"
                    className="h-9 w-56"
                    placeholder="e.g. 12, 42, 105"
                    value={ticketSelectionInput}
                    onChange={(event) => setTicketSelectionInput(event.currentTarget.value)}
                  />
                </div>

                <div className="relative" ref={columnPopupRef}>
                  <button
                    className="h-7 rounded-md border border-border bg-background px-2 text-[10px] font-semibold uppercase tracking-wide text-foreground hover:bg-muted/50"
                    type="button"
                    onClick={() => setIsColumnPopupOpen((current) => !current)}
                  >
                    Columns
                  </button>
                  {isColumnPopupOpen ? (
                    <div className="absolute right-0 z-30 mt-2 w-56 rounded-md border border-border bg-popover p-2 shadow-lg">
                      <div className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                        Columns
                      </div>
                      <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 border-b border-border/70 px-1 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <span>Field</span>
                        <span className="justify-self-center">Desktop</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {COLUMN_OPTIONS.map((column) => (
                          <div
                            className="grid grid-cols-[1fr_auto] items-center gap-x-2 rounded px-1 py-1 text-xs hover:bg-muted/40"
                            key={`column-${column.key}`}
                          >
                            <span>{column.label}</span>
                            <input
                              checked={columnConfigByView.desktop[column.key]}
                              className="h-3.5 w-3.5 justify-self-center"
                              type="checkbox"
                              onChange={() => onToggleColumn("desktop", column.key)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <Alert id="f-report-status">{statusMessage}</Alert>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {mobileTicketCards.length > 0 ? (
            mobileTicketCards
          ) : (
            <div className="text-sm text-muted-foreground">
              {tickets.length > 0 ? "No workstreams or orphaned jobs match current filters." : "No tickets found in selected project."}
            </div>
          )}
        </div>

        <Card className="hidden md:block">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  {columnConfigByView.desktop.id ? <TableHead>id</TableHead> : null}
                  {columnConfigByView.desktop.title ? <TableHead>title</TableHead> : null}
                  {columnConfigByView.desktop.type ? <TableHead>type</TableHead> : null}
                  {columnConfigByView.desktop.status ? <TableHead>status</TableHead> : null}
                  {columnConfigByView.desktop.priority ? <TableHead>priority</TableHead> : null}
                  {columnConfigByView.desktop.owner ? <TableHead>owner</TableHead> : null}
                  {columnConfigByView.desktop.labels ? <TableHead>labels</TableHead> : null}
                  {columnConfigByView.desktop.updated ? <TableHead>updated</TableHead> : null}
                  {columnConfigByView.desktop.updates ? <TableHead>updates</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody id="rows">
                {visibleRows.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-muted-foreground" colSpan={visibleColumnCount}>
                      {tickets.length > 0
                        ? "No workstreams or orphaned jobs match current filters."
                        : "No tickets found in selected project."}
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRows.map((row) => {
                    const ticket = row.ticket;
                    const status = normalizeStatus(ticket.status);
                    const updated = formatUpdatedParts(ticket);
                    const id = ticketId(ticket);

                    return (
                      <TableRow
                        className={cn(
                          "transition-colors",
                          row.isWorkstream ? "bg-sky-500/[0.045]" : "",
                          row.depth === 1 ? "bg-muted/10" : "",
                          !row.isWorkstream && row.depth === 0 ? "bg-stone-500/[0.025]" : ""
                        )}
                        key={`${ticket.fileName || id || ticket.title}`}
                      >
                        {columnConfigByView.desktop.id ? (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {row.depth === 0 && row.isWorkstream ? (
                                <button
                                  aria-label={row.isExpanded ? `Collapse workstream ${id}` : `Expand workstream ${id}`}
                                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background text-[10px] hover:bg-muted/50"
                                  type="button"
                                  onClick={() => toggleWorkstream(id)}
                                >
                                  {row.isExpanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                                </button>
                              ) : (
                                <span className="inline-block h-5 w-5 shrink-0" aria-hidden="true" />
                              )}
                              <span>{ticket.id || ticket.fileId || ""}</span>
                            </div>
                          </TableCell>
                        ) : null}
                        {columnConfigByView.desktop.title ? (
                          <TableCell>
                            <div className={cn("flex items-start gap-2", row.depth === 1 ? "pl-6" : "")}>
                              {!columnConfigByView.desktop.id && row.depth === 0 && row.isWorkstream ? (
                                <button
                                  aria-label={row.isExpanded ? `Collapse workstream ${id}` : `Expand workstream ${id}`}
                                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background text-[10px] hover:bg-muted/50"
                                  type="button"
                                  onClick={() => toggleWorkstream(id)}
                                >
                                  {row.isExpanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                                </button>
                              ) : !columnConfigByView.desktop.id ? (
                                <span className="inline-block h-5 w-5 shrink-0" aria-hidden="true" />
                              ) : null}
                              <div className="min-w-0">
                                <a
                                  className={cn(
                                    "ticket-link text-primary hover:underline",
                                    row.isWorkstream ? "font-semibold tracking-[0.01em]" : "font-medium"
                                  )}
                                  href={`/project/${encodeURIComponent(selectedProjectId || "")}/ticket/${encodeURIComponent(id)}`}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  {ticket.title || "(untitled)"}
                                </a>
                                <div className="mt-1 text-xs text-muted-foreground">{ticketHierarchyText(ticket)}</div>
                              </div>
                            </div>
                          </TableCell>
                        ) : null}
                        {columnConfigByView.desktop.type ? (
                          <TableCell>
                            {String(ticket.type || "").trim()}
                          </TableCell>
                        ) : null}
                        {columnConfigByView.desktop.status ? (
                          <TableCell>
                            <Badge className={status === "doing" ? "status-doing-pulse" : ""} variant={statusVariant(status)}>
                              {status}
                            </Badge>
                          </TableCell>
                        ) : null}
                        {columnConfigByView.desktop.priority ? <TableCell>{ticket.priority || ""}</TableCell> : null}
                        {columnConfigByView.desktop.owner ? <TableCell>{ticket.owner || ""}</TableCell> : null}
                        {columnConfigByView.desktop.labels ? <TableCell>{ticket.labels || ""}</TableCell> : null}
                        {columnConfigByView.desktop.updated ? (
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <span>{updated.date || ""}</span>
                              <span className="text-muted-foreground">{updated.time || ""}</span>
                            </div>
                          </TableCell>
                        ) : null}
                        {columnConfigByView.desktop.updates ? (
                          <TableCell className="max-w-[360px] whitespace-pre-wrap break-words text-xs text-muted-foreground">
                            {String(ticket.updates || "").trim()}
                          </TableCell>
                        ) : null}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
