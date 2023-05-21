import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import './App.css';
import BipList from "./BipList";


const API_URL = '/bips'; // l'API est sur le même domaine que le front

function App() {
    const [pseudo, setPseudo] = useState("");
    const [selectedLocation, setLocation] = useState("");
    const [selectedStatusCode, setStatusCode] = useState("");
    const [navLatitude, setNavLatitude] = useState("");
    const [navLongitude, setNavLongitude] = useState("");
    const [city, setCity] = useState("");

    const locations = [{name: "au siège", latitude: 48.865140, longitude: 2.342850}, {name: "au bouloi", latitude: 48.863860, longitude: 2.341220} , {name: "geoloc", latitude: navLatitude, longitude: navLongitude}];
    const statusCodes = [
        {code: 100, status: "je veux un café"},
        {code: 200, status: "j'ai du boulot et ça me plaît"},
        {code: 300, status: "en destaff, on paire ?"},
        {code: 400, status: "je donne une formation"},
        {code: 500, status: "j'ai faim"},
        {code: 600, status: "j'en peux plus"},
        {code: 700, status: "besoin de calme"},
        {code: 800, status: "vite, mon daily"},
        {code: 900, status: "suis à la bourre"},
    ];

    //arrondi des coordonnées GPS au 6ème chiffre après la virgule
    const roundCoord = (coord) => {
        return Number(Math.round(coord + 'e6') + 'e-6');
    }

    useEffect(() => {
        const savedPseudo = Cookies.get('pseudo');
        if (savedPseudo) {
            setPseudo(savedPseudo);
        }

        //get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                if (roundCoord(navLatitude) !== roundCoord(latitude) || roundCoord(navLongitude) !== roundCoord(longitude)) {
                    console.log("old location", roundCoord(navLatitude), roundCoord(navLongitude));
                    console.log("new location", roundCoord(latitude), roundCoord(longitude));
                    setNavLatitude(latitude);
                    setNavLongitude(longitude);
                    if (selectedLocation.name === "geoloc")
                        setLocation({});
                }
                axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`).then((response) => {
                    setCity(response.data.address.city ? response.data.address.city : response.data.address.village);
                });
            });
        }
        else {
            alert("Geolocation is not supported by this browser.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatLocationName = (location) => {
        if (location === "geoloc") {
            return `(${formatDMS(navLatitude)}, ${formatDMS(navLongitude)}) ${city}`;
        }
        return location;
    }

    //formatage de décimaux en degrés, minutes, secondes
    const formatDMS = (coord) => {
        const absolute = Math.abs(coord);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

        return `${degrees}° ${minutes}' ${seconds}"`;
    }


    const submitBip = async () => {
        Cookies.set('pseudo', pseudo);
        let getParams = { location: selectedLocation.name };
        if (selectedLocation.longitude && selectedLocation.latitude) {
            getParams.longitude = selectedLocation.longitude;
            getParams.latitude = selectedLocation.latitude;
        }
        let postParams = { ...getParams};
        postParams.pseudo = pseudo;
        postParams.status_code = selectedStatusCode;
        await axios.post(API_URL, postParams);
    };

    return (
        <div className="app">
            <div className="input-field">
                <label>Pseudo:</label>
                <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
            </div>
            <h2>Réseau</h2>
            <div className="button-group">
                {locations.map((location) => (
                    <button className={`button-location ${location.name === selectedLocation.name ? 'selected' : ''}`} key={location.name} onClick={() => setLocation(location)}>
                        {formatLocationName(location.name)}
                    </button>
                ))}
            </div>
            <h2>Status Code</h2>
            <div className="button-group">
                {statusCodes.map((statusCode) => (
                    <button
                        className={`button-status-code ${statusCode.code === selectedStatusCode ? 'selected' : ''}`}
                        key={statusCode.code}
                        onClick={() => setStatusCode(statusCode.code)}
                    >
                        <div className="left">{statusCode.code}</div>
                        <div className="right">{statusCode.status}</div>
                    </button>
                ))}

            </div>
            <button className="button-submit"  disabled={!pseudo || !selectedLocation || !selectedStatusCode} onClick={submitBip}>
                Bip !
            </button>
            <BipList location={selectedLocation} api_url={API_URL} />
        </div>
    );
}

export default App;
