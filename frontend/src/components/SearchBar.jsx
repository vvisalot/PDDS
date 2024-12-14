import { Input } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange }) => {
    return (
        <Input
            placeholder="Buscar por código de camión"
            value={searchTerm}
            onChange={onSearchChange}
            style={{ marginBottom: 20 }}
        />
    );
};

SearchBar.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
};

export default SearchBar;
