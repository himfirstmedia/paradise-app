export const INTERNAL_SERVER_ERROR = "Something went wrong. Please try again or contact support";
export const DEFAULT_ERROR_MESSAGE = {
   status: "FAILED",
   responseMessage: INTERNAL_SERVER_ERROR
};
export const NO_RECORDS_FOUND_ERROR_MESSAGE = "No records were found.";
export const ACCOUNT_ID_NOT_SET_ERROR_MESSAGE = "Opportunity account id is not set";

/**
 * Show error message for x milliseconds.
 *
 * @param contextref
 * @param message
 */
export const showErrorMessage = (contextref, message, time = 10000) => {
   contextref.current?.show({
      severity: "error",
      content: message,
      life: time,
      closable: false
   });
};

export const showSuccessMessage = (contextref, message, time = 10000) => {
   contextref.current?.show({
      severity: "success",
      content: message,
      life: time,
      closable: false
   });
};
