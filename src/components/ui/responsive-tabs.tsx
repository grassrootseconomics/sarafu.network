"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Authorization } from "~/hooks/useAuth";
import { type Permissions } from "~/utils/permissions";

interface TabOption<T extends keyof Permissions = keyof Permissions> {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  content?: React.ReactNode;
  // Optional authorization - if provided, tab will be wrapped in Authorization component
  authorization?: {
    resource: T;
    action: keyof Permissions[T];
    isOwner?: boolean;
  };
}

interface ResponsiveTabsProps<T extends keyof Permissions = keyof Permissions> {
  tabs: TabOption<T>[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  defaultTab?: string;
  children?: React.ReactNode;
  drawerTriggerClassName?: string;
  tabTriggerClassName?: string;
  drawerContentClassName?: string;
  tabsListClassName?: string;
  containerClassName?: string;
  contentClassName?: string;
}

export function ResponsiveTabs<
  T extends keyof Permissions = keyof Permissions
>({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange: controlledOnTabChange,
  defaultTab,
  children,
  drawerTriggerClassName,
  tabTriggerClassName,
  drawerContentClassName,
  tabsListClassName,
  containerClassName,
  contentClassName,
}: ResponsiveTabsProps<T>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab ?? tabs[0]?.value ?? ""
  );

  // Support both controlled and uncontrolled modes
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const onTabChange = controlledOnTabChange ?? setInternalActiveTab;

  const handleTabSelect = (value: string) => {
    onTabChange(value);
    setDrawerOpen(false);
  };

  const currentTab = tabs.find((tab) => tab.value === activeTab);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div
        className={
          containerClassName ||
          "border-b border-gray-200 bg-white rounded-2xl overflow-hidden"
        }
      >
        {/* Desktop Tabs */}
        <TabsList
          className={
            tabsListClassName ||
            "hidden md:flex w-full justify-start border-none rounded-none h-auto p-0"
          }
        >
          {tabs.map((tab) => {
            const trigger = (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={
                  tabTriggerClassName || "px-6 py-2 text-sm font-medium"
                }
              >
                {tab.label}
              </TabsTrigger>
            );

            if (tab.authorization) {
              return (
                <Authorization
                  key={tab.value}
                  resource={tab.authorization.resource}
                  action={tab.authorization.action}
                  isOwner={tab.authorization.isOwner}
                >
                  {trigger}
                </Authorization>
              );
            }

            return trigger;
          })}
        </TabsList>

        {/* Mobile Drawer */}
        <div className="md:hidden">
          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            dismissible={true}
          >
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className={
                  drawerTriggerClassName ||
                  "w-full h-14 justify-between text-left font-normal bg-gray-50 border-gray-200 hover:bg-gray-100"
                }
              >
                <div className="flex items-center gap-3">
                  {currentTab && "icon" in currentTab && (
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        drawerTriggerClassName?.includes("green")
                          ? "bg-green-200"
                          : "bg-gray-100"
                      }`}
                    >
                      <currentTab.icon
                        className={`h-4 w-4 ${
                          drawerTriggerClassName?.includes("green")
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-start">
                    <span
                      className={`font-semibold text-sm ${
                        drawerTriggerClassName?.includes("green")
                          ? "text-green-900"
                          : "text-gray-900"
                      }`}
                    >
                      {currentTab?.label}
                    </span>
                    <span
                      className={`text-xs ${
                        drawerTriggerClassName?.includes("green")
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {currentTab?.description}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 ${
                    drawerTriggerClassName?.includes("green")
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                />
              </Button>
            </DrawerTrigger>
            <DrawerContent className={drawerContentClassName || "p-2"}>
              <ScrollArea className="overflow-y-auto max-h-[85svh]">
                <div className="flex flex-col gap-1 p-2">
                  {tabs.map((tab, index) => {
                    const IconComponent = tab.icon;
                    const isGreenTheme =
                      drawerTriggerClassName?.includes("green");

                    const button = (
                      <Button
                        key={tab.value}
                        variant="ghost"
                        onClick={() => handleTabSelect(tab.value)}
                        className={`justify-start h-auto py-4 px-3 ${
                          isGreenTheme
                            ? "hover:bg-green-50"
                            : "hover:bg-gray-50"
                        } ${index > 0 ? "border-t border-gray-100" : ""}`}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 text-left">
                            <span className="font-semibold text-gray-900 text-sm">
                              {tab.label}
                            </span>
                            <span className="text-xs text-gray-500 leading-tight">
                              {tab.description}
                            </span>
                          </div>
                        </div>
                      </Button>
                    );

                    if (tab.authorization) {
                      return (
                        <Authorization
                          key={tab.value}
                          resource={tab.authorization.resource}
                          action={tab.authorization.action}
                          isOwner={tab.authorization.isOwner}
                        >
                          {button}
                        </Authorization>
                      );
                    }

                    return button;
                  })}
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <div className={contentClassName || "mt-4"}>
        {children ? (
          children
        ) : (
          <>
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="p-0 m-0"
              >
                {tab.content}
              </TabsContent>
            ))}
          </>
        )}
      </div>
    </Tabs>
  );
}
