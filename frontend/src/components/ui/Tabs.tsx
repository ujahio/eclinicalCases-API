import React, { FunctionComponent } from "react";

interface TabsProps {
  tabs: string[];
  active: number;
  changeTab: (index: number) => void;
}

const Tabs: FunctionComponent<TabsProps> = ({ tabs, active, changeTab }) => {
  return (
    <ul className="flex items-center flex-nowrap overflow-x-auto px-5 process-tabs h-full space-x-5">
      {tabs.map((tab, index) => (
        <li className={`inline-flex items-center flex-shrink-0 h-full ${active === index ? "active" : ""}`} key={index}>
          <button
            className="text-xs font-medium uppercase text-grey-300 transition-colors h-full inline-flex items-center relative"
            onClick={() => changeTab(index)}
          >
            {tab}
          </button>
        </li>
      ))}
      <li className="p-2.5" />
    </ul>
  );
};

export default Tabs;
