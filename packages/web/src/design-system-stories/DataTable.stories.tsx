import type { Meta, StoryObj } from "@storybook/nextjs-vite";
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
} from "@carbon/react";
import { Plus } from "lucide-react";

const meta: Meta<typeof DataTable> = {
  title: "DataTable",
  component: DataTable,
};
export default meta;

type Story = StoryObj<typeof DataTable>;

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
  { id: "3", name: "Deliverance Intensive", type: "Deliverance", members: "6", leader: "Sam Okafor", status: "waitlist" },
  { id: "4", name: "Summer 2025 Cohort", type: "Discipleship", members: "18", leader: "Marcus Reid", status: "archived" },
];

const statusTagType: Record<string, "green" | "cyan" | "gray"> = {
  active: "green",
  waitlist: "cyan",
  archived: "gray",
};

export const Default: Story = {
  render: () => (
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
              <Button renderIcon={Plus}>New group</Button>
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
  ),
};
