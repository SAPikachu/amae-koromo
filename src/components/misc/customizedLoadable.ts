import React from "react";
import Loadable from "react-loadable";
import { LoadableComponent, Options } from "react-loadable";

// eslint-disable-next-line @typescript-eslint/ban-types
function CustomizedLoadable<Props, Exports extends object>(
  options: Options<Props, Exports>
): React.ComponentType<Props> & LoadableComponent {
  return Loadable<Props, Exports>({ delay: 200, ...options });
}

export default CustomizedLoadable;
