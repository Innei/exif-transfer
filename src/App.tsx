import type { FC } from 'react'
import { Outlet } from 'react-router'

import { Footer } from './components/common/Footer'
import { Header } from './components/common/Header'
import { RootProviders } from './providers/root-providers'

export const App: FC = () => {
  return (
    <RootProviders>
      <Header />
      <AppLayer />
      <Footer />
    </RootProviders>
  )
}

const AppLayer = () => {
  const appIsReady = true
  return appIsReady ? <Outlet /> : <AppSkeleton />
}

const AppSkeleton = () => {
  return null
}
export default App
