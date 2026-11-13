import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'

import AppRoutes from './routes/AppRoutes'
import adminData from './mocks/adminData.json'

export default function App() {
  const [shops, setShops] = useState(adminData.shops)

  return (
    <BrowserRouter>
      <AppRoutes shops={shops} setShops={setShops} />
    </BrowserRouter>
  )
}