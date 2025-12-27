import { ComponentsShowcase } from './pages/ComponentsShowcase'
import { LoginPage } from './pages/LoginPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element= {<LoginPage/>} />
        <Route path='/showcase' element= {<ComponentsShowcase/>} />
      </Routes>
    </BrowserRouter>
  )
}



export default App
