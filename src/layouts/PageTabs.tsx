import { CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_MENUS, menuByPath, type AppMenuLeaf } from "./menu";

export default function PageTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = menuByPath(location.pathname);
  const [tabs, setTabs] = useState<AppMenuLeaf[]>([APP_MENUS[0]]);

  useEffect(() => {
    setTabs((prev) =>
      prev.some((tab) => tab.path === current.path) ? prev : [...prev, current],
    );
  }, [current]);

  const closeTab = (path: string) => {
    const next = tabs.filter((tab) => tab.path !== path);
    const fallback = next[next.length - 1] || APP_MENUS[0];
    setTabs(next.length ? next : [APP_MENUS[0]]);
    if (current.path === path) {
      navigate(fallback.path);
    }
  };

  return (
    <div className="page-tabs">
      {tabs.map((tab) => {
        const active = tab.path === current.path;
        return (
          <button
            key={tab.path}
            type="button"
            className={`chrome-tab${active ? " chrome-tab_active" : ""}`}
            onClick={() => navigate(tab.path)}
          >
            <tab.icon />
            <span>{tab.title}</span>
            {tab.closable ? (
              <CloseOutlined
                className="chrome-tab__close"
                onClick={(event) => {
                  event.stopPropagation();
                  closeTab(tab.path);
                }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
