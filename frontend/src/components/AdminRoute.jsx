import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Loader } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'

function AdminRoute() {

  const {authUser, isCheckingAuth} = useAuthStore()

  const navigate = useNavigate()

  if(isCheckingAuth){
    return(
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin'/>
      </div>
    )
  }

  if(!authUser || authUser.role !== 'ADMIN'){
    navigate('/')
  }
  return <Outlet/>
}

export default AdminRoute