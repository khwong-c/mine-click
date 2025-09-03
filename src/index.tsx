import './index.css';
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {App} from "./App";
import ClickRecProviders from "./providers/ClickRecProviders.tsx";
import GameStateProvider from "./providers/GameStateProvider.tsx";
import SoundProvider from "./providers/SoundProvider.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ClickRecProviders>
            <GameStateProvider>
                <SoundProvider>
                    <App/>
                </SoundProvider>
            </GameStateProvider>
        </ClickRecProviders>
    </StrictMode>
);