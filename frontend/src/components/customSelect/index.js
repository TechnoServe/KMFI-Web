import React from 'react';
import {Select} from '@chakra-ui/react';
import propTypes from 'prop-types';

/**
 * CustomSelect renders a Chakra UI Select dropdown with dynamic options.
 *
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Placeholder text for the dropdown
 * @param {function} props.onChange - Callback function when an option is selected
 * @param {Array<string>} props.filter - Array of option values to render in the dropdown
 * @param {...any} restProps - Additional props passed to the Chakra UI Select component
 * @returns {JSX.Element} A customized select dropdown component
 */
const CustomSelect = ({
  placeholder = '',
  onChange,
  filter,
  ...restProps
}) => {
  // Render a Chakra UI Select component with passed props and mapped options
  return (
    <Select placeholder={placeholder} size='md' {...restProps} onChange={onChange} margin={['0', '0.5rem']}>
      {
        // Render each string in the filter array as a dropdown option
        filter.map((item, index)=>(
          <option value={item} key={index}>{item}</option>
        ))
      }
    </Select>
  );
};

CustomSelect.propTypes = {
  placeholder: propTypes.any,
  onChange: propTypes.any,
  filter: propTypes.any,
  variant: propTypes.any,
};


export default CustomSelect;
