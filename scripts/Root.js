/**
 * --------------------------------------------------------------------
 * Copyright 2015 Nikolay Mavrenkov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * --------------------------------------------------------------------
 *
 * Author:  Nikolay Mavrenkov <koluch@koluch.ru>
 * Created: 04.11.2015 21:36
 */
var React = require('react'),
    update = require('react-addons-update');

var SearchResult = require('./SearchResult'),
    dataAccess = require('./data-access');

module.exports = React.createClass({

    getInitialState: function () {
        return {
            searchText: "частнопредпринимательский",
            searchResult: {}
        }
    },

    onChangeSearchText: (e) => {
        this.setState(update(this.state, {
            searchText: {$set:e.target.value}
        }));
    },

    onStartSearch: function (e) {
        e.preventDefault();
        var toSearch = this.state.searchText;
        this.setState(update(this.state, {
            searchResult: {$set:"searching....."}
        }));

        dataAccess.search(toSearch).then(function (result) {
            console.log(this.state);
            this.setState(update(this.state, {
                searchResult: {$set:result}
            }));
        }.bind(this)).catch(function (e) {
            throw e;
        }.bind(this));
    },

    render: function() {

        //<!-- псевдоабдоминальный - word with prefix -->
        return <form id="search" onSubmit={this.onStartSearch}>
                <p>
                    <label>Word form: <input type="text" id="word" value={this.state.searchText} onChange={this.onChangeSearchText}/></label>
                    <button type="submit" >Search</button>
                </p>
                <SearchResult data={this.state.searchResult}/>
               </form>;
    }
});