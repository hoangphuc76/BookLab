import Footer from "./Footer"
import Header from "./Header"
import onewayLogo from "../assets/one-way.gif"
import { useState, useEffect } from "react"
const Layout_1 = ({ children }) => {
    const [isGoUpOpen, setIsGoUpOpen] = useState(false)

    const handleGoUp = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    useEffect(() => {
        const showGoUp = () => {
            if (window.scrollY > 200) {
                setIsGoUpOpen(true)
            }
            else {
                setIsGoUpOpen(false)
            }
        }
        window.addEventListener("scroll", showGoUp);
        return () => removeEventListener("scroll", showGoUp)
    }, [])
    return (
        <>
            <Header />
            {children}
            <Footer />
            {isGoUpOpen ? <div className=" sticky bottom-4 flex justify-end mr-8 z-30">
                <div onClick={handleGoUp} className="flex z-30 cursor-pointer rounded-full hover:bg-black border-2 border-black/70">
                    <img
                        width={60}
                        className="rounded-full pointer-cursor"
                        src={onewayLogo}
                        alt="scroll to up"
                    /></div>
            </div> : null}
        </>

    )
}
export default Layout_1