import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { FaTrash } from 'react-icons/fa'
import { LuImage, LuImagePlus } from 'react-icons/lu'
import ShortUniqueId from 'short-unique-id'
import axios from 'axios'

console.log('the right page')

const { VITE_API_URL } = import.meta.env
console.log( VITE_API_URL)

export const ListPage = () => {
  const [qrVisible, setQrVisible] = useState(false)
  const [userId, setUserId] = useState(null)
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [file, setFile] = useState()
  const [list, setList] = useState({
    id: '',
    name: 'Loading',
    description: '',
    eventDateTime: '',
    createdOn: '',
    createdBy: '',
    items: [],
  })

  const { listId } = useParams() 

  const [itemPayload, setItemPayload] = useState({
    listId: listId,
    userId: "",
    name: "",
    item: "",
    imageUrl: "",
    cloudinaryId: "",
  })

  // get userId from local storage if exists and put in state
  useEffect(() => {
    const storedId = localStorage.getItem('userId')
    if(storedId) {
      setUserId(storedId)
      setItemPayload(prev => ({...prev,
        userId: storedId
      }))
    }else {
      const idGen = new ShortUniqueId();
      const user = idGen.rnd()   
      localStorage.setItem('userId', user) 
      setUserId(user)
      setItemPayload(prev => ({...prev,
        userId: user
      }))
    }
  }, []);

  // load previous created items
  const [createdItems, setCreatedItems] = useState()
  useEffect(() => {
    const createdItems = localStorage.getItem('createdItems')
    if(createdItems) setCreatedItems(createdItems)
  }, []);

  useEffect(()=> {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
       setQrVisible(false)
     }
   };
   window.addEventListener('keydown', handleEsc);
   return () => {
     window.removeEventListener('keydown', handleEsc);
   };
  },[])

  // parse date and time into state
  useEffect(() => {
    let localDateTime
    if(list.eventDateTime) {
      localDateTime = new Intl.DateTimeFormat('en-us', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).format(new Date(list.eventDateTime))
      setEventDate(localDateTime.split('at')[0])
      setEventTime(localDateTime.split('at')[1])
    } 
  }, [list]);

  const handleAddItem = async (evt) => {
    evt.preventDefault()
    const url = `${VITE_API_URL}/addItem`
    const formData = new FormData();
    file && formData.append("file", file);
    for(const key in itemPayload) {
      formData.append(key, itemPayload[key])
    }
    const response = await axios.put(url, formData, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
    setList(prev => ({...prev, items: response.data }))
    setFile(null)
    setItemPayload(prev => ({ ...prev,
      name: "",
      item: "",
      imageUrl: "",
      cloudinaryId: "",
    }))
  }

  const handleDeleteItem = async (id) => {
    const url = `${VITE_API_URL}/removeItem`
    const payload = {
      userId: userId,
      listId: listId,
      itemId: id,
    }
    const response = await axios.put(url, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    setList(prev => ({...prev, items: response.data }))
  }

  const fetchData = async () => {
    try {
      const list = await axios.get(`${VITE_API_URL}/${listId}`)
      setList(list.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, []);

  const handleFile = (e) => {
    e.target.files && setFile(e.target.files[0]);
  };

  const handleName = (e) => {
    setItemPayload(prev => ({...prev,
      name: e.target.value
    }))
  }

  const handleItem = (e) => {
    setItemPayload(prev => ({...prev,
      item: e.target.value
    }))
  }

  
  return (
    <section className='flex flex-row justify-center py-10 px-2 sm:p-10 animate-fade'>
      <div className='flex flex-col gap-4 items-center w-full sm:w-[500px] z-10'>
        <h1 className='font-bold text-3xl text-center'>{list.name}</h1>
        <span className='font-semibold text-xl text-center'>{eventDate}</span>
        <span className='font-semibold text-xl text-center'>{eventTime}</span>
        <p className='font-semibold text-xl text-center'>{list.description}</p>

        {!qrVisible &&
          <button 
            className='bg-slate-500 px-4 py-2 rounded-lg text-white font-semibold'
            onClick={()=>{setQrVisible(prev => !prev)}}
          >
            Show QR Share Code
          </button>
        }

        {/* Form */}
        <form 
          onSubmit={handleAddItem}
          className='flex flex-col gap-2 sm:gap-4 w-full'>
          <div className='flex flex-col justify-between gap-4 bg-orange-400 p-4 rounded-xl'>
            <div className='flex flex-col sm:flex-row justify-between gap-4'>

              <label 
                htmlFor='itemFile'
                className='w-full sm:w-[150px] h-[150px] sm:h-auto bg-center rounded-lg bg-orange-100 text-slate-500 text-5xl flex flex-row justify-center items-center bg-cover cursor-pointer'
                style={{backgroundImage: `url(${file && URL.createObjectURL(file)})`}}
              >

                <input id="itemFile" type="file" onChange={handleFile} className='hidden' />
                {!file && <LuImagePlus />}

              </label>

              <div className='self-center flex flex-col gap-2 w-full'>
                <input 
                  type='text'
                  minLength={3}
                  maxLength={21}
                  pattern='^[a-zA-Z0-9\.\-\! ]*${3,20}'
                  title='Enter between 3 and 21 letters/numbers'
                  className='font-bold text-xl sm:text-2xl p-2 text-left sm:text-right rounded-lg bg-orange-100 border-0 w-full sm:w-auto'
                  placeholder='What are you bringing?'
                  value={itemPayload.item}
                  onChange={(evt)=>handleItem(evt)}
                  required
                />

                <input 
                  type='text'
                  minLength={3}
                  maxLength={21}
                  pattern='[a-zA-Z0-9\.\-\! ]{3,20}'
                  title='Enter between 3 and 21 letters/numbers'
                  className='font-semibold text-lg sm:text-xl p-2 text-left sm:text-right rounded-xl bg-orange-100 border-0'
                  placeholder='What is your name?'
                  value={itemPayload.name}
                  onChange={(evt)=>handleName(evt)}
                  required
                />
              </div>
            </div>
            <button 
              className='bg-slate-500 px-4 py-2 rounded-lg text-white font-semibold'
            >
              Add
            </button>
          </div>
        </form>

        <ul className='flex flex-col gap-2 sm:gap-4 w-full'>
          {list.items.map((el, ind) => {
            return(
              <li 
                key={ind} 
                className='relative flex flex-row justify-between gap-4 bg-blue-200 p-4 rounded-xl'
              >
                <div 
                  className='min-w-[100px] sm:w-[150px] h-[100px] bg-cover bg-center rounded-lg bg-orange-50 text-slate-500 flex flex-row justify-center items-center text-5xl'
                  style={{backgroundImage: `url(${el.imageUrl})` }} 
                >
                  {!el.imageUrl && <LuImage />}
                </div>
                
                <div className='self-center flex flex-col'>
                  <h3 className='font-bold text-xl sm:text-2xl'>{el.item}</h3>
                  <span className='font-semibold text-lg sm:text-xl self-end'>{el.name}</span>
                </div>
                {el.userId === userId && 
                  <FaTrash 
                    className='absolute top-0 right-0 m-2 text-red-600 cursor-pointer'
                    onClick={()=>handleDeleteItem(el._id)}
                  />
                }
              </li>
            )
          })}
        </ul>
      </div>
      {qrVisible &&
        
          <div 
            className='absolute top-0 left-0 flex flex-col justify-center items-center bg-white my-8 w-full h-full z-10 animate-fadeOut gap-4'
            onClick={()=>{setQrVisible(prev => !prev)}}
          >
            <QRCode
              size={256}
              value={`https://potlucklist.netlify.app/list/${listId}`}
            />
            <span>Tap/Click/Esc to close</span>
          </div>
        }

        {createdItems?.length > 0 &&
          <>
            <h3>Previously Created Items</h3>
            <ul>
              {createdLists.map(list => {
                <li>
                  <Link to={`/list/${list.id}`}>{list.name}Add To List</Link>
                </li>
              })}
            </ul>
          </>

        }

    </section>
  )
}

export default ListPage