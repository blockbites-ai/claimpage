import { sequence } from '0xsequence'
import { JsonRpcProvider, Contract } from 'ethers'
import { useEffect, useState } from 'react'
import { SequenceIndexer } from '@0xsequence/indexer'
import { AuthForm } from './components/AuthForm'
import { supabase } from './lib/supabase'
import { Dashboard } from './components/Dashboard'

// ABI mínimo para verificar balance de NFTs
const NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  // Funciones adicionales de ERC721Enumerable
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)"
]

const NFT_CONTRACT_ADDRESS = "0x17c396a86950f43aee81bc447f7db707ef30b1d8"
const ARBITRUM_SEPOLIA_CHAIN_ID = 421614

function App() {
  const [wallet, setWallet] = useState<any>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [nftBalance, setNftBalance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [email, setEmail] = useState('')
  const [userData, setUserData] = useState({
    email: '',
    balance: 0,
    hasClaimed: false
  })
  
  // Definir la interfaz para los NFTs
  interface NFTData {
    image: string
    name: string
    description: string
    tokenId: string | undefined
  }
  
  const [nftImages, setNftImages] = useState<NFTData[]>([])

  useEffect(() => {
    const initWallet = async () => {
      try {
        // Inicializar Sequence
        const wallet = await sequence.initWallet("AQAAAAAAAKDv534ryf8T3Mz7NWCSnYThKUg")
        console.log('Wallet initialized:', wallet)
        setWallet(wallet)

        // Verificar si ya está conectado
        const isConnected = await wallet.isConnected()
        if (isConnected) {
          const address = await wallet.getAddress()
          setAddress(address)
          setIsConnected(true)
          checkNFTBalance(address)
        }
      } catch (error) {
        console.error('Error initializing wallet:', error)
        setError('Error al inicializar la wallet. Por favor, recarga la página.')
      }
    }

    initWallet()
  }, [])

  useEffect(() => {
    // Verificar sesión de Supabase al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      const userEmail = session?.user?.email;
      if (userEmail) {
        setEmail(userEmail);
        setUserData(prev => ({
          ...prev,
          email: userEmail,
          balance: 50,
          hasClaimed: false
        }));
      }
    });

    // Suscribirse a cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      const userEmail = session?.user?.email;
      if (userEmail) {
        setEmail(userEmail);
        setUserData(prev => ({
          ...prev,
          email: userEmail,
          balance: 50,
          hasClaimed: false
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const connect = async () => {
    if (!wallet) {
      console.error('Wallet not initialized')
      return
    }

    try {
      console.log('Connecting wallet...')
      const connectDetails = await wallet.connect({
        app: 'BlockBites NFT Verification',
        authorize: true,
        networkId: ARBITRUM_SEPOLIA_CHAIN_ID,
        settings: {
          theme: 'dark'
        }
      })
      
      console.log('Connect details:', connectDetails)
      
      if (connectDetails.connected) {
        const address = await wallet.getAddress()
        console.log('Connected address:', address)
        
        setAddress(address)
        setIsConnected(true)
        await checkNFTBalance(address)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      setError('Error al conectar la wallet. Por favor, intenta de nuevo.')
    }
  }

  const disconnect = async () => {
    if (!wallet) return
    try {
      await wallet.disconnect()
      setAddress(null)
      setIsConnected(false)
      setNftBalance(null)
      setError(null)
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      setError('Error al desconectar la wallet. Por favor, intenta de nuevo.')
    }
  }

  const getNFTsForHolder = async (address: string) => {
    try {
      console.log('Obteniendo NFTs para:', address)
      
      // Inicializar el indexer de Sequence con la configuración exacta del ejemplo
      const client = new SequenceIndexer(
        "https://arbitrum-sepolia-indexer.sequence.app",
        "AQAAAAAAAKDv534ryf8T3Mz7NWCSnYThKUg"
      )
      
      // Obtener los NFTs usando getTokenBalances incluyendo la dirección y el contrato
      const result = await client.getTokenBalances({
        accountAddress: address,
        contractAddress: NFT_CONTRACT_ADDRESS,
        includeMetadata: true
      })

      console.log('Resultado completo:', result)

      // Filtrar solo los NFTs con balance mayor a 0 y que tengan metadatos válidos
      const nfts = result.balances.filter(token => 
        BigInt(token.balance) > BigInt(0) &&
        token.tokenMetadata?.image // Solo incluir tokens que tengan una imagen
      )

      console.log('NFTs encontrados:', nfts)

      // Extraer las imágenes y metadata de los NFTs
      const nftData = nfts.map(token => ({
        image: token.tokenMetadata?.image || '',
        name: token.tokenMetadata?.name || `NFT #${token.tokenID}`,
        description: token.tokenMetadata?.description || '',
        tokenId: token.tokenID
      }))

      console.log('Datos de NFTs procesados:', nftData)
      setNftImages(nftData)

    } catch (error) {
      console.error('Error específico obteniendo NFTs:', error)
      setError('Error al cargar las imágenes de los NFTs')
    }
  }

  const checkNFTBalance = async (walletAddress: string) => {
    setIsChecking(true)
    setError(null)
    try {
      console.log('Checking NFT balance for address:', walletAddress)
      const provider = new JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc')
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider)
      const balance = await nftContract.balanceOf(walletAddress)
      console.log('NFT balance:', balance)
      setNftBalance(Number(balance))
      
      if (Number(balance) > 0) {
        await getNFTsForHolder(walletAddress)
        setShowAuthForm(true) // Mostrar formulario de autenticación si tiene NFTs
      }
    } catch (error) {
      console.error('Error checking NFT balance:', error)
      setError('Error al verificar los NFTs. Por favor, intenta de nuevo.')
      setNftBalance(null)
    } finally {
      setIsChecking(false)
    }
  }

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
  }

  const handleAuthSuccess = () => {
    setUserData(prev => ({
      ...prev,
      email: email,
      balance: 50, // Establecemos el balance inicial
      hasClaimed: false
    }));
    setIsAuthenticated(true);
  }

  const truncateAddress = (address: string) => {
    if (!address) return '';
    const start = address.slice(0, 6);
    const end = address.slice(-6);
    return `${start}...${end}`;
  };

  const renderStatus = () => {
    if (isChecking) {
      return <p className="text-black">Verificando NFTs...</p>
    }

    if (nftBalance !== null) {
      if (nftBalance > 0) {
        return (
          <div className="p-4 bg-green-100 rounded-md">
            <p className="text-green-700 font-medium">
              ¡Felicitaciones, eres holder de nuestra colección!
            </p>
            <p className="text-green-600 text-sm mt-1">
              Tienes {nftBalance} NFT{nftBalance !== 1 ? 's' : ''} de BlockBites
            </p>
            {!isAuthenticated && (
              <div className="mt-4">
                <p className="text-gray-700 mb-2">Para ver tus NFTs, verifica tu email:</p>
                <AuthForm onSuccess={handleAuthSuccess} />
              </div>
            )}
            {error && (
              <p className="text-red-500 mt-2">{error}</p>
            )}
          </div>
        )
      } else {
        return (
          <div className="p-4 bg-red-100 rounded-md">
            <p className="text-red-700 font-medium">
              Lo sentimos, pero no eres holder de ningún NFT de la colección de BlockBites
            </p>
          </div>
        )
      }
    }

    return null
  }

  return (
    <>
      <img src="/bb_logo.svg" alt="Blockbites" className="logo" />
      <div className="wallet-container">
        <div className="wallet-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7Z" stroke="black" strokeWidth="2"/>
            <path d="M16 12H16.002V12.002H16V12Z" stroke="black" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {isConnected ? 'Connected Wallet' : 'Connect Wallet'}
        </div>
        {isConnected ? (
          <a 
            href="https://sequence.app/settings/profile" 
            target="_blank" 
            rel="noopener noreferrer"
            className="connect-button connected"
          >
            {truncateAddress(address || '')}
          </a>
        ) : (
          <button 
            className="connect-button"
            onClick={connect}
          >
            Connect with Sequence
          </button>
        )}
        {renderStatus()}
      </div>

      {/* Mostrar NFTs solo si está autenticado */}
      {isConnected && nftBalance && nftBalance > 0 && isAuthenticated && (
        <>
          {/* Dashboard section */}
          <Dashboard userData={userData} />
          
          {/* NFTs section */}
          <div className="nft-container">
            <h2 className="text-xl font-bold mb-4 text-center">Tus NFTs de BlockBites</h2>
            <div className="nft-grid">
              {nftImages.length > 0 ? (
                nftImages.map((nft, index) => (
                  <div key={index} className="nft-card">
                    <div className="nft-image-container">
                      <img 
                        src={nft.image} 
                        alt={nft.name}
                        className="nft-image"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/nft-placeholder.png';
                        }}
                      />
                      <div className="nft-token-id">
                        #{nft.tokenId}
                      </div>
                    </div>
                    <div className="nft-info">
                      <h3 className="nft-name">{nft.name}</h3>
                      {nft.description && (
                        <p className="nft-description">{nft.description}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center p-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Cargando tus NFTs...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default App
