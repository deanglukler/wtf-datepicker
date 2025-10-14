import { useState } from 'react'
import './App.css'
import DatePicker from './components/DatePicker'

function App() {
  const [selectedDate, setSelectedDate] = useState(null)

  return (
    <div className="app">
      <DatePicker 
        selectedDate={selectedDate} 
        onDateSelect={setSelectedDate} 
      />
    </div>
  )
}

export default App
