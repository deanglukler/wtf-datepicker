import { useState, useCallback } from 'react'
import './DatePicker.css'

// Pre-generate 1000 random sizes for true randomness without re-renders
const RANDOM_SIZES = Array.from({ length: 1000 }, () => {
  const sizes = ['small', 'medium', 'large']
  return sizes[Math.floor(Math.random() * sizes.length)]
})

// Pre-generate 1000 random alignments for varied vertical positioning
const RANDOM_ALIGNMENTS = Array.from({ length: 1000 }, () => {
  const alignments = ['align-top', 'align-center', 'align-bottom', 'align-stretch']
  return alignments[Math.floor(Math.random() * alignments.length)]
})

// Pre-generate 1000 random font sizes (9px to 14px) for date numbers
const RANDOM_FONT_SIZES = Array.from({ length: 1000 }, () => {
  // Generate 20 different sizes between 9px and 14px
  const minSize = 9
  const maxSize = 14
  const steps = 20
  const stepSize = (maxSize - minSize) / (steps - 1)
  const randomStep = Math.floor(Math.random() * steps)
  return Math.round(minSize + (randomStep * stepSize))
})

const DatePicker = ({ selectedDate, onDateSelect }) => {
  const [availableDates, setAvailableDates] = useState([new Date()])
  const [loadClickCount, setLoadClickCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredDate, setHoveredDate] = useState(null)
  const [tooltipData, setTooltipData] = useState(null)
  const [hoverTimeout, setHoverTimeout] = useState(null)
  const MAX_LOAD_SIZE = 5000 // Maximum dates to load at once

  const loadMoreDates = async () => {
    setIsLoading(true)
    
    // Store current scroll position and container height
    const scrollY = window.scrollY
    const containerHeight = document.querySelector('.date-cells')?.scrollHeight || 0
    
    // Add a small delay to show the spinner for large loads
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const oldestDate = availableDates[0]
    const newDates = []
    
    // Calculate how many dates to load: 7^(clickCount + 1)
    // First click: 7^1 = 7
    // Second click: 7^2 = 49  
    // Third click: 7^3 = 343
    // Fourth click: 7^4 = 2401
    // Fifth click: 7^5 = 16807 (but capped at MAX_LOAD_SIZE)
    const datesToLoad = Math.min(Math.pow(7, loadClickCount + 1), MAX_LOAD_SIZE)
    
    // Use requestAnimationFrame to prevent blocking the UI for large loads
    const batchSize = 500
    for (let batch = 0; batch < Math.ceil(datesToLoad / batchSize); batch++) {
      const startIndex = batch * batchSize + 1
      const endIndex = Math.min((batch + 1) * batchSize, datesToLoad)
      
      for (let i = startIndex; i <= endIndex; i++) {
        const newDate = new Date(oldestDate)
        newDate.setDate(oldestDate.getDate() - i)
        newDates.unshift(newDate)
      }
      
      // Yield to browser for UI updates between batches
      if (batch < Math.ceil(datesToLoad / batchSize) - 1) {
        await new Promise(resolve => requestAnimationFrame(resolve))
      }
    }
    
    setAvailableDates([...newDates, ...availableDates])
    setLoadClickCount(prev => prev + 1)
    setIsLoading(false)
    
    // Restore scroll position after content is added
    // Wait for DOM to update, then calculate and restore position
    requestAnimationFrame(() => {
      const newContainerHeight = document.querySelector('.date-cells')?.scrollHeight || 0
      const heightDifference = newContainerHeight - containerHeight
      window.scrollTo(0, scrollY + heightDifference)
    })
  }

  const handleDateClick = (date) => {
    onDateSelect(date)
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const getCellSize = (index) => {
    // Use index to get consistent random size from pre-generated array
    return RANDOM_SIZES[index % RANDOM_SIZES.length]
  }

  const getCellAlignment = (index) => {
    // Use index to get consistent random alignment from pre-generated array
    return RANDOM_ALIGNMENTS[index % RANDOM_ALIGNMENTS.length]
  }

  const getCellFontSize = (index) => {
    // Use index to get consistent random font size from pre-generated array
    return RANDOM_FONT_SIZES[index % RANDOM_FONT_SIZES.length]
  }

  const getDayOfWeek = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getHoliday = (date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // Basic holiday detection
    if (month === 1 && day === 1) return '🎉 New Year\'s Day'
    if (month === 7 && day === 4) return '🇺🇸 Independence Day'
    if (month === 12 && day === 25) return '🎄 Christmas'
    if (month === 10 && day === 31) return '🎃 Halloween'
    if (month === 2 && day === 14) return '💝 Valentine\'s Day'
    
    return null
  }

  const getSizeMode = () => {
    const dateCount = availableDates.length
    if (dateCount > 50) return 'tiny'
    if (dateCount > 15) return 'small'
    return 'normal'
  }

  const getExtendedDateInfo = (date) => {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
    const weekOfYear = Math.ceil(dayOfYear / 7)
    const isLeapYear = new Date(date.getFullYear(), 1, 29).getDate() === 29
    const daysUntilToday = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24))
    
    return {
      fullDate: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      }),
      dayOfYear,
      weekOfYear,
      isLeapYear,
      daysFromToday: Math.abs(daysUntilToday),
      isPast: daysUntilToday > 0,
      season: getSeason(date),
      zodiac: getZodiacSign(date)
    }
  }

  const getSeason = (date) => {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return 'Spring 🌸'
    if (month >= 5 && month <= 7) return 'Summer ☀️'
    if (month >= 8 && month <= 10) return 'Fall 🍂'
    return 'Winter ❄️'
  }

  const getZodiacSign = (date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries ♈'
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus ♉'
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini ♊'
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer ♋'
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo ♌'
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo ♍'
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra ♎'
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio ♏'
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius ♐'
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn ♑'
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius ♒'
    return 'Pisces ♓'
  }

  const handleMouseEnter = useCallback((date, event) => {
    // Only set hover state if no timeout is already running
    if (!hoverTimeout) {
      setHoveredDate(date)
      
      const timeout = setTimeout(() => {
        const extendedInfo = getExtendedDateInfo(date)
        setTooltipData({
          ...extendedInfo,
          x: event.clientX,
          y: event.clientY
        })
      }, 1500)
      
      setHoverTimeout(timeout)
    }
  }, [hoverTimeout])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    // Only update state if it's actually different
    if (hoveredDate || tooltipData) {
      setHoveredDate(null)
      setTooltipData(null)
    }
  }, [hoverTimeout, hoveredDate, tooltipData])

  const sizeMode = getSizeMode()

  return (
    <div className={`cell-datepicker ${sizeMode}`}>
      <button 
        className="load-more-btn" 
        onClick={loadMoreDates}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Loading...
          </>
        ) : (
          `Load More Dates (${availableDates.length} dates)`
        )}
      </button>
      
      <div className="date-cells">
        {availableDates.map((date, index) => {
          const holiday = getHoliday(date)
          return (
            <div
              key={index}
              className={`date-cell ${
                getCellSize(index)
              } ${
                getCellAlignment(index)
              } ${
                isToday(date) ? 'today' : ''
              } ${
                isSelected(date) ? 'selected' : ''
              } ${
                holiday ? 'holiday' : ''
              }`}
              onClick={() => handleDateClick(date)}
              onMouseEnter={(e) => handleMouseEnter(date, e)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="cell-content">
                <div 
                  className="date-number"
                  style={{ fontSize: `${getCellFontSize(index)}px` }}
                >
                  {date.getDate()}
                </div>
                <div className="month-year">
                  {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                {holiday && (
                  <div className="holiday">{holiday}</div>
                )}
              </div>
              
              {isSelected(date) && (
                <div className="selection-emoji">✨</div>
              )}
            </div>
          )
        })}
      </div>
      
      {tooltipData && (
        <div 
          className="date-tooltip"
          style={{
            left: tooltipData.x + 10,
            top: tooltipData.y - 10
          }}
        >
          <div className="tooltip-header">{tooltipData.fullDate}</div>
          <div className="tooltip-content">
            <div className="tooltip-row">
              <span className="tooltip-label">Day of Year:</span>
              <span className="tooltip-value">{tooltipData.dayOfYear}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Week of Year:</span>
              <span className="tooltip-value">{tooltipData.weekOfYear}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Season:</span>
              <span className="tooltip-value">{tooltipData.season}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Zodiac:</span>
              <span className="tooltip-value">{tooltipData.zodiac}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">{tooltipData.isPast ? 'Days Ago:' : 'Days Away:'}</span>
              <span className="tooltip-value">{tooltipData.daysFromToday}</span>
            </div>
            {tooltipData.isLeapYear && (
              <div className="tooltip-row leap-year">
                <span className="tooltip-value">🗓️ Leap Year</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker