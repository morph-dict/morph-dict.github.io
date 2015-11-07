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
 * Created: 04.11.2015 12:58
 */

var React = require('react');

var rgramtab = require('./rgramtab');

module.exports = React.createClass({
    render: function () {
        if (this.props.search.state === 'waiting') {
            return <div>Вы еще ничего не искали :(</div> // todo: use another text
        }
        else if (this.props.search.state === 'searching') {
            return <div>
                <b>Searching...</b>
            </div>;
        }
        else if (this.props.search.state === 'done') {
            // todo: use another text

            //<div>{JSON.stringify(this.props.search.result)}</div>

            return (
                <div>
                    <div><b>Результаты поиска</b></div>
                    {
                        this.props.search.result.map(function (firstItem, i) {
                            var rules = (<div><h5> Rules </h5>
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
                                        firstItem.paradigmRules.map(function (rule) {
                                            return <tr key={rule.prefix + "," + rule.ancode + "," + rule.ending}>
                                                <td>
                                                    <span style={{color:"red"}}>{firstItem.prefix}</span>
                                                    <span style={{color:"green"}}>{rule.prefix}</span>
                                                    {firstItem.lexemeRec.basis}
                                                    <span style={{color:"blue"}}>{rule.ending}</span>
                                                </td>
                                                <td>{rule.ancode}</td>
                                                <td>
                                                    {
                                                        rgramtab.ancodeAttrs(rule.ancode).map((attr) => rgramtab.attrDesc(attr)).join(", ")
                                                    }
                                                </td>
                                            </tr>
                                        })
                                    }
                                </tbody>
                                </table>
                            </div>);

                            var key = firstItem.lexemeRec.basis
                            + "," + firstItem.lexemeRec.paradigmNum
                            + "," + firstItem.lexemeRec.accentParadigmNum
                            + "," + firstItem.lexemeRec.userSessionNum
                            + "," + firstItem.lexemeRec.ancode
                            + "," + firstItem.lexemeRec.prefixParadigmNum;

                            return (
                                <div key={key}>
                                    <h1>Group</h1>
                                    <h3>Matched forms</h3>
                                    { firstItem.matchedAncodes.map(function (ancode) {
                                        return (
                                            <div key={ancode}>
                                                <h4>{
                                                     rgramtab.ancodeAttrs(ancode).map((attr) => rgramtab.attrDesc(attr)).join(", ")
                                                }</h4>
                                            </div>
                                        )
                                    }) }
                                    <h3>Lexeme</h3>
                                        <div>basis: { firstItem.lexemeRec.basis }</div>
                                        <div>paradigmNum: { firstItem.lexemeRec.paradigmNum }</div>
                                        <div>accentParadigmNum: { firstItem.lexemeRec.accentParadigmNum }</div>
                                        <div>userSessionNum: { firstItem.lexemeRec.userSessionNum }</div>
                                        <div>ancode: { firstItem.lexemeRec.ancode } ({
                                            (firstItem.lexemeRec.ancode)
                                            ? rgramtab.ancodeAttrs(firstItem.lexemeRec.ancode).map((attr) => rgramtab.attrDesc(attr)).join(", ")
                                            : ""
                                        })</div>
                                        <div>prefixParadigmNum: { firstItem.lexemeRec.prefixParadigmNum }</div>
                                    <h3>Rules</h3>
                                    { rules }
                                </div>
                            )



                        })
                    }
                </div>
            )
        }
        else if (this.props.search.state === 'not_found') {
            return <div>Ничего не найдено :(</div> // todo: use another text
        }
        else {
            throw new Error("Bad state: " + this.props.search.state);
        }


    }
});