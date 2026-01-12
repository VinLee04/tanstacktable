import {Outlet} from "react-router-dom"
import {motion} from 'framer-motion'

const MainLayout = () => {
    return (
        <section>
            <Outlet/>
            <motion.div
                animate={{y: ['-100%', 0, 0, 0, '100%']}}
                transition={{duration: 3, ease: 'easeInOut', delay: 1}}
                className='fixed inset-0 text-emerald-600 font-serif bg-emerald-200 z-50 leading-[100vh] text-center text-2xl md:text-3xl lg:text-7xl font-bold'>

                TANSTACK TABLE

            </motion.div>
        </section>
    );
}

export default MainLayout;