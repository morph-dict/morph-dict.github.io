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
 * Created: 07.11.2015 23:52
 */

var React = require('react'),
    _ = require('underscore');

var rgramtab = require('./rgramtab');

module.exports = React.createClass({
    render: function(){
        var commonAttrs = _.intersection(...this.props.matchedAncodeList.map((ancode) => rgramtab.ancodeAttrs(ancode)));

        return <div>
            <h5>Совпавшие словоформы:</h5>
            { this.props.matchedAncodeList.map((ancode) => {
                var uncommonAttrs = _.difference(rgramtab.ancodeAttrs(ancode), commonAttrs);
                return (
                    <div key={ancode}>
                        <h4>{
                            uncommonAttrs.map((attr) => rgramtab.attrDesc(attr)).join(", ")
                        }</h4>
                    </div>
                )
            }) }
        </div>
    }
});