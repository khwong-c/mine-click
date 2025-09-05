import './index.css';
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {App} from "./App";
import ClickRecProviders from "./providers/ClickRecProviders.tsx";
import GameStateProvider from "./providers/GameStateProvider.tsx";
import SoundProvider from "./providers/SoundProvider.tsx";
import WSProvider from "./providers/WSProvider.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <WSProvider>
            <SoundProvider>
                <ClickRecProviders>
                    <GameStateProvider>
                        <App/>
                    </GameStateProvider>
                </ClickRecProviders>
            </SoundProvider>
        </WSProvider>
    </StrictMode>
);