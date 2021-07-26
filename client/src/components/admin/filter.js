import React from 'react';

const Filter = ({filterMethod, placeholder = "Введите данные для поиска"}) => {
    return (
        <div className="default-group mw-315">
            <input onChange={filterMethod} type="text" className="default-group__input" placeholder={placeholder}/>
        </div>
    );
};

export default Filter;