import { useEffect, useState } from "react";
import { Button, Drawer, Table, Tag, message } from "antd";
import PageShell from "../components/PageShell";
import { fetchConversation, fetchConversations, type ConversationItem } from "../api/messaging";

export default function ConversationsPage() {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<unknown>(null);

  useEffect(() => {
    fetchConversations({ limit: 50, offset: 0 })
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="会话只读" desc="消息元数据；消息体在云 IM。">
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "标题", dataIndex: "title", ellipsis: true },
          { title: "类型", dataIndex: "kind", width: 100 },
          { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
          { title: "成员", dataIndex: "member_count", width: 80 },
          { title: "创建", dataIndex: "created_at", width: 180 },
          {
            title: "操作",
            width: 90,
            render: (_, row) => (
              <Button
                size="small"
                onClick={() =>
                  fetchConversation(row.id)
                    .then(setDetail)
                    .catch((e: Error) => message.error(e.message))
                }
              >
                详情
              </Button>
            ),
          },
        ]}
        pagination={false}
      />
      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} width={480} title="会话详情">
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(detail, null, 2)}</pre>
      </Drawer>
    </PageShell>
  );
}
