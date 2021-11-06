export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object') {
    if (error instanceof Error) {
      return error.message;
    }

    if (Object.prototype.hasOwnProperty.call(error, 'message')) {
      return (error as { message: unknown }).message.toString();
    }
  }

  return error.toString();
};
