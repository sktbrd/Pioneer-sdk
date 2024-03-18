import { Button } from '@chakra-ui/react';
import React from 'react';

//@ts-ignore
const ErrorQuote: React.FC<any> = ({ error, onClose }: any) => {
  return (
    <div>
      {JSON.stringify(error)}
      <Button onClick={onClose} />
    </div>
  );
};

export default ErrorQuote;
