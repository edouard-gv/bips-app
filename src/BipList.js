import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BipList.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';

L.Icon.Default.imagePath = '/';

function BipList({location, bipsCount, api_url}) {
    const [bips, setBips] = useState([]);
    const [map, setMap] = useState(null);

    useEffect(() => {
        async function fetchData() {
            let getParams = { location: location.name };
            if (location.latitude || location.longitude ) {
                getParams.latitude = location.latitude;
                getParams.longitude = location.longitude;
                if (map) {
                    map.target.panTo([location.latitude, location.longitude]);
                }
            }
            const response = await axios.get(api_url, { params: getParams });
            setBips(response.data);
        }
        if (location) {
            fetchData();
        }
    }, [map, location, bipsCount, api_url]);

    //récupération de l'heure dans un timestamp
    function padZero(number) {
        return number < 10 ? '0' + number : number;
    }
    const formatTime = (timestamp) => {
        const date = new Date(`${timestamp}Z`);
        return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    }

    return (
        <div style={{marginTop: '10px'}}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                { location.latitude || location.longitude ? (
                    <MapContainer
                        center={[location.latitude, location.longitude]}
                        zoom={16}
                        style={{ height: "256px", width: "256px"}}
                        whenReady={(map) => setMap(map)}
                    >
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    {bips.map((bip, index) => {
                        return (bip.latitude || bip.longitude) && (
                            <Marker key={index} position={[bip.latitude, bip.longitude]}>
                                <Popup className="bips">
                                    <div className="left">{bip.status_code}</div>
                                    <div className="right">{bip.pseudo}</div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>): null}
            </div>
            <ul className="button-group">
                {bips.map((bip, index) => {
                    return (
                        <li key={index} className="bips">
                            <div className="left">{bip.status_code}</div>
                            <div className="right">{bip.pseudo} {formatTime(bip.timestamp)}</div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default BipList;
