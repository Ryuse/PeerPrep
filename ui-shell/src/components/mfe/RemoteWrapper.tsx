import React, { Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { SuspenseFallback } from "./SuspenseFallback";

interface RemoteWrapperProps<T extends object> {
  /** Function that dynamically imports a remote module */
  remote: () => Promise<{ default: React.ComponentType<T> }>;
  /** Props to pass to the remote component */
  remoteProps?: T;
  loadingMessage?: string;
  errorMessage?: string;
}

export function RemoteWrapper<T extends object>({
  remote,
  remoteProps,
  loadingMessage = "Loading...",
  errorMessage = "Service unavailable",
}: RemoteWrapperProps<T>) {
  const LazyComponent = React.lazy(remote);

  return (
    <ErrorBoundary fallback={<SuspenseFallback message={errorMessage} />}>
      <Suspense fallback={<SuspenseFallback message={loadingMessage} />}>
        <LazyComponent {...(remoteProps as T)} />
      </Suspense>
    </ErrorBoundary>
  );
}
