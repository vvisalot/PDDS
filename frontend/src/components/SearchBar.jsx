import { Input } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange, onSearchFocus }) => {
    return (
      <div style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        zIndex: 1000,
      }}>
        <Input
          placeholder="Buscar por ID de camión, ID de almacén o ciudad"
          value={searchTerm}
          onChange={onSearchChange}
          onFocus={onSearchFocus}
          style={{
            width: '285px',
            fontSize: '12px',
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "5px",
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
          className="search-bar-input"
        />
        <style jsx>{`
                .search-bar-input::placeholder {
                    color: #666; // Darker placeholder color
                }
            `}</style>
      </div>
    );
};

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSearchFocus: PropTypes.func.isRequired,
};

export default SearchBar;