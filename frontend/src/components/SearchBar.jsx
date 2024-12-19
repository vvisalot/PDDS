import { Input } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange }) => {
    return (
        <div style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000,
        }}>
            <Input
                placeholder="Buscar por código de camión, ID de almacén o ciudad"
                value={searchTerm}
                onChange={onSearchChange}
                style={{
                    width: '360px',
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "5px",
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                }}
            />
        </div>
    );
};

SearchBar.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
};

export default SearchBar;