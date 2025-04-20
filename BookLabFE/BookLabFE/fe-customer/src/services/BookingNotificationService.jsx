import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.SOCKET_URL

export const useBookingNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"],
    })

    // Connection event handlers
    socketInstance.on("connect", () => {
      console.log("Socket connected!")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error)
      setIsConnected(false)
    })

    // Booking notification handlers
    socketInstance.on("new_booking", (booking) => {
      console.log("New booking received:", booking)
      setNotifications((prev) => [booking, ...prev])
    })

    socketInstance.on("booking_updated", (updatedBooking) => {
      console.log("Booking updated:", updatedBooking)
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === updatedBooking.id ? updatedBooking : notification)),
      )
    })

    socketInstance.on("booking_deleted", (bookingId) => {
      console.log("Booking deleted:", bookingId)
      setNotifications((prev) => prev.filter((notification) => notification.id !== bookingId))
    })

    // Join room specific channel if roomId is provided
    const roomId = localStorage.getItem("currentRoomId") // Or get from props/context
    if (roomId) {
      socketInstance.emit("join_room", roomId)
    }

    // Store socket instance
    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      if (roomId) {
        socketInstance.emit("leave_room", roomId)
      }
      socketInstance.off("connect")
      socketInstance.off("disconnect")
      socketInstance.off("connect_error")
      socketInstance.off("new_booking")
      socketInstance.off("booking_updated")
      socketInstance.off("booking_deleted")
      socketInstance.disconnect()
    }
  }, [])

  // Function to dismiss a single notification
  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))

    // Optionally emit to server that notification was dismissed
    if (socket && isConnected) {
      socket.emit("notification_dismissed", id)
    }
  }

  // Function to dismiss all notifications
  const dismissAllNotifications = () => {
    const notificationIds = notifications.map((notification) => notification.id)
    setNotifications([])

    // Optionally emit to server that all notifications were dismissed
    if (socket && isConnected) {
      socket.emit("all_notifications_dismissed", notificationIds)
    }
  }

  // Function to manually send a booking request
  const sendBookingRequest = (bookingData) => {
    if (socket && isConnected) {
      socket.emit("create_booking", bookingData)
    } else {
      console.error("Socket not connected. Cannot send booking request.")
    }
  }

  // Function to update a booking
  const updateBooking = (bookingId, updateData) => {
    if (socket && isConnected) {
      socket.emit("update_booking", { bookingId, ...updateData })
    } else {
      console.error("Socket not connected. Cannot update booking.")
    }
  }

  // Function to cancel a booking
  const cancelBooking = (bookingId) => {
    if (socket && isConnected) {
      socket.emit("cancel_booking", bookingId)
    } else {
      console.error("Socket not connected. Cannot cancel booking.")
    }
  }

  return {
    notifications,
    isConnected,
    dismissNotification,
    dismissAllNotifications,
    sendBookingRequest,
    updateBooking,
    cancelBooking,
  }
}