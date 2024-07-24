import { Box, Heading, Text } from '@chakra-ui/react';
// import { CodeBlock, codepen } from 'react-code-blocks';

/**
 * Types
 */
interface IProps {
  data: Record<string, unknown>;
}

/**
 * Component
 */
export default function RequestDataCard({ data }: IProps) {
  return (
    <Box display="flex" flexDirection="column">
      <Box>
        <Heading as="h5" size="sm">Data</Heading>
        {/*<CodeBlock*/}
        {/*  showLineNumbers={false}*/}
        {/*  text={JSON.stringify(data, null, 2)}*/}
        {/*  theme={codepen}*/}
        {/*  language="json"*/}
        {/*/>*/}
      </Box>
    </Box>
  );
}
