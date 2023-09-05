export interface ChiaService<T> {
  stats?: T
  lastUpdate?: string
}

export interface FarmingInfo {
  proofs: number
  passedFilter: number
  receivedAt: string
  lastUpdated: string
}

export interface FarmerStats {
  averageHarvesterResponseTime: number
  worstHarvesterResponseTime: number
  farmingInfos?: FarmingInfo[]
}

export interface PlotStats {
  count: number
  rawCapacityInGib: string
  effectiveCapacityInGib: string
}

export interface HarvesterStats {
  ogPlots: PlotStats
  nftPlots: PlotStats
  plotCount: number
  totalRawPlotCapacityInGib: string
  totalEffectivePlotCapacityInGib: string
  farmerConnectionsCount: number
}

export interface FullNodeSyncStatus {
  synced: boolean
  syncing: boolean
  syncedHeight: number
  tipHeight: number
}

export interface BlockchainState {
  difficulty: number
  spaceInGib: string
  syncStatus: FullNodeSyncStatus
}

export interface FullNodeStats {
  fullNodeConnectionsCount: number
  blockchainState: BlockchainState
}

export interface Wallet {
  id: number
  name: string
  type: number
  balance: {
    unconfirmed: string
  }
}

export interface WalletSyncStatus {
  synced: boolean
  syncing: boolean
  syncedHeight: number
}

export interface WalletStats {
  wallets: Wallet[]
  syncStatus: WalletSyncStatus
  farmedAmount: {
    lastHeightFarmed: number
  }
  fingerprint: number
}

export interface PlotJob {
  id: string
  state: string
  kSize: number
  phase: number
  progress: number
  startedAt: string
}

export interface PlotterStats {
  completedPlotsToday: number
  completedPlotsYesterday: number
  jobs: PlotJob[]
}

export interface DaemonStats {
  version: string
}

export interface Satellite {
  _id: string
  name: string
  hidden: boolean
  services: {
    daemon?: ChiaService<DaemonStats>
    farmer: ChiaService<FarmerStats>
    harvester: ChiaService<HarvesterStats>
    fullNode: ChiaService<FullNodeStats>
    wallet: ChiaService<WalletStats>
    plotter: ChiaService<PlotterStats>
  }
  version: string
  createdAt: string
  updatedAt: string
}

export interface SatelliteWithApiKey extends Satellite {
  apiKey: string
}
