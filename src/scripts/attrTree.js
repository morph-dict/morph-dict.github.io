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
 * Created: 09.11.2015 05:06
 */

var _ = require("underscore");

var rgramtab = require("./rgramtab");

module.exports.build = function (words, cats) {
    var attrListList = words.map((word) => word.attrs);

    function aux(cats, before) {
        if (cats.length > 0) {
            const nextCat = cats[0];
            const found = _.chain(attrListList)
                .filter((attrList) => attrList.filter((attr) => rgramtab.attrCat(attr) === nextCat).length > 0) // all lists, which contains attrs from current category
                .filter((attrList) => _.every(before, (beforeAttr) => _.contains(attrList, beforeAttr))) // all lists, which contains all previous attrs
                .map((attrList) => attrList.filter((attr) => rgramtab.attrCat(attr) === nextCat)) // leave only attrs from category
                .reduce((acc, x) => _.union(acc, x)) // make single array
                .value();
            const restCats = _.rest(cats);
            if (restCats.length == 0) {
                return found.map((attr) => before.concat([attr]).join(":"));
            }
            else {
                var result = {};
                for (var i = 0; i < found.length; i++) {
                    var attr = found[i];
                    result[before.concat([attr]).join(":")] = aux(restCats, before.concat([attr]))
                }
                return result;
            }
        }
        else {
            throw new Error("Shouldn't ever happens!");
        }
    }

    return aux(cats, []);
};

module.exports.size = function(tree) {
    if(tree.constructor === Array) {
        return tree.length;
    }
    else {
        return _.chain(tree)
            .values()
            .reduce((acc, subTree) => acc + module.exports.size(subTree), 0)
    }
};

module.exports.deep = function(tree) {
    if(tree.constructor === Array) {
        return 0;
    }
    else {
        var deeps = _.chain(tree)
            .values()
            .map((tree) => module.exports.deep(tree) + 1)
            .value();
        return Math.max(...deeps);
    }
};