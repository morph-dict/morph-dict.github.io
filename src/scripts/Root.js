"use strict";
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

var SearchForm = require('./SearchForm'),
    SearchResultList = require('./SearchResultList'),
    dataAccess = require('./data-access');

module.exports = React.createClass({

    getInitialState: function () {
        return {
            search: {
                state: 'waiting',
                text: '',
                result: {}
            }
        }
    },

    onChangeSearchText: function (e) {
        this.setState(update(this.state, {
            search: {
                text: {$set: e.target.value}
            }
        }));
    },

    onStartSearch: function (e) {
        e.preventDefault();
        var toSearch = this.state.search.text.trim();
        this.setState(update(this.state, {
            search: {
                state: {$set: 'searching'},
                result: {$set: null}
            }
        }));

        dataAccess.search(toSearch).then((result) => {
            this.setState(update(this.state, {
                search: {
                    state: {$set: 'done'},
                    result: {$set: result}
                }
            }));
        }).catch((e) => {
            if (e.status === "not_found") {
                this.setState(update(this.state, {
                    search: {
                        state: {$set: 'not_found'},
                        result: {$set: null}
                    }
                }))
            }
            else {
                throw e;
            }
        });
    },

    render: function () {

        //<!-- псевдоабдоминальный - word with prefix -->
        //<!-- ленина, пошла -->
        return <div>
            <div className="header">Морфологический словарь<br/>русского языка</div>
            <SearchForm id="search"
                        searchText={this.state.search.text}
                        searchState={this.state.search.state}
                        onStartSearch={this.onStartSearch}
                        onChangeSearchText={this.onChangeSearchText} />
            <SearchResultList search={this.state.search}/>
        </div>;
    }
});