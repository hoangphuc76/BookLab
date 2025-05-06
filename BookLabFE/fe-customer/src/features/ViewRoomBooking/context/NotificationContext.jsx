import { createContext, useContext, useState, useEffect } from "react"
import { useBookingNotifications } from "../../../services/BookingNotificationService"

const NotificationContext = createContext({
  hasNewNotifications: false,
  notificationCount: 0,
  markAllAsRead: () => {},
})

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const { notifications, dismissAllNotifications } = useBookingNotifications()
  const [hasNewNotifications, setHasNewNotifications] = useState(false)

  useEffect(() => {
    if (notifications.length > 0) {
      setHasNewNotifications(true)
    }
  }, [notifications])

  const markAllAsRead = () => {
    setHasNewNotifications(false)
    dismissAllNotifications()
  }

  return (
    <NotificationContext.Provider
      value={{
        hasNewNotifications,
        notificationCount: notifications.length,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}