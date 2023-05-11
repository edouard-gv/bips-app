import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import './App.css';


const API_URL = '/bips'; // l'API est sur le même domaine que le front

function App() {
    const [pseudo, setPseudo] = useState("");
    const [selectedLocation, setLocation] = useState("");
    const [selectedStatusCode, setStatusCode] = useState("");
    const [bips, setBips] = useState([]);

    const locations = ["chez mon client", "au siège", "au boulois"];
    const statusCodes = ["je veux un café", "chouette j'ai du boulot", "en destaff, on paire ?", "je donne une formation", "j'ai faim", "j'en peux plus", "besoin de calme", "vite, mon daily", "suis à la bourre"];

    useEffect(() => {
        const savedPseudo = Cookies.get('pseudo');
        if (savedPseudo) {
            setPseudo(savedPseudo);
        }
    }, []);

    const submitBip = async () => {
        Cookies.set('pseudo', pseudo);
        const data = {pseudo, location: selectedLocation, status_code: selectedStatusCode};
        await axios.post(API_URL, data);
        const response = await axios.get(API_URL, { params: { location: selectedLocation } });
        setBips(response.data);
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
                    <button className={`button-location ${location === selectedLocation ? 'selected' : ''}`} key={location} onClick={() => setLocation(location)}>
                        {location}
                    </button>
                ))}
            </div>
            <h2>Status Code</h2>
            <div className="button-group">
                {statusCodes.map((statusCode) => (
                    <button className={`button-status-code ${statusCode === selectedStatusCode ? 'selected' : ''}`} key={statusCode} onClick={() => setStatusCode(statusCode)}>
                        {statusCode}
                    </button>
                ))}
            </div>
            <button className="button-submit"  disabled={!pseudo || !selectedLocation || !selectedStatusCode} onClick={submitBip}>
                Bip !
            </button>
            <div hidden={bips.length===0}>
                <h2>Sur le réseau</h2>
                <ul>
                    {bips.map((bip, index) => (
                        <li key={index}>
                            {bip.pseudo} - {bip.status_code} - {bip.timestamp}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
