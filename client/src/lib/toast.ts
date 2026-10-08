import { toast } from "sonner";

/** Thin wrapper around sonner so call-sites don't import the toast library directly. */
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
};
