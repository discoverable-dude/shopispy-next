/**
 * Centralized error handling utilities
 */

export interface AppError {
  title: string;
  message: string;
  code?: string;
  retryable?: boolean;
}

export const parseSupabaseError = (error: any): AppError => {
  // Authentication errors
  if (error.message?.includes("Invalid login credentials")) {
    return {
      title: "Login Failed",
      message: "The email or password you entered is incorrect. Please try again.",
      code: "AUTH_INVALID_CREDENTIALS",
      retryable: true,
    };
  }

  if (error.message?.includes("Email not confirmed")) {
    return {
      title: "Email Not Confirmed",
      message: "Please check your email and click the confirmation link.",
      code: "AUTH_EMAIL_NOT_CONFIRMED",
      retryable: false,
    };
  }

  if (error.message?.includes("User already registered")) {
    return {
      title: "Account Exists",
      message: "An account with this email already exists. Please sign in instead.",
      code: "AUTH_USER_EXISTS",
      retryable: false,
    };
  }

  // Network errors
  if (error.message?.includes("Failed to fetch") || error.message?.includes("Network")) {
    return {
      title: "Connection Error",
      message: "Unable to connect to the server. Please check your internet connection.",
      code: "NETWORK_ERROR",
      retryable: true,
    };
  }

  // Rate limiting
  if (error.message?.includes("rate limit") || error.status === 429) {
    return {
      title: "Too Many Requests",
      message: "You've made too many requests. Please wait a moment and try again.",
      code: "RATE_LIMIT_EXCEEDED",
      retryable: true,
    };
  }

  // Database errors
  if (error.message?.includes("violates row-level security")) {
    return {
      title: "Access Denied",
      message: "You don't have permission to perform this action.",
      code: "RLS_VIOLATION",
      retryable: false,
    };
  }

  // Generic error
  return {
    title: "Error",
    message: error.message || "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
    retryable: true,
  };
};

export const logError = (error: any, context?: string) => {
  if (process.env.NODE_ENV === "development") {
    console.error(`[Error${context ? ` - ${context}` : ""}]:`, error);
  }
  // In production, you might want to send to an error tracking service
};
