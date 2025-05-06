import { useCallback, memo } from "react"
import { StarIcon } from "../../icons"

const StarRating = ({rating}) => {
    const renderStars = useCallback(() => {
    const stars = []
    const fullStars = Math.floor(rating)
    const decimalPart = rating - fullStars

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} fillPercentage={100} />)
      } else if (i === fullStars && decimalPart > 0) {
        stars.push(<StarIcon key={i} fillPercentage={decimalPart * 100} />)
      } else {
        stars.push(<StarIcon key={i} fillPercentage={0} />)
      }
    }

    return stars
  }, [rating])

  return <div className="flex space-x-1">{renderStars()}</div>
}

export default memo(StarRating)