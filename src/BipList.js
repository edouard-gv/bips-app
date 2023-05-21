import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BipList({location}, {apiUrl}) {
    const [bips, setBips] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let getParams = { location: location.name };
            if (location.latitude && location.longitude ) {
                getParams.latitude = location.latitude;
                getParams.longitude = location.longitude;
            }
            const response = await axios.get(apiUrl, { params: getParams });
            setBips(response.data);
        }
        if (location) {
            fetchData();
        }
    }, [location, apiUrl]);

    //récupération de l'heure dans un timestamp
    function padZero(number) {
        return number < 10 ? '0' + number : number;
    }
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    }

    return (
        <div hidden={bips.length===0}>
            <h2>Sur le réseau</h2>
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
