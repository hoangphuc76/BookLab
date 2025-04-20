import { XIcon } from "../../icons"

const NotificationsPanel = ({ notifications, onClose, onDismiss, onDismissAll }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="flex space-x-2">
            {notifications.length > 0 && (
              <button onClick={onDismissAll} className="text-sm text-gray-500 hover:text-gray-700">
                Clear all
              </button>
            )}
            <button onClick={onClose}>
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">New Booking Request</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.description || "Room booking request"}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span>{notification.date}</span>
                        {notification.time && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{notification.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button onClick={() => onDismiss(notification.id)} className="text-gray-400 hover:text-gray-600">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPanel

