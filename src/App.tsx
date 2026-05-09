/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameLayout } from './components/GameLayout';
import LandingPage from './app/LandingPage';
import AboutPage from './app/AboutPage';
import SetupPage from './app/SetupPage';
import LobbyPage from './app/LobbyPage';
import GamePage from './app/GamePage';
import EndPage from './app/EndPage';

export default function App() {
  return (
    <BrowserRouter>
      <GameLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/end" element={<EndPage />} />
        </Routes>
      </GameLayout>
    </BrowserRouter>
  );
}

