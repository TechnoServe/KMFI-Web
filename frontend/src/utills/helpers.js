import exportFromJSON from 'export-from-json';

/**
 * Filters an array of objects by checking if a given key is included in the stringified version of each object.
 *
 * @param {string} key - The search term to look for within the objects.
 * @param {Object[]} arrayObject - Array of objects to search.
 * @returns {Object[]} Filtered array containing objects that match the search term.
 */
export const searchArrayOfObject =(key, arrayObject) =>{
  try {
    // Convert object to a lowercase string and check if it includes the lowercase search key
    return arrayObject.filter((items) => {
      const flatObject = JSON.stringify(items).toLowerCase();
      return flatObject.includes(key.toLowerCase());
    });
  } catch (e) {
    return arrayObject;
  }
};

/**
 * Triggers a CSV (or specified format) download of provided data using export-from-json.
 *
 * @param {Object} params - Download parameters.
 * @param {string} params.fileName - Name of the downloaded file.
 * @param {string} [params.exportType='csv'] - File type to export.
 * @param {Object[]} params.data - Array of data to export.
 * @returns {void}
 */
export const downloadCSV = ({fileName, exportType, data}) =>{
  // Use export-from-json to download the data as CSV or specified format
  return exportFromJSON({data, fileName, exportType: exportType || 'csv', withBOM: true});
};

/**
 * Extracts the first error message from an API error response.
 *
 * @param {Object} e - The API error object.
 * @param {string|null} [fallback=null] - Fallback message if no errors are found.
 * @returns {string|null} The first error message or the fallback.
 */
export const getApiResponseErrorMessage = (e, fallback = null) => {
  // Safely extract the errors object from the error response
  const {errors} = e || {};
  if (!errors) return fallback;
  // Flatten all error messages and return the first one
  const [first] = Object.keys(errors).reduce((acc, v) => ([...acc, ...errors[v]]), []);
  return first;
};


/**
 * Retrieves the currently selected company from local storage.
 *
 * @returns {Object|null} Parsed company object or null if not found.
 */
export const getCurrentCompany = () =>
  // Read and parse the 'company' object from localStorage
  JSON.parse(localStorage.getItem('company'));

/**
 * Pads a number to ensure it has at least two digits.
 *
 * @param {number} num - The number to pad.
 * @returns {string} A two-digit string representation of the number.
 */
export const padTo2Digits = (num) =>{
  // Convert number to string and pad with leading zero if needed
  return num.toString().padStart(2, '0');
};

/**
 * Formats a Date object into 'YYYY-MM-DD HH:mm' format.
 *
 * @param {Date} date - The date to format.
 * @returns {string} Formatted date string.
 */
export const formatDate = (date) => {
  // Format date and time parts separately and concatenate with space
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
    ].join(':')
  );
};
