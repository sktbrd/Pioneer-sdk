import { Box, Flex, Text, Heading } from '@chakra-ui/react';

/**
 * Types
 */
interface IProps {
  methods: string[];
}

/**
 * Component
 */
export default function RequestMethodCard({ methods }: IProps) {
  return (
    <Flex direction="column">
      <Box>
        <Heading as="h5" size="sm">Methods</Heading>
        <Text color="gray.400" data-testid="request-methods">
          {methods.join(', ')}
        </Text>
      </Box>
    </Flex>
  );
}
