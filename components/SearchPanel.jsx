import React from 'react';

const MAX_HISTORY_COUNT = 6;

function request(query) {
    const url = 'https://catalog.api.2gis.ru/2.0/catalog/marker/search?page_size=15000&region_id=32&key=ruhebf8058&q=';

    return fetch(url + query).then(response => {
        if (!response.ok) {
            throw new Error(`${response.status} (${response.statusText})`);
        }
        return response.json();
    }).then(json => {
        if (json.meta.error) {
            throw new Error(json.meta.error.message);
        }
        return json.result.items;
    }).catch(e => {
        console.error(e);
        return [];
    });
}

export default class SearchPanel extends React.Component {
    static get propTypes() {
        return {
            onNewQuery: React.PropTypes.func.isRequired
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            queries: []
        };
        this.handleClick = this.handleClick.bind(this);
    }

    disableForm() {
        this.queryInput.disabled = 'disabled';
        this.queryBtn.disabled = 'disabled';
    }

    enableForm() {
        this.queryInput.removeAttribute('disabled');
        this.queryBtn.removeAttribute('disabled');
    }

    handleClick(e) {
        e.preventDefault();
        this.disableForm();
        let query = this.queryInput.value;
        this.queryInput.value = '';
        if (e.target.nodeName === 'A') {
            const id = parseInt(e.target.getAttribute('data-id'), 10);
            query = this.state.queries[id].text;
        }
        if (!query) {
            this.enableForm();
            return;
        }
        this.props.onNewQuery([]);
        request(query).then(markers => {
            this.props.onNewQuery(markers);
            this.setState((prevState) => {
                if (prevState.queries.length > MAX_HISTORY_COUNT - 1) {
                    prevState.queries.shift();
                }
                prevState.queries.push({
                    text: query,
                    resultCount: markers.length
                });
                return {
                    queries: prevState.queries
                };
            });
            this.enableForm();
        });
    }

    render() {
        const listClasses = 'list-group-item list-group-item-action justify-content-between';
        return <div className="search-panel">
            <form
                onSubmit={this.handleClick}
                className="form-inline justify-content-between mb-2"
            >
                <input type="text"
                       className="form-control w-75"
                       placeholder="Введите поисковой запрос"
                       ref={(a) => this.queryInput = a}
                />
                <button type="button"
                        onClick={this.handleClick}
                        ref={(a) => this.queryBtn = a}
                        className="btn btn-primary btn-sm">
                    <i className="icon"/>
                </button>
            </form>
            <div className="list-group text-truncate">
                {this.state.queries.map((query, i) => (
                    <a key={i}
                       href={`#${query.text}`}
                       onClick={this.handleClick}
                       data-id={i}
                       className={(i === this.state.queries.length - 1 ? 'active ' : '') + listClasses}>
                        {query.text}
                        <span className="badge badge-default">{query.resultCount}</span>
                    </a>
                ))}
            </div>
        </div>;
    }
}
