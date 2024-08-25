import { useState } from "react";

const useProcessTabs = (tabs: string[], activeTab: number) => {
  const [active, setActive] = useState(activeTab);
  const keys = tabs.map((tab) => tab.toLocaleLowerCase().split(" ").join("_"));

  const isActive = (key: string) => {
    const keyId = keys.indexOf(key);

    return keyId === active;
  };

  const switchByKey = (key: string) => {
    const keyId = keys.indexOf(key);

    setActive(keyId === -1 ? 0 : keyId);
  };

  return {
    active,
    isActive,
    switchTab: setActive,
    switchByKey,
  };
};

export default useProcessTabs;
