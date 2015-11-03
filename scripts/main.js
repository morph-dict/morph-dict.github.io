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

var react = require('react'),
    $ = require('jquery');

var dataAccess = require('./data-access');
$(function () {
    alert('yeah!');
    $("#search").submit(function (e) {
        e.preventDefault();
        var toSearch = $("#word").val();
        $("#result").text("searching...");
        dataAccess.search(toSearch).then(function (result) {
            $("#result").text(JSON.stringify(result));
        }).catch(function (e) {
            throw e;
        });
    });
});

