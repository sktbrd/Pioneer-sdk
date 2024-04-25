// Import React as these functions return JSX elements
import * as React from "react"
import { Avatar, AvatarBadge, Image } from '@chakra-ui/react';

let KeepKeyImagePng = '/png/keepkey.png';
let KeplerImagePng = '/png/keplr.png';
let LedgerImagePng = '/png/ledger.png';
let MetaMaskImagePng = '/png/metamask.png';
let pioneerImagePng = '/png/pioneer.png';
let XDEFIImagePng = '/png/XDEFI.png';
let wcImagePng = '/svg/wc.svg';

const icons: any = {
  metamask: MetaMaskImagePng,
  evm: MetaMaskImagePng,
  keepkey: KeepKeyImagePng,
  native: pioneerImagePng,
  keplr: KeplerImagePng,
  xdefi: XDEFIImagePng,
  ledger: LedgerImagePng,
  walletconnect: wcImagePng,
};

export const getWalletContent = (walletType: string) => {
  const icon = icons[walletType.toLowerCase()];
  return <Avatar src={icon} />;
};

export const getWalletBadgeContent = (walletType: string, size?: string) => {
  const icon = walletType ? icons[walletType.toLowerCase()] : undefined;

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
