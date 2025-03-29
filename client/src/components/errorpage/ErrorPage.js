import React from 'react'
import { useRouteError } from 'react-router-dom'
function ErrorPage() {
    let error=useRouteError();
    console.log(error)
  return (
    <div className='text-danger text-center'>
        <h1>Oops!</h1>
        <p>
            unexpected Error
        </p>
        <p>{error.statusText}</p>
    </div>
  )
}

export default ErrorPage