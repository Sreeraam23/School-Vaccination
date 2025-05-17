import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './Login';
import Dashboard from './Dashboard';
import ManageStudents from './ManageStudents';
import ManageVaccination from './ManageVaccination';
import Report from './Report';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path= "/managestudents" element = {<ManageStudents />} />
        <Route path="/students" element={<ManageStudents />} />
        <Route path="/vaccinations" element={<ManageVaccination />} />
        <Route path="/Report" element={<Report/>} />
      </Routes>
    </Router>
  );
}

export default App;
