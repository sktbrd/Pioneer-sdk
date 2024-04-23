'use client';
import { Box } from '@chakra-ui/react';
// @ts-ignore
import React, { useEffect, useState } from 'react';

import CalculatingComponent from '../../../components/CalculatingComponent';
import Quote from "../../../components/Quote";

const BeginSwap = ({ usePioneer, quote, onAcceptSign, memoless, setTxHash}: any) => {

  const [showGif, setShowGif] = useState(true);

  // wait for routes
  useEffect(() => {
    if (quote && quote.quote) {
      setShowGif(false);
    }
  }, [quote]);

  return (
    <Box>
      {showGif ? (
        <Box>
          <CalculatingComponent />
        </Box>
      ) : (
        <div>
          <Quote usePioneer={usePioneer} setTxHash={setTxHash} quote={quote} onAcceptSign={onAcceptSign} memoless={memoless}/>
        </div>
      )}
    </Box>
  );
};

export default BeginSwap;
