import { registerRootComponent } from 'expo'
import Constants from 'expo-constants'
import { initializeNeonClient } from '@journaling-app/shared'
import App from './src/App'

const neonUrl = Constants.expoConfig?.extra?.neonDatabaseUrl
if (neonUrl) {
  initializeNeonClient(neonUrl)
}

registerRootComponent(App)
