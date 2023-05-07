import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://0kmkubuug3.execute-api.eu-west-3.amazonaws.com/Prod/bips';

function App() {
  const [pseudo, setPseudo] = useState('');
  const [location, setLocation] = useState('');
  const [statusCode, setStatusCode] = useState('');
  const [bips, setBips] = useState([]);

  const handleSubmit = async () => {
    const data = {
      pseudo,
      location,
      status_code: statusCode,
    };
    await axios.post(API_URL, data);
    const response = await axios.get(API_URL, { params: { location } });
    setBips(response.data);
  };

  return (
    <div>
      <h1>Bips App</h1>
      <input
        type="text"
        placeholder="Pseudo"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
      />
      <select value={location} onChange={(e) => setLocation(e.target.value)}>
        <option value="">Select Location</option>
        <option value="chez mon client">Chez mon client</option>
        <option value="au siège">Au siège</option>
      </select>
      <select value={statusCode} onChange={(e) => setStatusCode(e.target.value)}>
        <option value="">Select Status Code</option>
        <option value="je veux un café">Je veux un café</option>
        <option value="chouette j'ai du boulot">Chouette j'ai du boulot</option>
      </select>
      <button onClick={handleSubmit}>Submit</button>
      <h2>Bips</h2>
      <ul>
        {bips.map((bip, index) => (
          <li key={index}>
            {bip.pseudo} - {bip.status_code} - {bip.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
