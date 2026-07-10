"use client";

import { useState, useTransition } from "react";
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
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
  Select,
  SelectItem,
  InlineNotification,
} from "@carbon/react";
import { Plus } from "lucide-react";
import { createGroupAction } from "./actions";
import type { ApiGroup, ApiGroupType } from "@/lib/groups";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const statusTagType: Record<string, "green" | "cyan" | "gray"> = {
  active: "green",
  waitlist: "cyan",
  archived: "gray",
};

export default function GroupsTable({
  groups,
  groupTypes,
  dict,
}: {
  groups: ApiGroup[];
  groupTypes: ApiGroupType[];
  dict: Dictionary["groups"];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [groupTypeId, setGroupTypeId] = useState(groupTypes[0]?.id ?? "");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const headers = [
    { key: "name", header: dict.headers.name },
    { key: "type", header: dict.headers.type },
    { key: "members", header: dict.headers.members },
    { key: "leader", header: dict.headers.leader },
    { key: "status", header: dict.headers.status },
  ];

  const rows = groups.map((g) => ({
    id: g.id,
    name: g.name,
    type: g.type,
    members: String(g.member_count),
    leader: g.leader ?? dict.noLeader,
    status: g.status,
  }));

  function submit() {
    setError(undefined);
    startTransition(async () => {
      const result = await createGroupAction(name, groupTypeId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setName("");
      setOpen(false);
    });
  }

  return (
    <Grid className="groups-page" fullWidth>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: "1rem" }}>{dict.title}</h1>
        <DataTable rows={rows} headers={headers}>
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
                    {dict.newGroup}
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {tableHeaders.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row) => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) =>
                        cell.info.header === "status" ? (
                          <TableCell key={cell.id}>
                            <Tag type={statusTagType[cell.value] ?? "gray"}>
                              {dict.statuses[cell.value as keyof typeof dict.statuses] ?? cell.value}
                            </Tag>
                          </TableCell>
                        ) : (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ),
                      )}
                    </TableRow>
                  ))}
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
        primaryButtonDisabled={pending || !name.trim()}
        onRequestClose={() => setOpen(false)}
        onRequestSubmit={submit}
        onSecondarySubmit={() => setOpen(false)}
      >
        {error && (
          <InlineNotification kind="error" title={error} hideCloseButton lowContrast style={{ marginBottom: "1rem" }} />
        )}
        <TextInput
          id="new-group-name"
          labelText={dict.modal.nameLabel}
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />
        <Select
          id="new-group-type"
          labelText={dict.modal.typeLabel}
          value={groupTypeId}
          onChange={(e) => setGroupTypeId(e.target.value)}
        >
          {groupTypes.map((t) => (
            <SelectItem key={t.id} value={t.id} text={t.name} />
          ))}
        </Select>
      </Modal>
    </Grid>
  );
}
