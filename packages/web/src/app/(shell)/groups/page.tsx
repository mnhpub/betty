"use client";

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
} from "@carbon/react";
import { Add } from "@carbon/icons-react";

// Mock data — stands in for TPOF-2 (Groups: creation and management) until
// that data model and API endpoint exist.
const headers = [
  { key: "name", header: "Group name" },
  { key: "type", header: "Type" },
  { key: "members", header: "Members" },
  { key: "leader", header: "Leader" },
  { key: "status", header: "Status" },
];

const rows = [
  { id: "1", name: "Tuesday Night Discipleship", type: "Discipleship", members: "14", leader: "Marcus Reid", status: "active" },
  { id: "2", name: "New Beginnings Recovery", type: "Recovery", members: "9", leader: "Dana Ortiz", status: "active" },
  { id: "3", name: "Young Adults Walking", type: "Walking", members: "22", leader: "Priya Nair", status: "active" },
  { id: "4", name: "Deliverance Intensive", type: "Deliverance", members: "6", leader: "Sam Okafor", status: "waitlist" },
  { id: "5", name: "Sharing Circle - West Campus", type: "Sharing", members: "11", leader: "Grace Kim", status: "active" },
  { id: "6", name: "Summer 2025 Cohort", type: "Discipleship", members: "18", leader: "Marcus Reid", status: "archived" },
];

const statusTagType: Record<string, "green" | "cyan" | "gray"> = {
  active: "green",
  waitlist: "cyan",
  archived: "gray",
};

export default function GroupsPage() {
  return (
    <Grid className="groups-page" fullWidth>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: "1rem" }}>Groups</h1>
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
                  <Button renderIcon={Add}>New group</Button>
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
                            <Tag type={statusTagType[cell.value] ?? "gray"}>{cell.value}</Tag>
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
    </Grid>
  );
}
