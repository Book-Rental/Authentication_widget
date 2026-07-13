import { createRoot, Root as ReactRoot } from "react-dom/client";
import "@rentbook/rentbook-ui-lib/microfrontend.min.css"
import "./index.css";
import App from "./App";
export interface WidgetOptions {
  containerElementId: string;
  name?: string;
}

declare global {
  interface Window {
    renderReactWidget: (config: string) => void;
    unmountReactWidget: (id: string) => void;
  }
}

const widgetRoots: Record<string, ReactRoot> = {};


function Root({ options }: { options: WidgetOptions }) {
  return <App options={options} />;

}

const getOptionsFromDataAttributes = (
  el: HTMLElement
): Partial<WidgetOptions> => ({
  name: el.getAttribute("data-name") || "",
});

window.renderReactWidget = (config: string) => {
  let parsedOptions: Partial<WidgetOptions> = {};

  try {
    parsedOptions = JSON.parse(config);
  } catch {
    console.warn("Invalid config JSON. Falling back to data-* attributes.");
  }

  const containerId =
    parsedOptions.containerElementId || config;

  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container "${containerId}" not found`);
    return;
  }

  const finalOptions: WidgetOptions = {
    ...getOptionsFromDataAttributes(container),
    ...parsedOptions,
    containerElementId: containerId,
  };

  if (widgetRoots[containerId]) {
    widgetRoots[containerId].unmount();
  }

  const root = createRoot(container);

  root.render(


    <Root options={finalOptions} />


  );

  widgetRoots[containerId] = root;
};

window.unmountReactWidget = (containerId: string) => {
  widgetRoots[containerId]?.unmount();
  delete widgetRoots[containerId];
};