import React from "react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { buttonStyles } from "../ui/buttonStyles";

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "We hit a snag loading this page.";
  let code = "500";

  if (isRouteErrorResponse(error)) {
    code = String(error.status);
    if (error.status === 404) {
      title = "Page not found";
      message = "We couldn't find the page you were looking for.";
    } else {
      title = error.statusText || "Something went wrong";
      message = typeof error.data === "string" ? error.data : message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-linen p-6 text-ink">
      <Card variant="quiet" padding="lg" className="w-full max-w-lg">
        <p className="font-display text-5xl font-semibold text-beet md:text-6xl">{code}</p>
        <div className="mt-4 border-t border-line pt-4">
          <h1 className="font-display text-xl font-semibold text-ink md:text-2xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{message}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <Link to="/" className={buttonStyles({ variant: "primary" })}>
            Go home
          </Link>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </Card>
    </div>
  );
};
