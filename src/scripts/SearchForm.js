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

        return <form id="search" onSubmit={this.props.onStartSearch} className="search-form">
            <p>
                <label>Введите словоформу: <input type="text" id="word" value={this.props.searchText}
                                                  onChange={this.props.onChangeSearchText}/></label>
                <button type="submit">Search</button>
            </p>
        </form>;
    }
});