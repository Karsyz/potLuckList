import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider
} from 'react-router-dom'

// Pages
import Index from './Pages/Index'
import ListPage from './Pages/ListPage'
import Error from './Pages/Error'


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<Index />} />
      <Route path='/list/:listId' element={<ListPage />} />
      <Route path='*' element={<Error />} />
    </>
  )
)


export default function App() {
  return (
    <RouterProvider router={router} />
  )
}