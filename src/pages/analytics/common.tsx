import { DatePicker, message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage, type RangeParams } from "../../api/analytics";

const { RangePicker } = DatePicker;

export type DayRange = [Dayjs, Dayjs];

export function defaultRange(days = 7): DayRange {
  return [dayjs().subtract(days - 1, "day"), dayjs()];
}

export function toParams(r: DayRange): RangeParams {
  return { from: r[0].format("YYYY-MM-DD"), to: r[1].format("YYYY-MM-DD") };
}

export function RangeBar({ value, onChange }: { value: DayRange; onChange: (r: DayRange) => void }) {
  return (
    <RangePicker
      allowClear={false}
      value={value}
      presets={[
        { label: "近 7 天", value: defaultRange(7) },
        { label: "近 14 天", value: defaultRange(14) },
        { label: "近 30 天", value: defaultRange(30) },
      ]}
      disabledDate={(d) => d.isAfter(dayjs(), "day")}
      onChange={(v) => {
        if (v?.[0] && v?.[1]) onChange([v[0], v[1]]);
      }}
    />
  );
}

/** Loads data with a loading flag and a server-message toast; ignores stale responses. */
export function useLoader<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);
  const reload = useCallback(() => {
    const mine = ++seq.current;
    setLoading(true);
    fn()
      .then((d) => {
        if (mine === seq.current) setData(d);
      })
      .catch(async (e) => {
        if (mine === seq.current) message.error(await errorMessage(e));
      })
      .finally(() => {
        if (mine === seq.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    reload();
  }, [reload]);
  return { data, loading, reload };
}

export const pct = (v: number | null | undefined, digits = 1) =>
  v == null ? "—" : `${(v * 100).toFixed(digits)}%`;

export const ms = (v: number | null | undefined) => (v == null ? "—" : v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${v}ms`);

export const EVENT_LABELS: Record<string, string> = {
  "app.launched": "启动 App",
  "auth.login_succeeded": "登录成功",
  "page.viewed": "页面浏览",
  "item.exposed": "列表曝光",
  "item.clicked": "列表点击",
  "activity.detail_viewed": "看活动详情",
  "activity.join_clicked": "点击参加",
  "activity.join_succeeded": "参加成功",
  "commerce.pay_succeeded": "支付成功",
  "companion.detail_viewed": "看搭子详情",
  "companion.slot_selected": "选档期",
  "companion.booking_created": "预约下单",
  "club.feed_viewed": "俱乐部列表",
  "club.detail_viewed": "看俱乐部",
  "club.join_clicked": "点击加入",
  "club.join_succeeded": "加入成功",
  "community.feed_viewed": "广场浏览",
  "community.post_viewed": "看帖子",
  "community.post_liked": "点赞",
};

export const eventLabel = (e: string) => EVENT_LABELS[e] || e;
