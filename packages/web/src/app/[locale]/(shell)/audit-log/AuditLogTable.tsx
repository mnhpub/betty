"use client";

import { Fragment, useState, useTransition } from "react";
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  Tag,
  Grid,
  Column,
  Modal,
  TextInput,
  TextArea,
  InlineNotification,
} from "@carbon/react";
import { Plus } from "lucide-react";
import { addJournalEntryAction } from "./actions";
import type { AuditEvent } from "@/lib/audit";
import { OVERRIDE_MARKER } from "@/lib/audit-shared";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function shorten(value: string, length = 10): string {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

// The override marker rides along in the stored data blob (see lib/audit.ts) — split it back out
// so the table shows only the payload a user actually typed.
function splitOverrideMarker(data: Record<string, unknown>): { payload: Record<string, unknown>; isOverride: boolean } {
  const { [OVERRIDE_MARKER]: marker, ...payload } = data;
  return { payload, isOverride: Boolean(marker) };
}

export default function AuditLogTable({ events, dict }: { events: AuditEvent[]; dict: Dictionary["auditLog"] }) {
  const [open, setOpen] = useState(false);
  const [aggregateId, setAggregateId] = useState("");
  const [aggregateType, setAggregateType] = useState("");
  const [eventType, setEventType] = useState("");
  const [dataText, setDataText] = useState("{}");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const headers = [
    { key: "timestamp", header: dict.headers.timestamp },
    { key: "aggregateType", header: dict.headers.aggregateType },
    { key: "aggregateId", header: dict.headers.aggregateId },
    { key: "eventType", header: dict.headers.eventType },
    { key: "createdBy", header: dict.headers.createdBy },
    { key: "data", header: dict.headers.data },
  ];

  // Keyed by row id so cell renderers can pull the override flag and the marker-stripped payload
  // without re-deriving them per cell.
  const eventsById = new Map(events.map((e) => [e.id, splitOverrideMarker(e.data)]));

  const rows = events.map((e) => ({
    id: e.id,
    // ISO so the built-in sort orders chronologically; the cell renderer reformats for display.
    timestamp: new Date(e.timestamp).toISOString(),
    aggregateType: e.aggregateType,
    aggregateId: e.aggregateId,
    eventType: e.eventType,
    createdBy: e.createdBy,
    data: JSON.stringify(eventsById.get(e.id)?.payload ?? {}),
  }));

  function resetForm() {
    setAggregateId("");
    setAggregateType("");
    setEventType("");
    setDataText("{}");
    setError(undefined);
  }

  function closeModal() {
    setOpen(false);
    resetForm();
  }

  function submit() {
    setError(undefined);

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(dataText);
    } catch {
      setError(dict.modal.invalidJson);
      return;
    }
    if (typeof parsedData !== "object" || parsedData === null || Array.isArray(parsedData)) {
      setError(dict.modal.dataMustBeObject);
      return;
    }

    startTransition(async () => {
      const result = await addJournalEntryAction({
        aggregateId,
        aggregateType,
        eventType,
        data: parsedData as Record<string, unknown>,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      closeModal();
    });
  }

  const canSubmit = Boolean(aggregateId.trim() && aggregateType.trim() && eventType.trim());

  return (
    <Grid className="audit-log-page" fullWidth>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: "1rem" }}>{dict.title}</h1>
        <DataTable rows={rows} headers={headers} isSortable>
          {({
            rows: tableRows,
            headers: tableHeaders,
            getTableProps,
            getHeaderProps,
            getRowProps,
            getToolbarProps,
            onInputChange,
          }) => (
            <TableContainer>
              <TableToolbar {...getToolbarProps()}>
                <TableToolbarContent>
                  <TableToolbarSearch onChange={onInputChange} persistent />
                  <Button renderIcon={Plus} onClick={() => setOpen(true)}>
                    {dict.addEvent}
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader aria-label={dict.expandRow} />
                    {tableHeaders.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headers.length + 1}>{dict.noData}</TableCell>
                    </TableRow>
                  ) : (
                    tableRows.map((row) => {
                      const meta = eventsById.get(row.id);
                      return (
                        <Fragment key={row.id}>
                          <TableExpandRow {...getRowProps({ row })}>
                            {row.cells.map((cell) => {
                              if (cell.info.header === "timestamp") {
                                return <TableCell key={cell.id}>{new Date(cell.value).toLocaleString()}</TableCell>;
                              }
                              if (cell.info.header === "aggregateId" || cell.info.header === "createdBy") {
                                return (
                                  <TableCell key={cell.id}>
                                    <span title={cell.value}>{shorten(cell.value)}</span>
                                  </TableCell>
                                );
                              }
                              if (cell.info.header === "eventType") {
                                return (
                                  <TableCell key={cell.id}>
                                    {cell.value}
                                    {meta?.isOverride && (
                                      <Tag type="purple" size="sm" style={{ marginLeft: "0.5rem" }}>
                                        {dict.overrideTag}
                                      </Tag>
                                    )}
                                  </TableCell>
                                );
                              }
                              if (cell.info.header === "data") {
                                return (
                                  <TableCell key={cell.id}>
                                    <code title={cell.value}>{shorten(cell.value, 40)}</code>
                                  </TableCell>
                                );
                              }
                              return <TableCell key={cell.id}>{cell.value}</TableCell>;
                            })}
                          </TableExpandRow>
                          {row.isExpanded && (
                            <TableExpandedRow colSpan={headers.length + 1}>
                              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                                {JSON.stringify(meta?.payload ?? {}, null, 2)}
                              </pre>
                            </TableExpandedRow>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </Column>

      <Modal
        open={open}
        modalHeading={dict.modal.heading}
        primaryButtonText={pending ? dict.modal.submitPending : dict.modal.submit}
        secondaryButtonText={dict.modal.cancel}
        primaryButtonDisabled={pending || !canSubmit}
        onRequestClose={closeModal}
        onRequestSubmit={submit}
        onSecondarySubmit={closeModal}
      >
        {error && (
          <InlineNotification kind="error" title={error} hideCloseButton lowContrast style={{ marginBottom: "1rem" }} />
        )}
        <TextInput
          id="journal-aggregate-id"
          labelText={dict.modal.aggregateIdLabel}
          value={aggregateId}
          onChange={(e) => setAggregateId(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />
        <TextInput
          id="journal-aggregate-type"
          labelText={dict.modal.aggregateTypeLabel}
          value={aggregateType}
          onChange={(e) => setAggregateType(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />
        <TextInput
          id="journal-event-type"
          labelText={dict.modal.eventTypeLabel}
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />
        <TextArea
          id="journal-data"
          labelText={dict.modal.dataLabel}
          helperText={dict.modal.dataHelper}
          value={dataText}
          onChange={(e) => setDataText(e.target.value)}
          rows={4}
        />
      </Modal>
    </Grid>
  );
}
