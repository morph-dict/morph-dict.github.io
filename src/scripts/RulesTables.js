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

_.mixin({
    groupMulty: function(array, f) {
        const result = {};
        for (var i = 0; i < array.length; i++) {
            var next = array[i];
            const groups = f(next);
            if(groups.constructor === Array) {
                for (var j = 0; j < groups.length; j++) {
                    var group = groups[j];
                    if(!result[group]) {
                        result[group] = [];
                    }
                    result[group].push(next);
                }
            }
            else {
                if(!result[groups]) {
                    result[groups] = [];
                }
                result[groups].push(next);
            }
        }
        return result;
    }
});

const RulesTables = React.createClass({
    render: function () {

        var words = this.props.paradigmRules.map((rule) => ({
            form: ""
                     + (this.props.globalPrefix || "")
                     + (rule.prefix || "")
                     + this.props.lexemeRec.basis
                     + (rule.ending || ""),
            attrs: rgramtab.ancodeAttrs(rule.ancode)
        }));

        function attrByCat(word, cat) {
            const found = _.chain(word.attrs).filter((attr) => rgramtab.attrCat(attr) === cat).value();
            if (found.length == 0) {
                throw new Error("Bad result: " + found)
            }
            return found;
        }


        var allAttrs = _.chain(words)
            .map((form) => form.attrs)
            .reduce((acc, x) => _.union(acc, x), [])
            .value();

        //
        //var grouped = _.groupBy(allUncommon, (attr) => rgramtab.attrCat(attr));

        const partOfSpeach = allAttrs.filter((attr) => rgramtab.attrCat(attr) === rgramtab.CATS.PART_OF_SPEACH);

        const body = partOfSpeach.map((pos) => {
            const posWords = words.filter((form) => attrByCat(form, rgramtab.CATS.PART_OF_SPEACH)[0] === pos); //todo: bad
            const renderScheme = rgramtab.posScheme(pos);

            var tablesCat = renderScheme.tables[0]; // todo: support multiple tables
            var colsCat1 = renderScheme.cols[0];
            var colsCat2 = renderScheme.cols[1];

            var groupByCat = _.chain(posWords)
                .filter((word) => word.attrs.filter((attr) => rgramtab.attrCat(attr) === tablesCat).length > 0)
                .groupMulty((word) => attrByCat(word, tablesCat))
                .value();

            const grouped = _.chain(groupByCat).mapObject((words) => (
                _.chain(words)
                    .filter((word) => word.attrs.filter((attr) => rgramtab.attrCat(attr) === colsCat1).length > 0)
                    .groupMulty((word) => attrByCat(word, colsCat1))
                    .mapObject((words) => (
                        _.chain(words)
                            .filter((word) => word.attrs.filter((attr) => rgramtab.attrCat(attr) === colsCat2).length > 0)
                            .groupMulty((word) => attrByCat(word, colsCat2))
                            .value()
                    ))
                    .value()
            )).value();

            //console.log(grouped);


            function renderHeader(colCats) {
                var attrListList = _.chain(posWords)
                    .map((word) => word.attrs)
                    .value();

                function aux(cats, before) {
                    console.log("aux: " + JSON.stringify(cats));
                    if (cats.length > 0) {
                        const nextCat = cats[0];
                        const found = _.chain(attrListList)
                            .filter((attrList) => attrList.filter((attr) => rgramtab.attrCat(attr) === nextCat).length > 0)
                            .filter((attrList) => _.every(before, (beforeAttr) => _.contains(attrList, beforeAttr))) // all lists, which contains all previous attrs
                            .map((attrList) => attrList.filter((attr) => rgramtab.attrCat(attr) === nextCat))
                            .reduce((acc, x) => _.union(acc, x))
                            .value();
                        const restCats = _.rest(cats);
                        console.log("restCats: " + JSON.stringify(restCats));
                        if(restCats.length == 0) {
                            return found;
                        }
                        else {
                            var result = {};
                            for (var i = 0; i < found.length; i++) {
                                var attr = found[i];
                                result[attr] = aux(restCats, before.concat([attr]))
                            }
                            return result;
                        }
                    }
                    else {
                        throw new Error("Shouldn't ever happens!");
                    }
                }

                console.log(aux(colCats, []));


            
                var tmp = [];
                var lastFilter = null;
                for (var i = 0; i < colCats.length; i++) {
                    var colCat = colCats[i];
                    const filteredListList = attrListList.filter((attrList) => attrList.filter((attr) => rgramtab.attrCat(attr) === colCat).length > 0); // only lists of current cat
                    const catAttrs = _.chain(filteredListList)
                        .map((attrList) => attrList.filter((attr) => rgramtab.attrCat(attr) === colCat))
                        .reduce((acc, x) => _.union(acc, x))
                        .value();
                    tmp.push(catAttrs);

                }

                //console.log(tmp);





                colCats = colCats.map((cat) => _.chain(posWords)
                                                    .map((word) => word.attrs)
                                                    .reduce((acc, x) => _.union(acc,x), [])
                                                    .filter((attr) => rgramtab.attrCat(attr) == cat)
                                                    .value());
                                                    
                                                    
                                                    

                var result = [];
                var last = null;

                for (var i = 0; i < colCats.length; i++) {
                    var colCat = colCats[i];
                    var row = [];
                    const repeat = last ? last.length : 1;
                    for(var k = 0; k < repeat; k++) {
                        for (var j = 0; j < colCat.length; j++) {
                            var attr = colCat[j];
                            row.push(attr);
                        }
                    }
                    last = row;
                    result.push(row);
                }
                     

                return result.map((row, i) => (
                    <tr key={i}>
                    {
                        row.map((col, j) => <th key={i + "," + j}>{ col }</th>)
                    }
                    </tr>
                ));
            }

            return <div key={pos}>
                <h1>{rgramtab.attrDesc(pos)}</h1>
                {
                    renderScheme.tables.map((tableCat) => (
                        _.chain(posWords)
                            .map((word) => word.attrs)
                            .reduce((acc, x) => _.union(acc,x), [])
                            .filter((attr) => rgramtab.attrCat(attr) == tableCat)
                            .map((attr) => (
                                <div>
                                    <h2>{ attr }</h2>
                                    <table>
                                        <thead>
                                            {
                                                renderHeader(renderScheme.cols)
                                            }
                                        </thead>
                                    </table>
                                </div>
                            ))
                            .value()
                    ))
                }
            </div>

        });

        //console.log(partOfSpeach);


        var commonAttrs = _.chain(words)
            .map((form) => form.attrs)
            .reduce((acc, x) => _.intersection(acc, x))
            .value();

        return <div>
            <hr></hr>
            <hr></hr>
            {body}
            <hr></hr>
        </div>;

        //return <div>
        //    <h5> Rules </h5>
        //    {
        //        body
        //    }
        //    <table>
        //        <thead>
        //        <tr>
        //            <th>form</th>
        //            <th>ancode</th>
        //            <th>attrs</th>
        //        </tr>
        //        </thead>
        //        <tbody>
        //        {
        //            this.props.paradigmRules.map((rule) => {
        //                var uncommonAttrs = _.difference(rgramtab.ancodeAttrs(rule.ancode), commonAttrs);
        //
        //                return <tr key={rule.prefix + "," + rule.ancode + "," + rule.ending}>
        //                    <td>
        //                        <span style={{color:"red"}}>{this.props.globalPrefix}</span>
        //                        <span style={{color:"green"}}>{rule.prefix}</span>
        //                        {this.props.lexemeRec.basis}
        //                        <span style={{color:"blue"}}>{rule.ending}</span>
        //                    </td>
        //                    <td>{rule.ancode}</td>
        //                    <td>
        //                        {
        //
        //                            uncommonAttrs.map((attr) => rgramtab.attrDesc(attr)).join(", ")
        //                        }
        //                    </td>
        //                </tr>
        //            })
        //        }
        //        </tbody>
        //    </table>
        //</div>
    }
});
module.exports = RulesTables;