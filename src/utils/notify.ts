const implPromise = import("./notifyImpl");

export const error = function (message: string) {
  return implPromise.then((x) => x.error(message));
};

export default { error };
