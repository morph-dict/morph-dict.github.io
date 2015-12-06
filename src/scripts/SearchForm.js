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
        return <div className="search-form">
                   <form onSubmit={this.props.onStartSearch}>
                       <div>
                           <label>Слово для поиска: <input type="text" size="35" id="word" value={this.props.searchText}
                                                onChange={this.props.onChangeSearchText}/></label>
                           <span> </span>
                           <button type="submit"
                                   disabled={textIsEmpty}
                                   title={textIsEmpty ? "Сначала введите слово для поиска!" : ""}>Поиск</button>
                       </div>
                   </form>
               </div>;
    }
});