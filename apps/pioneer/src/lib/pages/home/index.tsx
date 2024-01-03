/*
    Pioneer Template
 */

import { Box, Button, Flex, Input, Link, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { AutocompleteInput } from '../../components/AutocompleteInput'; // Import or define this component
import Balances from '../../components/Balances';
import Portfolio from '../../components/Portfolio';
import Basic from '../../components/Basic';
import Blockchains from '../../components/Blockchains';
import Earn from '../../components/Earn';
import Loan from '../../components/Loan';
import Paths from '../../components/Paths';
// import OutputSelect from "lib/components/OutputSelect";
// import BlockchainSelect from "lib/components/BlockchainSelect";
// import WalletSelect from "lib/components/WalletSelect";
import Pending from '../../components/Pending';
import Pioneer from '../../components/Pioneer';
import Pubkeys from '../../components/Pubkeys';
import Swap from '../../components/Swap';
import Track from '../../components/Track';
import Transfer from '../../components/Transfer';
import { usePioneer } from '../../context';

import { initWallets } from './setup';

const Home = () => {
  const { txid } = useParams<{ txid?: string }>();
  const { intent } = useParams<{ intent?: string }>();
  const { state, onStart } = usePioneer();
  const { pubkeyContext, app } = state;
  const [searchInput, setSearchInput] = useState('portfolio');
  const [filteredOptions, setFilteredOptions] = useState([
    'portfolio',
    'track',
    'basic',
    'blockchains',
    'paths',
    'pubkeys',
    'balances',
    'pending',
    'transfer',
    'swap',
    'swaps',
    'earn',
    'loan'
  ]);
  const [address, setAddress] = useState('');
  const [modalType, setModalType] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate(); // Add this line to use the useHistory hook

  // start the context provider
  useEffect(() => {}, [intent]);

  // start the context provider
  useEffect(() => {
    initWallets(onStart);
  }, []);

  useEffect(() => {
    if (pubkeyContext) setAddress(pubkeyContext?.master || pubkeyContext?.pubkey || pubkeyContext);
  }, [pubkeyContext]);

  const openModal = (type: any) => {
    setModalType(type);
    onOpen();
  };

  const onSelect = async (blockchain: any) => {
    // select asset
    console.log('blockchain: ', blockchain);
    // open blockchain modal
    // connect wallet with just this blockchain
    try {
      await app.pairWallet('KEEPKEY', ['eip155:1', blockchain]);
      await app.getPubkeys();
      await app.getBalances();
    } catch (error) {
      console.error('Error in onSelect:', error);
      // Handle or report error
    }
  };

  /*
      Pioneer Intent Format
  
   */


  // Handle input change for autocomplete
  const handleInputChange = (inputValue) => {
    setSearchInput(inputValue);
    setFilteredOptions(options.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    ));
  };

// Handle selection from autocomplete options
  const handleOptionSelect = (option) => {
    console.log("option: ", option)
    switch (option) {
      case 'portfolio':
        navigate('/intent/portfolio');
        break;
      case 'track':
        navigate('/intent/track');
        break;
      case 'basic':
        navigate('/intent/basic');
        break;
      case 'blockchains':
        navigate('/intent/blockchains');
        break;
      case 'paths':
        navigate('/intent/paths');
        break;
      case 'pubkeys':
        navigate('/intent/pubkeys');
        break;
      case 'balances':
        navigate('/intent/balances');
        break;
      case 'pending':
        navigate('/intent/pending');
        break;
      case 'transfer':
        navigate('/intent/transfer');
        break;
      case 'swap':
        navigate('/intent/swap');
        break;
      case 'swaps':
        navigate('/intent/swaps');
        break;
      case 'earn':
        navigate('/intent/earn');
        break;
      case 'loan':
        navigate('/intent/loan');
        break;
      default:
        console.log("No route for this option");
    }
  };

  // Function to determine which component to render based on intent
  const renderComponent = () => {
    console.log('intent: ', intent);
    let params = intent.split(':');
    let intentType = params[0];
    //parse intent and get props
    let txHash = params[1];
    switch (intentType) {
      case 'track':
        return <Track txHash={txHash} />;
      case 'portfolio':
        return <Portfolio />;
      case 'basic':
        return <Basic />;
      case 'blockchains':
        return <Blockchains onSelect={onSelect} />;
      case 'paths':
        return <Paths />;
      case 'pubkeys':
        return <Pubkeys />;
      case 'balances':
        return <Balances />;
      case 'pending':
        return <Pending />;
      case 'transfer':
        return <Transfer openModal={openModal} />;
      case 'swap':
      case 'swaps':
        return <Swap />;
      case 'earn':
        return <Earn />;
      case 'loan':
        return <Loan />;
      // Add additional cases as necessary
      default:
        return <div>No valid intent selected</div>;
    }
  };

  return (
    <Flex alignItems="center" h="100vh" justifyContent="center">
      <Box borderRadius="lg" borderWidth="1px" maxW="1200px" p={4} w="full">
        <Flex>
          {/* Left 1/3 of the card for the Pioneer element */}
          <Box p={4} w="33.33%">
            <Pioneer />
          </Box>

          {/* Right 2/3 of the card for search section */}
          <Box maxH="80vh" overflowY="auto" p={4} w="66.66%">
            {intent ? (
              // Render component based on intent
              <div>
                <Link as={RouterLink} to="/">
                  {' '}
                  {/* Link to close and navigate to base URL */}
                  <Button>X</Button>
                </Link>
                {renderComponent()}
              </div>
            ) : (
              // Render search interface
              <div>
                <Input
                  placeholder="What are you looking for?"
                  size="lg"
                  value={searchInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                />
                {filteredOptions.length > 0 && (
                  <Box>
                    {filteredOptions.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => handleOptionSelect(option)}
                        variant="ghost"
                      >
                        {option}
                      </Button>
                    ))}
                  </Box>
                )}
                <Button colorScheme="blue" mt={4}>
                  Search
                </Button>
              </div>
            )}
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Home;
