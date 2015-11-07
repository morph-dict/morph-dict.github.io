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


            console.log(JSON.stringify(this.props.search.result));

            return (
                <div>
                    <div><b>Результаты поиска</b></div>
                    {
                        this.props.search.result.map(function (group, i) {
                            var groupItemsHeader = group.map(function (item) {
                                return (
                                    <div key={item.ancode}>
                                        <h4>Desc: { rgramtab.ancodeAttrs(item.ancode).map((attr) => {
                                            return <span key={attr}> { rgramtab.attrDesc(attr) }</span>
                                        }) }</h4>
                                        <h5>Lexeme rec</h5>

                                        <div>basis: {item.lexemeRec.basis}</div>

                                        <div>paradigmNum: {item.lexemeRec.paradigmNum}</div>

                                        <div>accentParadigmNum: {item.lexemeRec.accentParadigmNum}</div>

                                        <div>userSessionNum: {item.lexemeRec.userSessionNum}</div>

                                        <div>ancode: {item.lexemeRec.ancode}</div>

                                        <div>prefixParadigmNum: {item.lexemeRec.prefixParadigmNum}</div>
                                    </div>
                                )
                            });

                            var firstItem = group[0];

                            var rules = (<div><h5> Rules </h5>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>form</th>
                                        <th>ancode</th>
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
                                            </tr>
                                        })
                                    }
                                </tbody>
                                </table>
                            </div>);

                            var key = firstItem.lexemeRec.basis
                            + "," + firstItem.lexemeRec.paradigmNum
                            + "," + firstItem.lexemeRec.accentParadigmNu
                            + "," + firstItem.lexemeRec.userSessionNum
                            + "," + firstItem.lexemeRec.ancod
                            + "," + firstItem.lexemeRec.prefixParadigmNum;

                            return (
                                <div key={key}>
                                    <h1>Group</h1>
                                    { groupItemsHeader }
                                    <h1>Rules</h1>
                                    { rules }
                                </div>
                            )



                        })
                    }
                </div>
            )
        }
        else {
            throw new Error("Bad state: " + this.props.search.state);
        }


    }
});