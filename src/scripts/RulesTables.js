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

                function buildTree(cats, before) {
                    if (cats.length > 0) {
                        const nextCat = cats[0];
                        const found = _.chain(attrListList)
                            .filter((attrList) => attrList.filter((attr) => rgramtab.attrCat(attr) === nextCat).length > 0) // all lists, which contains attrs from current category
                            .filter((attrList) => _.every(before, (beforeAttr) => _.contains(attrList, beforeAttr))) // all lists, which contains all previous attrs
                            .map((attrList) => attrList.filter((attr) => rgramtab.attrCat(attr) === nextCat)) // leave only attrs from category
                            .reduce((acc, x) => _.union(acc, x)) // make single array
                            .value();
                        const restCats = _.rest(cats);
                        if(restCats.length == 0) {
                            return found.map((attr) => before.concat([attr]).join(":"));
                        }
                        else {
                            var result = {};
                            for (var i = 0; i < found.length; i++) {
                                var attr = found[i];
                                result[before.concat([attr]).join(":")] = buildTree(restCats, before.concat([attr]))
                            }
                            return result;
                        }
                    }
                    else {
                        throw new Error("Shouldn't ever happens!");
                    }
                }

                function treeSize(tree) {
                    if(tree.constructor === Array) {
                        return tree.length;
                    }
                    else {
                        return _.chain(tree)
                            .values()
                            .reduce((acc, subTree) => acc + treeSize(subTree), 0)
                    }
                }

                function treeDeep(tree) {
                    if(tree.constructor === Array) {
                        return 0;
                    }
                    else {
                        var deeps = _.chain(tree)
                            .values()
                            .map((tree) => treeDeep(tree) + 1)
                            .value();
                        return Math.max(...deeps);
                    }
                }

                function renderTree(trees, result, deep) {
                    var row;
                    if(deep!=0) {
                        var keys = _.chain(trees)
                            .map((tree) => _.keys(tree).map((key) => ({key: key, size: treeSize(tree[key])})))
                            .reduce((acc, x) => acc.concat(x), [])
                            .value();
                        row = <tr key={ keys.map((key) => key.key).join(",") }>
                            {
                                    _.chain(keys)
                                    .map((x) => <th  key={x.key} colSpan={x.size}>{ _.last(x.key.split(":")) }</th>)
                                    .value()
                            }
                        </tr>;
                    }
                    else {
                        var keys = _.chain(trees)
                            .map((tree) => _.values(tree))
                            .reduce((acc,x) => acc.concat(x), [])
                            .value();
                        row = <tr key={ keys.map((key) => key.key).join(",") }>
                            {
                                    _.chain(keys)
                                    .map((key) => <th key={key}>{ _.last(key.split(":")) }</th>)
                                    .value()
                            }
                        </tr>;
                    }
                    result.push(row);
                    if(deep>0) {
                        var subtrees = _.chain(trees).map((tree) => _.values(tree)).reduce((acc,x) => acc.concat(x), []);
                        renderTree(subtrees, result, deep-1)
                    }
                }


                var a = {
                    "мр": {
                        "мр:од": {
                            "мр:од:ед":[
                                "мр:од:ед:ип",
                                "мр:од:ед:рп"
                            ],
                            "мр:од:мн":[
                                "мр:од:мн:ип",
                                "мр:од:мн:рп"
                            ]
                        },
                        "мр:но": {
                            "мр:но:ед":[
                                "мр:но:ед:ип",
                                "мр:но:ед:рп"
                            ]
                        }
                    },
                    "жр": {
                        "жр:од": {
                            "жр:од:ед":[
                                "жр:од:ед:ип",
                                "жр:од:ед:рп"
                            ]
                        },
                        "жр:но": {
                            "жр:но:ед":[
                                "жр:но:ед:ип",
                                "жр:но:ед:рп"
                            ]
                        }
                    }
                };

                const tree = buildTree(colCats, []);
                //const tree = a;

                console.log(treeDeep(tree));

                const result = [];
                renderTree([tree], result, treeDeep(tree));
                console.log(result);

                return result;
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