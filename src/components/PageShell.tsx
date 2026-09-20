import { Typography } from "antd";
import type { ReactNode } from "react";

export default function PageShell({
  title,
  desc,
  extra,
  children,
}: {
  title: string;
  desc?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="card-wrapper">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
        <div>
          <Typography.Title level={4} className="page-title" style={{ marginBottom: 4 }}>
            {title}
          </Typography.Title>
          {desc ? <Typography.Paragraph type="secondary">{desc}</Typography.Paragraph> : null}
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}
