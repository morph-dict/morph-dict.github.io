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
 * Created: 02.11.2015 15:47
 */

var $ = require('jquery'),  //todo: use http-js instead of jquery to make http calls
    _ = require('underscore');

function jqPromise(def) {
    return new Promise((done, fail) => {
        def.done(done).fail(fail);
    })
}

function indexResolver(perFile) {
    return (index) => {
        return {
            base: Math.floor(index / perFile),
            offset: index % perFile
        }
    }
}


module.exports.search = function (toSearch) {

    toSearch = toSearch.toLowerCase().trim();

    var dataRoot = "data";


    return jqPromise($.ajax(dataRoot + "/index.json")).then((indexFile) => {

        var treeDir = dataRoot + "/" + indexFile.treeDir;
        var dictLexDir = dataRoot + "/" + indexFile.dictLexDir;
        var dictParadigmDir = dataRoot + "/" + indexFile.dictParadigmDir;
        var dictPrefixDir = dataRoot + "/" + indexFile.dictPrefixDir;

        var promise = new Promise(function (resolve, fail) {
            var cache = {};

            function search(nextNodeIndex, rest) {
                var index = indexResolver(indexFile.treeItemsPerFile);

                nextNodeIndex = index(nextNodeIndex);

                var file = treeDir + "/" + nextNodeIndex.base + ".json";

                var promise;
                if (cache[file]) {
                    promise = Promise.resolve(cache[file]);
                }
                else {
                    promise = jqPromise($.ajax(file)).then(function (data) {
                        cache[file] = data;
                        return data;
                    });
                }

                promise.then((data) => {
                    var next = data[nextNodeIndex.offset];
                    if (rest.length == 0) {
                        if (next[1]) {
                            resolve(next[1]);
                        }
                        else {
                            fail({status: "not_found", data: toSearch});
                        }
                    }
                    else {
                        var branches = next[0];
                        var branchIndex = branches[rest.charAt(0)];
                        if (branchIndex) {
                            search(branchIndex, rest.substr(1));
                        }
                        else {
                            fail({status: "not_found", data: toSearch});
                        }
                    }
                }).catch((e) => {
                    fail(e);
                })
            }

            search(indexFile.root, toSearch);
        })

        // Make it looks better
        .then((data) =>
             data.map((x) => (
                {
                    ancode: x[0],
                    lexemeRec: x[1]
                }
             ))
        )

        // Fetch lexeme rec
        .then((data) => {
            return Promise.all(data.map((node) => {
                var index = indexResolver(indexFile.dictLexItemsPerFile);
                var idx = index(node.lexemeRec);
                var fileName = dictLexDir + "/" + idx.base + ".json";
                return jqPromise($.ajax(fileName)).then(function (lexemeRecFile) {
                    var lexemeRec = lexemeRecFile[idx.offset];
                    return $.extend(node, {
                        lexemeRec: {
                            basis: lexemeRec[0],
                            paradigmIndex: lexemeRec[1],
                            accentParadigmIndex: lexemeRec[2],
                            userSessionIndex: lexemeRec[3],
                            ancode: lexemeRec[4],
                            prefixParadigmIndex: lexemeRec[5]
                        }
                    })
                })
            }))
        })

        // Fetch prefix
        .then((data) => {
            return Promise.all(data.map((node) => {
                if (node.lexemeRec.prefixParadigmIndex !== null) {
                    var index = indexResolver(indexFile.dictPrefixItemsPerFile);
                    var idx = index(node.lexemeRec.prefixParadigmIndex);
                    var fileName = dictPrefixDir + "/" + idx.base + ".json";
                    return jqPromise($.ajax(fileName)).then(function (prefixFile) {
                        var prefix = prefixFile[idx.offset];
                        return $.extend(node, {
                            prefix: prefix
                        })
                    })
                }
                else {
                    return Promise.resolve(node);
                }
            }))
        })


        // Fetch paradigms
        .then((data) => {
            return Promise.all(data.map((node) => {
                var index = indexResolver(indexFile.dictParadigmItemsPerFile);
                var idx = index(node.lexemeRec.paradigmIndex);
                var fileName = dictParadigmDir + "/" + idx.base + ".json";
                return jqPromise($.ajax(fileName)).then((paradigmRuleListFile) => {
                    var paradigmRuleList = paradigmRuleListFile[idx.offset];
                    paradigmRuleList = paradigmRuleList.map((rule) => (
                        {
                            ending: rule[0],
                            ancode: rule[1],
                            prefix: rule[2]
                        }
                    ));
                    return $.extend(node, {
                        paradigmRuleList: paradigmRuleList
                    })
                })
            }))
        })

        // Group founded lexeme recs by lexems
        .then((data) => {
                var gropedByLexeme = _.values(_.groupBy(data, (x) => (
                    x.lexemeRec.paradigmIndex
                        + "," + x.lexemeRec.accentParadigmIndex
                        + "," + x.lexemeRec.ancode
                        + "," + x.lexemeRec.basis
                        + "," + x.lexemeRec.paradigmIndex
                        + "," + x.lexemeRec.prefixParadigmIndex
                        + "," + x.lexemeRec.userSessionIndex
                )));
                var mergedGroups = gropedByLexeme.map((group) => {
                    var first = group[0];
                    return {
                        matchedAncodeList: group.map((item) => item.ancode),
                        lexemeRec: first.lexemeRec,
                        prefix: first.prefix,
                        paradigmRuleList: first.paradigmRuleList
                    }
                });
                return Promise.resolve(mergedGroups);
        })

        .then((data) => {
            return Promise.resolve(data);
        });
            
        return promise;
    });
};

