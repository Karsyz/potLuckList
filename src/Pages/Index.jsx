import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import ShortUniqueId from 'short-unique-id';
import PreviousLists from '../Components/PreviousLists';

const { VITE_API_URL } = import.meta.env
console.log( VITE_API_URL)

const Index = () => {
  const [userId, setUserId] = useState('')
  const [creator, setCreator] = useState('')
  const [title, setTitle] = useState('')
  const [dateTime, setDateTime] = useState(new Date( Date.now() - 5*60*60*1000 ).toISOString().slice(0,16))
  const [description, setDescription] = useState('')
  const [previousLists, setPreviousLists] = useState([])
  const navigate = useNavigate()
  
  // get userId from local storage if exists and put in state
  useEffect(() => {
    if(localStorage.getItem('userId')) {
      setUserId(localStorage.getItem('userId'))
    }else {
      const idGen = new ShortUniqueId();
      const user = idGen.rnd()   
      localStorage.setItem('userId', user) 
      setUserId(user)
    }
  }, []);

  const handleCreateList = async (evt) => {
    evt.preventDefault()
    let payload = {
      userId: userId,
      createdBy: creator,
      title: title,
      description: description,
      eventDateTime: dateTime,
    }

    const url = `${VITE_API_URL}/create`
    
    try {
      const response = await axios.post(url, payload,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          // withCredentials: true
        }
      );
    
      //save list id and name to local storage
      const lsData = {
        listId: response.data._id,
        name: response.data.name,
      }
      let lsPrevUpdated = previousLists
      previousLists.push(lsData)
      localStorage.setItem('previousLists', JSON.stringify(lsPrevUpdated)) 
      

      if(response.data._id) {
        navigate(`/list/${response.data._id}`)
      }else {
        navigate('/error')
      }
      
    } catch (err) { 
      console.log(err)
    }

  }

  // textarea adaptive height
  const [textAreaHeightvalue, setTextAreaHeightvalue] = useState("");
  const textAreaRef = useRef(null)

  useEffect(() => {
    if (textAreaRef) {
      textAreaRef.current.style.height = "0px";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, textAreaHeightvalue]);

  return (
    <div className='w-full flex flex-col items-center'>
      <section className='w-full sm:w-9/12 md:w-1/2 px-2 mb-10'>
        <h1 className='text-center font-bold text-3xl mt-10'>Create A New Potluck List</h1>
        <form 
          onSubmit={handleCreateList}
          className="w-full flex flex-col justify-center gap-4 pt-10">
        
          <input 
            type='text'
            minLength={3}
            maxLength={30}
            pattern='^[a-zA-Z0-9\.\-\! ]*${3,30}'
            title='Enter between 3 and 30 letters/numbers'
            className='text-slate-900 font-semibold text-xl p-3 rounded-xl bg-orange-400/20 border-0'
            value={creator}
            placeholder='Name'
            autoComplete='name'
            required
            onChange={(e)=>setCreator(e.target.value)}
          />

          <input
            type='text'
            minLength={3}
            maxLength={30}
            pattern='^[a-zA-Z0-9\.\-\! ]*${3,30}'
            title='Enter between 3 and 30 letters/numbers'
            className='text-slate-900 font-semibold text-xl p-3 rounded-xl bg-orange-400/30 border-0'
            placeholder='Event Name'
            autoComplete='event-name'
            value={title}
            required
            onChange={(e)=>setTitle(e.target.value)}
          />

          <input 
            type='datetime-local'
            className='text-slate-900 font-semibold text-xl p-3 rounded-xl bg-orange-400/40 border-0'
            value={dateTime}
            required
            onChange={(e)=>setDateTime(e.target.value)}
          />

          <textarea 
            className='text-slate-900 font-semibold text-xl p-3 rounded-xl bg-orange-400/60 border-0 min-h-[150px]'
            placeholder='Description / Notes / Instructions (optional)'
            maxLength={1000}
            value={description} 
            ref={textAreaRef}
            rows={1}
            onChange={(e)=>{
              setTextAreaHeightvalue(e)
              setDescription(e.target.value)
            }}
          />
        
          <button 
            className="bg-blue-500 text-white text-xl font-bold px-6 py-4 rounded-lg drop-shadow-lg"
          >
            Create A Potluck List
          </button>
        </form>
      </section>

      <PreviousLists
        previousLists={previousLists} 
        setPreviousLists={setPreviousLists}
      />
      
    </div>
  )
}

export default Index