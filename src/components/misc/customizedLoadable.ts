import Loadable from "react-loadable";
import { LoadableComponent, Options } from "react-loadable";

function CustomizedLoadable<Props, Exports extends object>(
  options: Options<Props, Exports>
): React.ComponentType<Props> & LoadableComponent {
  return Loadable<Props, Exports>({ delay: 200, ...options });
}

export default CustomizedLoadable;
