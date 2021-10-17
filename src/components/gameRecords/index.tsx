import { ModelProvider } from "./model";
import Loadable from "../misc/customizedLoadable";
import Loading from "../misc/loading";

const Routes = Loadable({
  loader: () => import("./routes"),
  loading: () => <Loading />,
});

export default function GameRecords() {
  return (
    <ModelProvider>
      <Routes />
    </ModelProvider>
  );
}
