/**
 * Styles for the Mention input component using react-mentions.
 * Provides custom control, input, and suggestion list styling
 * for single-line mentions in the self-assessment comments feature.
 *
 * @module MentionWrapperStyle
 * @returns {Object} Style object to be consumed by react-mentions component
 */
export default {
  // Base style for the mention input control
  'control': {
    fontSize: 16,
    minWidth: 500
  },

  // Styles for single-line mention input field
  '&singleLine': {
    display: 'inline-block',

    // Highlighter box inside the single-line control
    highlighter: {
      padding: 1,
      border: 'none',
    },

    // Input box where user types the mention
    input: {
      'padding': 1,
      'border': 'none !important',
      '&focused': {
        border: 'none !important' // Remove border on focus
      },
    },
  },

  // Styling for the suggestions dropdown menu
  'suggestions': {
    list: {
      backgroundColor: 'white',
      border: '1px solid #ffffff',
      fontSize: 16,
    },

    // Style for each item in the suggestions list
    item: {
      'padding': '5px 5px',
      'borderBottom': '1px solid #333',
      '&focused': {
        backgroundColor: '#F6A9C6', // Highlight focused suggestion
        borderBottom: 'none !important',
      },
    },
  },
};
