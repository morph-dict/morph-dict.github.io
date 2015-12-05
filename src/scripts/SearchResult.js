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
 * Created: 04.11.2015 12:58
 */

var React = require('react'),
    _ = require('underscore');

var rgramtab = require('./rgramtab'),
    RulesTables = require('./RulesTables'),
    MatchedFormList = require('./MatchedFormList');

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
                    <div className="search-results">
                        {
                            this.props.search.result.map((resultItem) => {

                                var key = resultItem.lexemeRec.basis
                                + "," + resultItem.lexemeRec.paradigmIndex
                                + "," + resultItem.lexemeRec.accentParadigmIndex
                                + "," + resultItem.lexemeRec.userSessionIndex
                                + "," + resultItem.lexemeRec.ancode
                                + "," + resultItem.lexemeRec.prefixParadigmIndex;


                                var commonAttrs = resultItem.lexemeRec.ancode ? rgramtab.ancodeAttrs(resultItem.lexemeRec.ancode) : [];
                                var commonRulesAttrs = _.intersection(...resultItem.paradigmRuleList.map((rule) => rgramtab.ancodeAttrs(rule.ancode)));

                                commonAttrs = commonAttrs.concat(commonRulesAttrs);
                                commonAttrs = commonAttrs.filter((attr) => attr !== "*");

                                var firstWordFormRule = resultItem.paradigmRuleList[0];
                                var firstWordForm = ""
                                             + (resultItem.prefix || "")
                                             + (firstWordFormRule.prefix || "")
                                             + resultItem.lexemeRec.basis
                                             + (firstWordFormRule.ending || "");

                                return (
                                    <div key={key} className="search-results__group">
                                        <h2>
                                            {firstWordForm} - {commonAttrs.map((attr) => rgramtab.attrDesc(attr)).join(", ")}
                                        </h2>
                                        <MatchedFormList matchedAncodeList={resultItem.matchedAncodeList} />
                                        <h3>Lexeme</h3>
                                            <div>basis: { resultItem.lexemeRec.basis }</div>
                                            <div>paradigmIndex: { resultItem.lexemeRec.paradigmIndex }</div>
                                            <div>accentParadigmIndex: { resultItem.lexemeRec.accentParadigmIndex }</div>
                                            <div>userSessionIndex: { resultItem.lexemeRec.userSessionIndex }</div>
                                            <div>ancode: { resultItem.lexemeRec.ancode } ({
                                                (resultItem.lexemeRec.ancode)
                                                ? commonAttrs.map((attr) => rgramtab.attrDesc(attr)).join(", ")
                                                : ""
                                            })</div>
                                            <div>prefixParadigmIndex: { resultItem.lexemeRec.prefixParadigmIndex }</div>
                                        <RulesTables paradigmRuleList={resultItem.paradigmRuleList} lexemeRec={resultItem.lexemeRec} globalPrefix={resultItem.prefix}/>
                                    </div>
                                )



                            })
                        }
                    </div>
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