import React from 'react';
import DG from '2gis-maps';
import {Map, Marker} from '2gis-maps-react';

let map;

function rearrange(markers, zoom, viewBounds) {
    const k = Math.pow(2, 20 - zoom) * 0.00003; // super magic number
    const rearranged = [];
    for (let i = 0; i < markers.length; i++) {
        const markerPosition = DG.latLng(markers[i].lat, markers[i].lon);
        if (!viewBounds.contains(markerPosition)) {
            continue; // point out of view
        }
        let positionIsFree = true;
        for (let j = 0; j < rearranged.length; j++) {
            if (rearranged[j].bounds.contains(markerPosition)) {
                positionIsFree = false;
                break; // point inside other point area
            }
        }
        if (!positionIsFree) {
            continue;
        }
        rearranged.push({
            id: markers[i].id,
            latlng: markerPosition,
            bounds: DG.latLngBounds([[
                markers[i].lat - k, markers[i].lon - k
            ], [
                markers[i].lat + k, markers[i].lon + k
            ]])
        });
    }
    return rearranged;
}

export default class MarkerMap extends React.Component {
    static propTypes = {
        markers: React.PropTypes.array.isRequired,
        center: React.PropTypes.array.isRequired,
        zoom: React.PropTypes.number.isRequired
    };

    state = {
        width: document.body.clientWidth,
        height: document.body.clientHeight,
        markers: [] // currently showing markers only
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            markers: rearrange(nextProps.markers, map.getZoom(), map.getBounds())
        });
    }

    componentDidMount() {
        window.onresize = () => {
            this.setState({
                width: document.body.clientWidth,
                height: document.body.clientHeight
            });
        };
        setTimeout(() => {
            map = this.map.state.dgElement;
            DG.control.zoom({position: 'topright'}).addTo(map);
        }, 0);
    }

    handleZoomStart = () => {
        this.setState({
            markers: []
        });
    };

    handleMoveEnd = e => {
        this.setState({
            markers: rearrange(this.props.markers, e.target.getZoom(), e.target.getBounds())
        });
    };

    render() {
        return <Map
            style={{width: `${this.state.width}px`, height: `${this.state.height}px`}}
            center={this.props.center}
            zoom={this.props.zoom}
            onZoomstart={this.handleZoomStart}
            onMoveend={this.handleMoveEnd}
            ref={(a) => this.map = a}
            fullscreenControl={false}
            zoomControl={false}
        >
            {this.state.markers.map((marker) => (
                <Marker key={marker.id} pos={marker.latlng}/>
            ))}
        </Map>;
    }
}
