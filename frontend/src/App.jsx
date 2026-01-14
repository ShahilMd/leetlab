import React, { useEffect } from 'react'
import  {Route,Routes, Navigate} from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import {Toaster} from 'react-hot-toast'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'
import Layout from './components/Layout'
import AdminRoute from './components/AdminRoute'
import AddProblem from './pages/AddProblem'

function App() {

  const {authUser,checkAuth,isCheckingAuth} = useAuthStore();

  useEffect(() => {
    checkAuth()
  },[checkAuth])

  if(isCheckingAuth && !authUser){
    return(
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin'/>
      </div>
    )
  }

  return (
     <div className="flex flex-col items-center justify-start  ">
      {/* <Navbar/> */}
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
        </Route>
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />

        {/* <Route
          path="/problem/:id"
          element={authUser ? <ProblemPage /> : <Navigate to="/login" />}
        /> */}
        <Route element={<AdminRoute />}>
          <Route
            path="/add-problem"
            element={authUser ? <AddProblem /> : <Navigate to="/login" />}
          />
        </Route>
{/* 
        <Route
          path="/profile"
          element={authUser ? <Profile /> : <Navigate to="/login" />}
        /> */}
      </Routes>
    </div>  
  )
}

export default App