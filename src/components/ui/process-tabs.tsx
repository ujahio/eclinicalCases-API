import React, { FC } from "react";

interface ProcessTabsProps {
  tabs: string[];
  active: number;
  changeTab: (index: number) => void;
  canClickForward?: boolean;
  canClickBackward?: boolean;
  progress?: number;
}

const ProcessTabs: FC<ProcessTabsProps> = ({
  tabs,
  active,
  changeTab,
  canClickBackward = true,
  canClickForward = true,
  progress,
}) => {
  const isTabDisabled = (index: number) => {
    if (progress && index <= progress) {
      return false;
    }
    if (index === active) {
      return false;
    }
    if (!canClickForward && !canClickBackward) {
      return true;
    }
    if (!canClickForward && canClickBackward && index > active) {
      return true;
    }
    return false;
  };

  return (
    <ul className="flex items-center flex-nowrap overflow-x-auto process-tabs h-full">
      {tabs.map((tab, index) => (
        <li className={`inline-flex items-center h-full flex-shrink-0 ${active === index ? "active" : ""}`} key={index}>
          <button
            className="text-xs font-medium uppercase text-grey-300 transition-colors h-full inline-flex items-center relative"
            disabled={isTabDisabled(index)}
            onClick={() => changeTab(index)}
          >
            {tab}
          </button>
          {index < tabs.length - 1 && (
            <svg width="10" height="10" viewBox="0 0 16 16" className="text-grey-300 mx-2.5">
              <path
                d="M3,10H15.173L9.587,4.413,11,3l8,8-8,8L9.587,17.587,15.173,12H3Z"
                transform="translate(-3 -3)"
                fill="currentColor"
              />
            </svg>
          )}
        </li>
      ))}
      <li className="p-2.5" />
    </ul>
  );
};

export default ProcessTabs;
