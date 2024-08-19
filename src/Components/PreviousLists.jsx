import { useEffect } from "react";
import { Link, useParams } from 'react-router-dom'

const { VITE_ENV, VITE_DOMAIN} = import.meta.env

// loads previous lists
// usage 
  {/* <PreviousLists
  previousLists={previousLists} 
  setPreviousLists={setPreviousLists}
  /> */}

const PreviousLists = ({previousLists, setPreviousLists}) => {
  useEffect(() => {
    const prev = localStorage.getItem('previousLists')
    if(prev) { 
      setPreviousLists(JSON.parse(prev)) 
    }else {
      localStorage.setItem('previousLists', JSON.stringify([]))
    } 
  }, []);

  return (
    <>
      {previousLists?.length > 0 &&
        <section className='w-full sm:w-9/12 md:w-1/2 px-2 mb-10'>
          <h3 className='mb-3 text-2xl font-bold'>Previous Events</h3>
          <ul className='flex flex-col gap-1'>
            {previousLists.map((list, ind) => {
              return (
                <li key={ind} className='bg-emerald-400 w-fit p-3 rounded-md'>
                  <Link 
                    to={`${VITE_ENV === 'dev' ? 'http://localhost:5173' : VITE_DOMAIN}/list/${list.listId}`}
                    className="font-semibold text-lg"
                  >
                      {list.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      }
    </>  
  )
}

export default PreviousLists