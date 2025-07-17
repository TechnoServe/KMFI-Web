import React from 'react';
import {Flex, Input, InputGroup, InputLeftElement} from '@chakra-ui/react';
import propTypes from 'prop-types';
import {BiSearch} from 'react-icons/bi';
/**
 * InputField is a custom input component with a search icon.
 * Used for search inputs or other text inputs with optional search triggering on key up.
 *
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Placeholder text for the input
 * @param {string} [props.type] - Input type (e.g. "text", "search", etc.)
 * @param {string} props.name - Input field name
 * @param {function} props.onChange - Callback when input value changes
 * @param {function} [props.search] - Optional function triggered on key up (e.g. for search)
 * @param {string|number} props.value - Current value of the input
 * @param {...any} restProps - Additional props passed to Chakra UI Input
 * @returns {JSX.Element} Custom input component with optional search behavior
 */
const InputField = ({
  placeholder = '',
  type = 'text',
  name,
  onChange,
  search,
  value,
  ...restProps
}) => {
  // Container ensuring full-width layout
  return (
    <Flex w="100%">
      {/* Wraps input and left element (search icon) for styling */}
      <InputGroup>
        {/* Left-aligned non-clickable search icon */}
        <InputLeftElement pointerEvents="none" color="gray.500" >{<BiSearch />}</InputLeftElement>
        {/* Main input element with optional key-up search trigger */}
        <Input
          onChange={onChange}
          placeholder={placeholder}
          name={name}
          type={type}
          value={value}
          onKeyUp={search}
          {...restProps}
        />
      </InputGroup>
    </Flex>
  );
};

InputField.propTypes = {
  placeholder: propTypes.any,
  type: propTypes.any,
  name: propTypes.any,
  onChange: propTypes.any,
  search: propTypes.any,
  value: propTypes.any,
  variant: propTypes.any,
};


export default InputField;
