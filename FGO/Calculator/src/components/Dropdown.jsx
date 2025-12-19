import { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaChevronUp, FaSearch, FaCheck } from 'react-icons/fa';

const Dropdown = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option...',
  searchable = false,
  label = '',
  error = '',
  disabled = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.value && option.value.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find selected option label
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && searchable) {
        setSearchTerm('');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
      handleSelect(filteredOptions[0]);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef} {...props}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}

      {/* Dropdown Trigger */}
      <div
        className={`relative cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {/* Input Field */}
        <div
          onClick={handleInputClick}
          className={`
            w-full px-3 py-2 rounded-lg border transition-all duration-200
            ${disabled ? 'bg-gray-800/50' : 'bg-gray-900/50 hover:bg-gray-800/50'}
            ${error ? 'border-fgo-red' : 'border-gray-700 hover:border-gray-600'}
            ${isOpen ? 'border-fgo-gold ring-1 ring-fgo-gold' : ''}
            flex items-center justify-between
          `}
        >
          <div className="flex-1 truncate">
            {isOpen && searchable ? (
              <div className="flex items-center">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : (
              <span className={displayValue ? 'text-white' : 'text-gray-400'}>
                {displayValue || placeholder}
              </span>
            )}
          </div>
          
          {/* Chevron Icon */}
          <span className="ml-2 text-gray-400">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl shadow-black/50 max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-gray-400">
                No options found
              </div>
            ) : (
              <ul className="py-1">
                {filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-3 py-2 cursor-pointer transition-colors flex items-center justify-between
                      ${option.value === value 
                        ? 'bg-fgo-blue/30 text-fgo-gold' 
                        : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                      }
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      {option.icon && <span className="text-lg">{option.icon}</span>}
                      <span>{option.label}</span>
                      {option.badge && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    
                    {option.value === value && (
                      <FaCheck className="text-fgo-gold" />
                    )}
                    
                    {option.description && (
                      <div className="text-xs text-gray-400 mt-1">
                        {option.description}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-fgo-red">{error}</p>
      )}

      {/* Selected Value Display (Optional) */}
      {value && !isOpen && (
        <div className="mt-1 text-xs text-gray-400 truncate">
          Selected: {displayValue}
        </div>
      )}
    </div>
  );
};

// Example usage variants
export const DropdownWithGroups = ({ groups = [], ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const handleSelect = (value) => {
    if (props.onChange) {
      props.onChange(value);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Dropdown
        {...props}
        options={groups.flatMap(group => group.options)}
        searchable={true}
      />
    </div>
  );
};

export const MultiSelectDropdown = ({ 
  selectedValues = [], 
  onSelectionChange, 
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (value) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const selectedLabels = props.options
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label)
    .join(', ');

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors"
      >
        <div className="flex justify-between items-center">
          <span className={selectedLabels ? 'text-white' : 'text-gray-400'}>
            {selectedLabels || 'Select multiple options...'}
          </span>
          <FaChevronDown className="text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {props.searchable && (
            <div className="p-2 border-b border-gray-700">
              <div className="flex items-center px-2 py-1 bg-gray-900 rounded">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent outline-none text-white"
                  autoFocus
                />
              </div>
            </div>
          )}

          <ul className="py-1">
            {props.options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleToggle(option.value)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-700 flex items-center justify-between"
              >
                <span className="text-gray-300">{option.label}</span>
                {selectedValues.includes(option.value) && (
                  <FaCheck className="text-fgo-gold" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;