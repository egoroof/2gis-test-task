import React from 'react';

function request(query) {
    const url = 'https://catalog.api.2gis.ru/2.0/catalog/marker/search?page_size=15000&region_id=32&key=ruhebf8058&q=';

    return fetch(url + encodeURIComponent(query)).then(response => {
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
    static propTypes = {
        onNewQuery: React.PropTypes.func.isRequired,
        maxHistoryCount: React.PropTypes.number.isRequired
    };

    state = {
        disabled: false,
        query: '',
        queries: []
    };

    handleQueryChange = e => {
        this.setState({
            query: e.target.value
        });
    };

    handleSubmit = e => {
        if (e) {
            e.preventDefault();
        }
        const query = this.state.query;
        if (!query) {
            return;
        }
        this.setState({
            disabled: true
        });
        this.props.onNewQuery([]);
        request(query).then(markers => {
            this.props.onNewQuery(markers);
            this.setState((prevState) => {
                if (prevState.queries.length >= this.props.maxHistoryCount) {
                    prevState.queries.shift();
                }
                prevState.queries.push({
                    text: query,
                    resultCount: markers.length
                });
                return {
                    disabled: false,
                    query: '',
                    queries: prevState.queries
                };
            });
        });
    };

    handleClick = e => {
        e.preventDefault();
        if (this.state.disabled) {
            return;
        }
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        const query = this.state.queries[id].text;
        this.setState({
            query: query
        }, () => {
            this.handleSubmit();
        });
    };

    render() {
        let listClasses = 'list-group-item list-group-item-action justify-content-between';
        if (this.state.disabled) {
            listClasses += ' disabled';
        }
        return <div className="search-panel">
            <form
                onSubmit={this.handleSubmit}
                className="form-inline justify-content-between mb-2"
            >
                <input type="text"
                       className="form-control w-75"
                       placeholder="Введите поисковой запрос"
                       disabled={this.state.disabled}
                       value={this.state.query}
                       onChange={this.handleQueryChange}
                />
                <button type="button"
                        onClick={this.handleSubmit}
                        disabled={this.state.disabled}
                        className="btn btn-primary btn-sm"
                >
                    <i className="icon"/>
                </button>
            </form>
            <div className="list-group text-truncate">
                {this.state.queries.map((query, i) => (
                    <a key={i}
                       href={`#${query.text}`}
                       onClick={this.handleClick}
                       data-id={i}
                       className={(i === this.state.queries.length - 1 ? 'active ' : '') + listClasses}
                    >
                        {query.text}
                        <span className="badge badge-default">{query.resultCount}</span>
                    </a>
                ))}
            </div>
        </div>;
    }
}
