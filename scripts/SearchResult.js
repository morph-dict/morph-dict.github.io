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
            return <div>
                        <div><b>Результаты поиска</b></div>
                        <div>{JSON.stringify(this.props.search.result)}</div>
                   </div>
        }
        else {
            throw new Error("Bad state: " + this.props.search.state);
        }


    }
});