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

module.exports = React.createClass({
    render: function () {
        if(this.props.search.state === 'waiting') {
            return <div>Вы еще ничего не искали :(</div> // todo: use another text
        }
        else if (this.props.search.state === 'searching'){
            return <div>
                        <b>Searching...</b>
                   </div>;
        }
        else if(this.props.search.state === 'done') {
            // todo: use another text

            //<div>{JSON.stringify(this.props.search.result)}</div>

            return (
                <div>
                    <div><b>Результаты поиска</b></div>
                    { this.props.search.result.map(function (item) {
                        return (
                            <div>
                                <h4>Next ancode '{item.ancode}'</h4>
                                <h5>Lexeme rec</h5>

                                <p>basis: {item.lexemeRec.basis}</p>

                                <p>paradigmNum: {item.lexemeRec.paradigmNum}</p>

                                <p>accentParadigmNum: {item.lexemeRec.accentParadigmNum}</p>

                                <p>userSessionNum: {item.lexemeRec.userSessionNum}</p>

                                <p>ancode: {item.lexemeRec.ancode}</p>

                                <p>prefixParadigmNum: {item.lexemeRec.prefixParadigmNum}</p>
                                <h5>Rules</h5>
                                <table>
                                    <tr>
                                        <th>form</th>
                                        <th>ancode</th>
                                    </tr>
                                    <tbody>
                                    {
                                        item.paradigmRules.map(function (rule) {
                                            return <tr>
                                                <td>
                                                    <span style={{color:"red"}}>{item.prefix}</span>
                                                    <span style={{color:"green"}}>{rule.prefix}</span>
                                                    {item.lexemeRec.basis}
                                                    <span style={{color:"blue"}}>{rule.ending}</span>
                                                </td>
                                                <td>{rule.ancode}</td>
                                            </tr>
                                        })
                                    }
                                    </tbody>
                                </table>

                            </div>
                        )

                    })}
                </div>
            )
        }
        else {
            throw new Error("Bad state: " + this.props.search.state);
        }


    }
});