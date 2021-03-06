"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 05.12.2015 22:04
 */
var React = require('react'),
    update = require('react-addons-update');

module.exports = React.createClass({

    render: function () {
        var textIsEmpty = this.props.searchText.length === 0;
        var disabled = this.props.searchState === "searching";
        return <div className="search-form">
                   <form onSubmit={this.props.onStartSearch}>
                       <div>
                           <label>Слово для поиска:
                           <span> </span>
                           <input type="text" size="35" id="word"
                                    disabled={disabled}
                                    value={this.props.searchText}
                                    onChange={this.props.onChangeSearchText}/></label>
                           <span> </span>
                           <button type="submit"
                                   disabled={textIsEmpty || disabled}
                                   title={textIsEmpty ? "Сначала введите слово для поиска!" : ""}>Поиск</button>
                       </div>
                   </form>
               </div>;
    }
});