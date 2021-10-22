import { ModelProvider } from "./model";
import Loadable from "../misc/customizedLoadable";

const Routes = Loadable({
  loader: () => import("./routes"),
});

export default function GameRecords() {
  return (
    <ModelProvider>
      <Routes />
    </ModelProvider>
  );
}
