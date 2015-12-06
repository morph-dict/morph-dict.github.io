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
    RulesTables = require('./RulesTables');


module.exports = React.createClass({
    render: function () {
        if (this.props.search.state === 'waiting') {
            return <div className="search-result-list"></div>
        }
        else if (this.props.search.state === 'searching') {
            return <div className="search-result-list">
                <div className="search-result-list__message">Поиск...</div>
            </div>;
        }
        else if (this.props.search.state === 'done') {
            return (
                <div className="search-result-list">
                    <div className="search-result-list__header">● ● ●</div>
                    {
                        this.props.search.result.map((resultItem, i) => {

                            var key = resultItem.lexemeRec.basis
                            + "," + resultItem.lexemeRec.paradigmIndex
                            + "," + resultItem.lexemeRec.accentParadigmIndex
                            + "," + resultItem.lexemeRec.userSessionIndex
                            + "," + resultItem.lexemeRec.ancode
                            + "," + resultItem.lexemeRec.prefixParadigmIndex;

                            var commonAttrs = resultItem.lexemeRec.ancode ? rgramtab.ancodeAttrs(resultItem.lexemeRec.ancode) : [];
                            var commonRulesAttrs = _.intersection(...resultItem.paradigmRuleList
                                                                .map((rule) => rgramtab.ancodeAttrs(rule.ancode))
                                                                .map(rgramtab.removeSynonyms));
                            commonAttrs = commonAttrs.concat(commonRulesAttrs);
                            commonAttrs = commonAttrs.filter((attr) => attr !== "*");
                            commonAttrs.sort((attr1, attr2) => (
                                rgramtab.catOrder(rgramtab.attrCat(attr1)) - rgramtab.catOrder(rgramtab.attrCat(attr2))
                            ));

                            var firstWordFormRule = resultItem.paradigmRuleList[0];
                            var firstWordForm = ""
                                         + (resultItem.prefix || "")
                                         + (firstWordFormRule.prefix || "")
                                         + resultItem.lexemeRec.basis
                                         + (firstWordFormRule.ending || "");

                            var separator;
                            if(i < this.props.search.result.length - 1) {
                                separator = <div className="search-result-list__separator">или...</div>
                            }
                            else {
                                separator = <div></div>
                            }
                            return [
                                <div key={key} className="search-result-list__group">
                                    <div className="search-result-list__group__header">
                                        {firstWordForm} - {commonAttrs.map((attr) => rgramtab.attrDesc(attr)).join(", ")}
                                    </div>
                                    <RulesTables paradigmRuleList={resultItem.paradigmRuleList} matchedAncodeList={resultItem.matchedAncodeList}  lexemeRec={resultItem.lexemeRec} globalPrefix={resultItem.prefix}/>
                                </div>,
                                separator
                            ]
                        })
                    }
                </div>
            )
        }
        else if (this.props.search.state === 'not_found') {
            return <div className="search-result-list">
                     <div className="search-result-list__message">Ничего не найдено :(</div>
                   </div> // todo: use another text
        }
        else {
            throw new Error("Bad state: " + this.props.search.state);
        }


    }
});