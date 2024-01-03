// fonts
import '@fontsource/plus-jakarta-sans/latin.css';

import { ColorModeScript } from '@chakra-ui/react';
import * as React from 'react';
import ReactDOM from 'react-dom/client';

//*****************************
//Comment for publishing Lib
//*****************************
import App from './App';
import Balances from './lib/components/Balances';
import MiddleEllipsis from './lib/components/MiddleEllipsis';
import Pioneer from './lib/components/Pioneer';
import { PioneerProvider, usePioneer } from './lib/context';
import { theme } from './lib/styles/theme';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config?.initialColorMode} />
    <App />
  </React.StrictMode>,
);
//*****************************

export {
  // AssetSelect,
  Balances,
  // BlockchainSelect,
  MiddleEllipsis,
  Pioneer,
  PioneerProvider,
  usePioneer,
};
