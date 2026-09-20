import type { ReactNode } from "react";
import { Table } from "antd";
import type { TableProps } from "antd";

/**
 * Thin ProTable-style wrapper: keeps pagination + loading conventions consistent.
 * Full URL-synced filters can land later; start by centralizing table chrome.
 */
export default function ProTable<T extends object>(props: TableProps<T> & { toolbar?: ReactNode }) {
  const { toolbar, pagination, ...rest } = props;
  return (
    <>
      {toolbar}
      <Table<T>
        {...rest}
        pagination={
          pagination === false
            ? false
            : {
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 条`,
                ...(typeof pagination === "object" ? pagination : {}),
              }
        }
      />
    </>
  );
}
