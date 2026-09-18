import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Navbar from "../navbar/Navbar";
import BottomNavbar from "../navbar/BottomNavbar";
import Footer from "../Footer";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

// A user with prefers-reduced-motion set just gets an instant, motion-free
// cross-fade instead of the slide — same content, no vestibular trigger.
const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

function ClientAppLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={shouldReduceMotion ? reducedVariants : pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
      <Footer />
      <BottomNavbar />
    </>
  );
}
export default ClientAppLayout;
