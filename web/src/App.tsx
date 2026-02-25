import { JournalProvider } from './context/JournalContext'
import { TabNavigator } from './navigation/TabNavigator'

function App() {
  return (
    <JournalProvider>
      <TabNavigator />
    </JournalProvider>
  )
}

export default App
