import Noty from "noty";
import "../../node_modules/noty/src/noty.scss";
import "../../node_modules/noty/src/themes/mint.scss";

export function error(message: string) {
  return new Noty({
    type: "error",
    text: message,
    layout: "top",
    killer: true,
    timeout: 5000,
  }).show();
}
