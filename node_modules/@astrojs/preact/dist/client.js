import { h, hydrate, render } from "preact";
import StaticHtml from "./static-html.js";
const sharedSignalMap = /* @__PURE__ */ new Map();
var client_default = (element) => async (Component, props, { default: children, ...slotted }, { client }) => {
  if (!element.hasAttribute("ssr")) return;
  for (const [key, value] of Object.entries(slotted)) {
    props[key] = h(StaticHtml, { value, name: key });
  }
  let signalsRaw = element.dataset.preactSignals;
  if (signalsRaw) {
    const { signal } = await import("@preact/signals");
    let signals = JSON.parse(
      element.dataset.preactSignals
    );
    for (const [propName, signalId] of Object.entries(signals)) {
      if (Array.isArray(signalId)) {
        signalId.forEach(([id, indexOrKeyInProps]) => {
          const mapValue = props[propName][indexOrKeyInProps];
          let valueOfSignal = mapValue;
          if (typeof indexOrKeyInProps !== "string") {
            valueOfSignal = mapValue[0];
            indexOrKeyInProps = mapValue[1];
          }
          if (!sharedSignalMap.has(id)) {
            const signalValue = signal(valueOfSignal);
            sharedSignalMap.set(id, signalValue);
          }
          props[propName][indexOrKeyInProps] = sharedSignalMap.get(id);
        });
      } else {
        if (!sharedSignalMap.has(signalId)) {
          const signalValue = signal(props[propName]);
          sharedSignalMap.set(signalId, signalValue);
        }
        props[propName] = sharedSignalMap.get(signalId);
      }
    }
  }
  const bootstrap = client !== "only" ? hydrate : render;
  bootstrap(
    h(Component, props, children != null ? h(StaticHtml, { value: children }) : children),
    element
  );
  element.addEventListener("astro:unmount", () => render(null, element), { once: true });
};
export {
  client_default as default
};
