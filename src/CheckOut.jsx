import React,{useState,useEffect, useContext} from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { amountcontext } from './Cart';
import Loader from './Loader';
import cross from "./assets/vectors2/Shape.png"

import { ToastContainer, Zoom, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';







export default function CheckOut() {
  
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const {total,show,setshow,CartItems,setCartItems,notification,setNotification}=useContext(amountcontext);
  
  // 
  
  useEffect(() => {
    // toast.success("hello bhaii",{

    //   position: 'top-center',
    //         autoClose: 2000,
    //         hideProgressBar: true,
    //         closeOnClick: true,
    //         pauseOnHover: true,
    //         draggable: true,
    //         transition:Zoom,
    //         theme: 'light',
      
    // })
    // This is where you send the cart total to your backend
        fetch('https://part2-fawn.vercel.app/create-payment-intent', {
          method: 'POST',
          body: JSON.stringify({ amount:total*100 }), // Example: Pass the amount in cents (e.g., $20.00)
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((data) =>{
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                console.log("Success")
              } else {
                setErrorMessage('Client secret not received');
              }
          })
          .catch((error) => setErrorMessage('Failed to load client secret'));
        }, []);
      
      
        const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) return;
        
        setLoading(true);
        const cardElement = elements.getElement(CardElement);
        
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });
        
        setLoading(false);
        
        if (error) {
          setErrorMessage(error.message);
          toast.error("Something Went Wrong !")
        } else if (paymentIntent.status === 'succeeded') {
          // alert('Payment successful!');
          toast.success("Paymenmt Successful !",{
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            transition:Zoom,
            theme: 'light', // Available themes: 'light', 'dark', 'colored')
          })

          setshow(false)
          setNotification(false);
          setCartItems([]);
          // console.log("Cart emptied:", CartItems)
          setLoading(false);
        }
      };

      
      
  return (

    <>
    <div className={` w-full h-[100vh] fixed md:top-0 left-0 z-50 bg-gray-300 bg-opacity-50 flex justify-center md:items-center`}>

<div className=' fixed top-56 md:static w-[90%] md:w-[50%] z-50 flex flex-col items-center justify-around rounded bg-white min-h-[30vh] py-3 md:min-h-[40vh] md:py-5 shadow-md'>

<div className='w-full relative flex justify-end px-4'>
  <img src={cross} onClick={()=>{
    setshow(false)
    setNotification(false)

  }} className='hover:cursor-pointer' alt="" />
</div>

<form onSubmit={handleSubmit} className=' w-full flex flex-col items-center gap-10'>
      <h2 className='font-bold'>Checkout</h2>
      <CardElement className='w-[90%]' 

options={{
    style:{
        base:{
            backgroundColor: '#fff',
            '::placeholder': {
                color: '#aab7c4',
            },
        }}
    }}
    
    />
      {errorMessage && <div className="error">{errorMessage}</div>}
      <button type="submit" disabled={!stripe || loading} className='bg-black opacity-80 text-white rounded px-2 py-1 flex justify-center w-[90%] hover:scale-[102%] hover:opacity-100 transition-all duration-1000'>
        {loading ? <Loader/> : 'Pay Now'}
      </button>
    </form>
    </div>    
    </div>
    
    </>
  )
}
