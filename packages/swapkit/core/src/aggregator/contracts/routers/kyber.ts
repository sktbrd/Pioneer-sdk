export const kyberRouter = [
  {
    inputs: [{ internalType: 'address', name: '_WETH', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes',
        name: 'clientData',
        type: 'bytes',
      },
    ],
    name: 'ClientData',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string',
      },
    ],
    name: 'Error',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'pair',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'output',
        type: 'address',
      },
    ],
    name: 'Exchange',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'recipients',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      { indexed: false, internalType: 'bool', name: 'isBps', type: 'bool' },
    ],
    name: 'Fee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'contract IERC20',
        name: 'srcToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'contract IERC20',
        name: 'dstToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'dstReceiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'spentAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'returnAmount',
        type: 'uint256',
      },
    ],
    name: 'Swapped',
    type: 'event',
  },
  {
    inputs: [],
    name: 'WETH',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'isWhitelist',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'rescueFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'callTarget', type: 'address' },
          { internalType: 'address', name: 'approveTarget', type: 'address' },
          { internalType: 'bytes', name: 'targetData', type: 'bytes' },
          {
            components: [
              {
                internalType: 'contract IERC20',
                name: 'srcToken',
                type: 'address',
              },
              {
                internalType: 'contract IERC20',
                name: 'dstToken',
                type: 'address',
              },
              {
                internalType: 'address[]',
                name: 'srcReceivers',
                type: 'address[]',
              },
              {
                internalType: 'uint256[]',
                name: 'srcAmounts',
                type: 'uint256[]',
              },
              {
                internalType: 'address[]',
                name: 'feeReceivers',
                type: 'address[]',
              },
              {
                internalType: 'uint256[]',
                name: 'feeAmounts',
                type: 'uint256[]',
              },
              { internalType: 'address', name: 'dstReceiver', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              {
                internalType: 'uint256',
                name: 'minReturnAmount',
                type: 'uint256',
              },
              { internalType: 'uint256', name: 'flags', type: 'uint256' },
              { internalType: 'bytes', name: 'permit', type: 'bytes' },
            ],
            internalType: 'struct MetaAggregationRouterV2.SwapDescriptionV2',
            name: 'desc',
            type: 'tuple',
          },
          { internalType: 'bytes', name: 'clientData', type: 'bytes' },
        ],
        internalType: 'struct MetaAggregationRouterV2.SwapExecutionParams',
        name: 'execution',
        type: 'tuple',
      },
    ],
    name: 'swap',
    outputs: [
      { internalType: 'uint256', name: 'returnAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'gasUsed', type: 'uint256' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'callTarget', type: 'address' },
          { internalType: 'address', name: 'approveTarget', type: 'address' },
          { internalType: 'bytes', name: 'targetData', type: 'bytes' },
          {
            components: [
              {
                internalType: 'contract IERC20',
                name: 'srcToken',
                type: 'address',
              },
              {
                internalType: 'contract IERC20',
                name: 'dstToken',
                type: 'address',
              },
              {
                internalType: 'address[]',
                name: 'srcReceivers',
                type: 'address[]',
              },
              {
                internalType: 'uint256[]',
                name: 'srcAmounts',
                type: 'uint256[]',
              },
              {
                internalType: 'address[]',
                name: 'feeReceivers',
                type: 'address[]',
              },
              {
                internalType: 'uint256[]',
                name: 'feeAmounts',
                type: 'uint256[]',
              },
              { internalType: 'address', name: 'dstReceiver', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              {
                internalType: 'uint256',
                name: 'minReturnAmount',
                type: 'uint256',
              },
              { internalType: 'uint256', name: 'flags', type: 'uint256' },
              { internalType: 'bytes', name: 'permit', type: 'bytes' },
            ],
            internalType: 'struct MetaAggregationRouterV2.SwapDescriptionV2',
            name: 'desc',
            type: 'tuple',
          },
          { internalType: 'bytes', name: 'clientData', type: 'bytes' },
        ],
        internalType: 'struct MetaAggregationRouterV2.SwapExecutionParams',
        name: 'execution',
        type: 'tuple',
      },
    ],
    name: 'swapGeneric',
    outputs: [
      { internalType: 'uint256', name: 'returnAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'gasUsed', type: 'uint256' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IAggregationExecutor',
        name: 'caller',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract IERC20',
            name: 'srcToken',
            type: 'address',
          },
          {
            internalType: 'contract IERC20',
            name: 'dstToken',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'srcReceivers',
            type: 'address[]',
          },
          { internalType: 'uint256[]', name: 'srcAmounts', type: 'uint256[]' },
          {
            internalType: 'address[]',
            name: 'feeReceivers',
            type: 'address[]',
          },
          { internalType: 'uint256[]', name: 'feeAmounts', type: 'uint256[]' },
          { internalType: 'address', name: 'dstReceiver', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'minReturnAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'flags', type: 'uint256' },
          { internalType: 'bytes', name: 'permit', type: 'bytes' },
        ],
        internalType: 'struct MetaAggregationRouterV2.SwapDescriptionV2',
        name: 'desc',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'executorData', type: 'bytes' },
      { internalType: 'bytes', name: 'clientData', type: 'bytes' },
    ],
    name: 'swapSimpleMode',
    outputs: [
      { internalType: 'uint256', name: 'returnAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'gasUsed', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'addr', type: 'address[]' },
      { internalType: 'bool[]', name: 'value', type: 'bool[]' },
    ],
    name: 'updateWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
];
