/* eslint-disable @typescript-eslint/no-empty-function */
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useSnackbar, SnackbarMessage, OptionsObject, SnackbarKey } from "notistack";
import { useEffect } from "react";

let _enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey = () => "";
let _closeSnackbar: (key: SnackbarKey) => void = () => {};

export function RegisterSnackbarProvider() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  useEffect(() => {
    _enqueueSnackbar = enqueueSnackbar;
    _closeSnackbar = closeSnackbar;
    return () => {
      _enqueueSnackbar = () => "";
      _closeSnackbar = () => {};
    };
  }, [enqueueSnackbar, closeSnackbar]);
  return <></>;
}

export const error = function (message: string) {
  return _enqueueSnackbar(message, {
    variant: "error",
    action: (key) => (
      <IconButton
        color="inherit"
        onClick={() => {
          _closeSnackbar(key);
        }}
      >
        <Close />
      </IconButton>
    ),
  });
};

export default { error };
