import React from 'react';

const Search = ({ searchText, searchFavorites }) => {
    return (
        <div className="favorites__search">
            <input
                onChange={searchFavorites}
                ref={searchText}
                name="searchFavoriteCustomer"
                type="text"
                className="favorites__input" />
            <i className="favorites__icon fas fa-search" />
        </div>
    );
};

export default Search;