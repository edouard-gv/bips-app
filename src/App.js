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
    const [bipsCount, setBipsCount] = useState(0);
    const locations = [{name: "au siège", latitude: 48.865140, longitude: 2.342850}, {name: "au bouloi", latitude: 48.863860, longitude: 2.341220} , {name: "geoloc", latitude: navLatitude, longitude: navLongitude}];
    const statusCodes = [
        {code: 102, status: "En formation"},
        {code: 200, status: "Motivé·e pour bosser"},
        {code: 201, status: "J'ai plein d'idées"},
        {code: 202, status: "Qui a besoin d'aide ?"},
        {code: 204, status: "Je m'ennuie"},
        {code: 206, status: "Café ?"},
        {code: 300, status: "Trop de trucs à faire"},
        {code: 302, status: "Je rentre chez moi"},
        {code: 305, status: "On mob ?"},
        {code: 401, status: "Besoin d'un truc"},
        {code: 404, status: "Faites comme si je n'étais pas là"},
        {code: 408, status: "En retard"},
        {code: 410, status: "En réunion toute la journée"},
        {code: 411, status: "J'ai faim"},
        {code: 418, status: "Je suis une théière"},
        {code: 429, status: "Besoin de calme"},
        {code: 500, status: "Au secours"},
        {code: 503, status: "J'en peux plus"},
        {code: 504, status: "Je suis très en retard"},
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
                    //récupérer la ville ou le village
                    let place =
                        response.data.address.city ? response.data.address.city :
                            response.data.address.town ? response.data.address.town :
                                response.data.address.village ? response.data.address.village :
                                    response.data.address.hamlet ? response.data.address.hamlet :
                                        response.data.address.suburb ? response.data.address.suburb :
                                            response.data.address.neighbourhood ? response.data.address.neighbourhood :
                                                "perdu ?"

                    setCity(place);
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
            return `${formatDMS(navLatitude)}, ${formatDMS(navLongitude)} ${city}`;
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

        return `${degrees}°${minutes}'${seconds}"`;
    }


    const submitBip = async () => {
        Cookies.set('pseudo', pseudo);
        let getParams = { location: selectedLocation.name };
        if (selectedLocation.longitude || selectedLocation.latitude) {
            getParams.longitude = selectedLocation.longitude;
            getParams.latitude = selectedLocation.latitude;
        }
        let postParams = { ...getParams};
        postParams.pseudo = pseudo;
        postParams.status_code = selectedStatusCode;
        await axios.post(API_URL, postParams);
        setBipsCount(bipsCount + 1);
    };

    return (
        <div className="app">
            <div className="logo header">
                <div>
                    <label>Pseudo:</label>
                    <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
                </div>
                <div>
                    {formatLocationName("geoloc")}
                </div>
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
            <BipList location={selectedLocation} bipsCount={bipsCount} api_url={API_URL} />
        </div>
    );
}

export default App;
