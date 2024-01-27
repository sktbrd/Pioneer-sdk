'use client';
import { Box } from '@chakra-ui/react';
// @ts-ignore
import { useEffect, useState } from 'react';

import CalculatingComponent from '../../../components/CalculatingComponent';

const BeginSwap = ({ quote }: any) => {
  const [showGif, setShowGif] = useState(true);

  // wait for routes
  useEffect(() => {
    if (quote) {
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
        <Box>{JSON.stringify(quote)}</Box>
      )}
    </Box>
  );
};

export default BeginSwap;
