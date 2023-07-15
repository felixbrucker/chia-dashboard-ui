export enum WalletType {
  standard = 0,
  atomicSwap = 2,
  authorizedPayee = 3,
  multiSig = 4,
  custody = 5,
  cat = 6,
  recoverable = 7,
  did = 8,
  plotNft = 9,
  nft = 10,
  dataLayer = 11,
  dataLayerOffer = 12,
}

export function isChiaWallet(walletType: WalletType): boolean {
  switch (walletType) {
    case WalletType.standard:
    case WalletType.atomicSwap:
    case WalletType.authorizedPayee:
    case WalletType.multiSig:
    case WalletType.custody:
    case WalletType.recoverable:
    case WalletType.plotNft:
      return true
    default: return false
  }
}
