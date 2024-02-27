// Import React as these functions return JSX elements
import { Avatar, AvatarBadge, Image } from '@chakra-ui/react';

import KeepKeyImagePng from '../../../../public/png/keepkey.png';
import KeplerImagePng from '../../../../public/png/keplr.png';
import LedgerImagePng from '../../../../public/png/ledger.png';
import MetaMaskImagePng from '../../../../public/png/metamask.png';
import pioneerImagePng from '../../../../public/png/pioneer.png';
import XDEFIImagePng from '../../../../public/png/XDEFI.png';
import wcImagePng from '../../../../public/svg/wc.svg';

const icons: any = {
  metamask: MetaMaskImagePng,
  keepkey: KeepKeyImagePng,
  native: pioneerImagePng,
  keplr: KeplerImagePng,
  xdefi: XDEFIImagePng,
  ledger: LedgerImagePng,
  wc: wcImagePng,
};

export const getWalletContent = (walletType: string) => {
  const icon = icons[walletType.toLowerCase()];
  return <Avatar src={icon} />;
};

export const getWalletBadgeContent = (walletType: string, size?: string) => {
  const icon = icons[walletType.toLowerCase()];

  if (!size) size = '1.25em';
  if (icon) {
    return (
      <AvatarBadge boxSize={size}>
        <Image rounded="full" src={icon} />
      </AvatarBadge>
    );
  } else {
    return <AvatarBadge bg="green.500" boxSize="1.25em" />;
  }
};

export {
  KeepKeyImagePng,
  KeplerImagePng,
  LedgerImagePng,
  MetaMaskImagePng,
  pioneerImagePng,
  wcImagePng,
  XDEFIImagePng,
};
