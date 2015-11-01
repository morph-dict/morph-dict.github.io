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
 * Created: 01.11.2015 23:04
 */

function jqPromise(def) {
    return new Promise(function(done, fail){
        def.done(done).fail(fail);
    })
}

function indexResolver(perFile) {
    return function(index) {
        return {
            base: Math.floor(index / perFile),
            offset: index % perFile
        }
    }
}

function search(toSearch) {
    var dataRoot = "data";


    return jqPromise($.ajax(dataRoot+"/index.json")).then(function(indexFile){

        var treeDir = dataRoot + "/" + indexFile.treeDir;
        var dictLexDir = dataRoot + "/" + indexFile.dictLexDir;
        var dictParadigmDir = dataRoot + "/" + indexFile.dictParadigmDir;
        var dictPrefixDir = dataRoot + "/" + indexFile.dictPrefixDir;

        return new Promise(function (resolve, fail) {
            var cache = {};
            function search(nextNodeIndex, rest) {
                var index = indexResolver(indexFile.treeItemsPerFile);

                nextNodeIndex = index(nextNodeIndex);

                var file = treeDir + "/" + nextNodeIndex.base + ".json";

                var promise;
                if(cache[file]) {
                    promise = Promise.resolve(cache[file]);
                }
                else {
                    promise = jqPromise($.ajax(file)).then(function(data){
                        cache[file] = data;
                        return data;
                    });
                }

                promise.then(function (data) {
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
                }).catch(function (xhr, e) {
                    fail(e);
                })
            }
            search(indexFile.root, toSearch);
        })

            // Make it looks better
            .then(function(data){
                return data.map(function(x){
                    return {
                        ancode: x[0],
                        lexemeRec: x[1]
                    }
                });
            })

            // Fetch lexeme rec
            .then(function(data){
                return Promise.all(data.map(function(node){
                    var index = indexResolver(indexFile.dictLexItemsPerFile);
                    var idx = index(node.lexemeRec);
                    var fileName = dictLexDir + "/"  + idx.base + ".json";
                    return jqPromise($.ajax(fileName)).then(function(lexemeRecFile){
                        var lexemeRec = lexemeRecFile[idx.offset];
                        return $.extend(node, {
                            lexemeRec: {
                                basis: lexemeRec[0],
                                paradigmNum: lexemeRec[1],
                                accentParadigmNum: lexemeRec[2],
                                userSessionNum: lexemeRec[3],
                                ancode: lexemeRec[4],
                                prefixParadigmNum: lexemeRec[5]
                            }
                        })
                    })
                }))
            })

            // Fetch paradigms
            .then(function(data){
                return Promise.all(data.map(function(node){
                    var index = indexResolver(indexFile.dictParadigmItemsPerFile);
                    var idx = index(node.lexemeRec.paradigmNum);
                    var fileName = dictParadigmDir + "/"  + idx.base + ".json";
                    return jqPromise($.ajax(fileName)).then(function(paradigmRulesFile){
                        var paradigmRules = paradigmRulesFile[idx.offset];
                        paradigmRules = paradigmRules.map(function(rule){
                            return {
                                ending: rule[0],
                                ancode: rule[1],
                                prefix: rule[2]
                            }
                        });
                        return $.extend(node, {
                            paradigmRules: paradigmRules
                        })
                    })
                }))
            })

            .then(function(data){
                return Promise.all(data.map(function(node){
                    if(node.prefixParadigmNum!==null) {
                        var index = indexResolver(indexFile.dictPrefixItemsPerFile);
                        var idx = index(node.lexemeRec.prefixParadigmNum);
                        var fileName = dictPrefixDir + "/"  + idx.base + ".json";
                        return jqPromise($.ajax(fileName)).then(function(prefixFile){
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

            .then(function(data){
                console.log(data);
                return data;
            })

    });
}

$(function () {
    $("#search").submit(function(e){
        var toSearch = $("#word").val();
        $("#result").text("searching...");
        search(toSearch).then(function(result){
            $("#result").text(JSON.stringify(result));
        }).catch(function(e){
            throw e;
        });
        e.preventDefault();
    });
})