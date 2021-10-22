/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentType, ReactNode, Suspense } from "react";
import Loading from "./loading";

function CustomizedLoadable<T extends ComponentType<any>>({
  loader,
  loading = () => <Loading />,
}: {
  loader: () => Promise<{ default: T }>;
  loading?: () => ReactNode;
}): React.ComponentType<T extends ComponentType<infer TProps> ? TProps : unknown> {
  const LazyComponent = React.lazy(loader);

  return function (props: T extends ComponentType<infer TProps> ? TProps : unknown) {
    return (
      <Suspense fallback={loading() || null}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export default CustomizedLoadable;
