import { Bell } from "lucide-react"

const NotificationBadge = ({ count, onClick }) => {
  if (count === 0) {
    return (
      <button onClick={onClick} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
        <Bell className="h-5 w-5 text-gray-600" />
      </button>
    )
  }

  return (
    <button onClick={onClick} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
      <Bell className="h-5 w-5 text-gray-600" />
      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
        {count > 9 ? "9+" : count}
      </span>
    </button>
  )
}

export default NotificationBadge

