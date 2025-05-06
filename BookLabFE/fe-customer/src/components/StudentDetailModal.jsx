import { useEffect, useState, } from 'react'

const StudentDetailModal = ({ studentDetail }) => {
    console.log("!Open StudentDetail ? ")
    const [isLoading, setIsLoading] = useState(true);




    useEffect(() => {
        setIsLoading(false)
    }, [])
    return (
        !isLoading && <div className=" mb-4" >


            <div className="relative w-full max-w-2xl max-h-full ">

                <div onClick={(e) => {
                    e.stopPropagation()
                }} className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-700">

                    <div className='flex'>
                        <div><img className="object-cover h-[68px] w-[68px] rounded-md" src="https://i.pinimg.com/originals/d1/e8/21/d1e8219f1947a1163ec6546925a563f7.jpg" /></div>
                        <div>trung</div>
                    </div>

                    <div></div>
                </div>



            </div>
        </div >
    )
}

export default StudentDetailModal;