import React from 'react';
import ReactDOM from 'react-dom';
import MarkerMap from './MarkerMap.jsx';
import SearchPanel from './SearchPanel.jsx';

class App extends React.Component {
    state = {
        center: [55.74813, 37.626543],
        markers: [] // all markers by query
    };

    handleNewQuery = markers => {
        this.setState({
            markers: markers
        });
    };

    render() {
        return <div>
            <SearchPanel
                onNewQuery={this.handleNewQuery}
                maxHistoryCount={6}
            />
            <MarkerMap
                center={this.state.center}
                zoom={13}
                markers={this.state.markers}
            />
        </div>;
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
