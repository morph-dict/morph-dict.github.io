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
        var commonAttrs = _.intersection(...this.props.paradigmRules.map((rule) => rgramtab.ancodeAttrs(rule.ancode)));

        return <div><h5> Rules </h5>
            <table>
                <thead>
                <tr>
                    <th>form</th>
                    <th>ancode</th>
                    <th>attrs</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.props.paradigmRules.map((rule) => {
                        var uncommonAttrs = _.difference(rgramtab.ancodeAttrs(rule.ancode), commonAttrs);
                        return <tr key={rule.prefix + "," + rule.ancode + "," + rule.ending}>
                            <td>
                                <span style={{color:"red"}}>{this.props.globalPrefix}</span>
                                <span style={{color:"green"}}>{rule.prefix}</span>
                                {this.props.lexemeRec.basis}
                                <span style={{color:"blue"}}>{rule.ending}</span>
                            </td>
                            <td>{rule.ancode}</td>
                            <td>
                                {

                                    uncommonAttrs.map((attr) => rgramtab.attrDesc(attr)).join(", ")
                                }
                            </td>
                        </tr>
                    })
                }
                </tbody>
            </table>
        </div>
    }
});