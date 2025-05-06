import { Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const BookingNotification = ({ notifications, onViewAll, onDismiss }) => {
  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-lg shadow-lg mb-2 overflow-hidden border border-[#e5e7eb]"
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-[#5259C8] flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">New Booking Request</p>
                  <p className="text-sm text-gray-500 truncate">{notification.description || "Room booking request"}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleTimeString()}</p>
                </div>
                <button onClick={() => onDismiss(notification.id)} className="ml-4 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {notifications.length > 1 && (
        <div className="text-center mt-2">
          <button onClick={onViewAll} className="text-sm text-[#5259C8] hover:text-[#4347A5] font-medium">
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}

export default BookingNotification
